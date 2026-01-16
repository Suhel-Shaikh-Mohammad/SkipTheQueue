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
        }
    }, { timestamps: true}
);

export default mongoose.model('Barber', barberSchema);