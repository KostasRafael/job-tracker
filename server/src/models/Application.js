import mongoose from 'mongoose';

export const STATUSES = ['wishlist', 'applied', 'interview', 'offer', 'rejected'];

const applicationSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    company: { type: String, required: true, trim: true, maxlength: 100 },
    role: { type: String, required: true, trim: true, maxlength: 100 },
    url: { type: String, trim: true },
    location: { type: String, trim: true },
    salary: { type: Number, min: 0 },
    status: { type: String, enum: STATUSES, default: 'wishlist' },
    notes: { type: String, maxlength: 2000 },
    appliedAt: { type: Date },
    position: { type: Number, default: 0 },
  },
  { timestamps: true }
);

applicationSchema.index({ user: 1, status: 1, position: 1 });

export default mongoose.model('Application', applicationSchema);