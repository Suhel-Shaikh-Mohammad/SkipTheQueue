import mongoose from 'mongoose';

const appointmentSchema = new mongoose.Schema(
  {
    customerName: {
      type: String,
      required: true,
      trim: true
    },
    customerPhone: {
      type: String,
      required: true
    },
    barber: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Barber',
      required: true
    },
    appointmentDate: {
      type: Date,
      required: true
    },
    timeSlot: {
      type: String,
      required: true
    },
    service: {
      type: String,
      enum: ['Hair Cut', 'Shave', 'Hair Color', 'Beard Trim', 'Full Service'],
      default: 'Hair Cut'
    },
    status: {
      type: String,
      enum: ['Pending', 'Confirmed', 'Completed', 'Cancelled'],
      default: 'Pending'
    },
    notes: {
      type: String,
      default: ''
    }
  },
  { timestamps: true }
);

appointmentSchema.index({ barber: 1, appointmentDate: 1, timeSlot: 1}, {unique: true});

export default mongoose.model('Appointment', appointmentSchema);