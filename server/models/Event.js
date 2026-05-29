import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    banner: { type: String, default: '' },
    eventDate: { type: Date, required: true },
    venue: { type: String, default: '' },
    priority: { type: String, enum: ['Normal', 'Featured'], default: 'Normal' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    registrations: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
  },
  { timestamps: true }
);

export default mongoose.models.Event || mongoose.model('Event', eventSchema);