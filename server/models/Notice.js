import mongoose from 'mongoose';

const noticeSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    targetCourse: { type: String, default: 'Entire College' },
    targetSemester: { type: String, default: 'All Semesters' },
    fileUrl: { type: String, default: '' },
    priority: { type: String, enum: ['Normal', 'Important', 'Urgent'], default: 'Normal' },
    pinned: { type: Boolean, default: false },
    scheduledFor: { type: Date },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  },
  { timestamps: true }
);

export default mongoose.models.Notice || mongoose.model('Notice', noticeSchema);