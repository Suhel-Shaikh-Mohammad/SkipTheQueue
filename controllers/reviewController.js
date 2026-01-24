import Review from '../models/review.js';
import Appointment from '../models/appointment.js';
import Barber from '../models/barber.js';

// Create a new review
export const createReview = async (req, res) => {
  try {
    const { appointmentId, rating, comment } = req.body;

    // Validate required fields
    if (!appointmentId || !rating) {
      return res.status(400).json({
        success: false,
        message: 'appointmentId and rating are required'
      });
    }

    // Validate rating range
    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be between 1 and 5'
      });
    }

    // Find the appointment
    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    // Check if appointment belongs to the logged-in user
    if (appointment.user.toString() !== req.userId) {
      return res.status(403).json({
        success: false,
        message: 'You can only review your own appointments'
      });
    }

    // Check if appointment is completed
    if (appointment.status !== 'Completed') {
      return res.status(400).json({
        success: false,
        message: 'You can only review completed appointments'
      });
    }

    // Check if review already exists for this appointment
    const existingReview = await Review.findOne({ appointment: appointmentId });
    if (existingReview) {
      return res.status(409).json({
        success: false,
        message: 'You have already reviewed this appointment'
      });
    }

    // Create the review
    const review = await Review.create({
      user: req.userId,
      barber: appointment.barber,
      appointment: appointmentId,
      rating,
      comment: comment || ''
    });

    // Update barber's average rating
    await updateBarberRating(appointment.barber);

    const populatedReview = await Review.findById(review._id)
      .populate('user', 'username email')
      .populate('barber', 'name specialization');

    res.status(201).json({
      success: true,
      message: 'Review created successfully',
      data: populatedReview
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get all reviews for a specific barber
export const getBarberReviews = async (req, res) => {
  try {
    const barberId = req.params.barberId;
    const limit = Math.min(parseInt(req.query.limit, 10) || 20, 100);
    const skip = parseInt(req.query.skip, 10) || 0;

    const reviews = await Review.find({ barber: barberId })
      .populate('user', 'username')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Review.countDocuments({ barber: barberId });

    res.status(200).json({
      success: true,
      count: reviews.length,
      total,
      data: reviews
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get all reviews by a specific user
export const getUserReviews = async (req, res) => {
  try {
    const userId = req.params.userId;
    const limit = Math.min(parseInt(req.query.limit, 10) || 20, 100);
    const skip = parseInt(req.query.skip, 10) || 0;

    // Users can only view their own reviews unless admin/barber
    if (req.userRole === 'user' && userId !== req.userId) {
      return res.status(403).json({
        success: false,
        message: 'You can only view your own reviews'
      });
    }

    const reviews = await Review.find({ user: userId })
      .populate('barber', 'name specialization')
      .populate('appointment', 'appointmentDate service')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Review.countDocuments({ user: userId });

    res.status(200).json({
      success: true,
      count: reviews.length,
      total,
      data: reviews
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update a review
export const updateReview = async (req, res) => {
  try {
    const reviewId = req.params.id;
    const { rating, comment } = req.body;

    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    // Check ownership
    if (review.user.toString() !== req.userId) {
      return res.status(403).json({
        success: false,
        message: 'You can only update your own reviews'
      });
    }

    // Validate rating if provided
    if (rating && (rating < 1 || rating > 5)) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be between 1 and 5'
      });
    }

    // Update fields
    if (rating) review.rating = rating;
    if (comment !== undefined) review.comment = comment;

    await review.save();

    // Recalculate barber rating if rating changed
    if (rating) {
      await updateBarberRating(review.barber);
    }

    const updatedReview = await Review.findById(reviewId)
      .populate('user', 'username email')
      .populate('barber', 'name specialization');

    res.status(200).json({
      success: true,
      message: 'Review updated successfully',
      data: updatedReview
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete a review
export const deleteReview = async (req, res) => {
  try {
    const reviewId = req.params.id;

    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    // Check ownership (users can delete own, admins can delete any)
    if (req.userRole === 'user' && review.user.toString() !== req.userId) {
      return res.status(403).json({
        success: false,
        message: 'You can only delete your own reviews'
      });
    }

    const barberId = review.barber;
    await Review.findByIdAndDelete(reviewId);

    // Update barber's rating after deletion
    await updateBarberRating(barberId);

    res.status(200).json({
      success: true,
      message: 'Review deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Helper function to update barber's average rating
const updateBarberRating = async (barberId) => {
  try {
    const reviews = await Review.find({ barber: barberId });
    
    if (reviews.length === 0) {
      await Barber.findByIdAndUpdate(barberId, {
        averageRating: 0,
        totalReviews: 0
      });
      return;
    }

    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = totalRating / reviews.length;

    await Barber.findByIdAndUpdate(barberId, {
      averageRating: parseFloat(averageRating.toFixed(2)),
      totalReviews: reviews.length
    });
    
  } catch (error) {
    console.error('Error updating barber rating:', error);
  }
};
