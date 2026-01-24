import mongoose from 'mongoose';

const barberSchema = new mongoose.Schema(
    {
        name:{
            type: String,
            required: true,
            trim: true
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true
        },
        phone: {
            type: String,
            required: true
        },
        specialization: {
            type: String,
            default: 'General barber'
        },
        experience: {
            type: Number,
            default: 0
        },
        isActive: {
            type: Boolean,
            default: true
        },
        isOpen: {
            type: Boolean,
            default: false
        },
        bufferTime: {
            type: Number,
            default: 5
        },
        currentAppointment: {
            appointmentId: mongoose.Schema.Types.ObjectId,
            startedAt: Date,
            estimatedEndTime: Date
        },
        averageRating: {
            type: Number,
            default: 0,
            min: 0,
            max: 5
        },
        totalReviews: {
            type: Number,
            default: 0
        }
    }, { timestamps: true}
);

export default mongoose.model('Barber', barberSchema);