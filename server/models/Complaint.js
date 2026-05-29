import mongoose from 'mongoose';

const complaintSchema = new mongoose.Schema(
  {
    ticketId: { type: String, required: true, unique: true, index: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    category: { type: String, required: true },
    image: { type: String, default: '' },
    status: { type: String, enum: ['Pending', 'In Progress', 'Resolved'], default: 'Pending' },
    priority: { type: String, enum: ['Low', 'Medium', 'High', 'Critical'], default: 'Medium' },
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    adminReply: { type: String, default: '' },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    thread: [
      {
        authorRole: { type: String, enum: ['student', 'admin'], required: true },
        message: { type: String, required: true },
        createdAt: { type: Date, default: Date.now }
      }
    ]
  },
  { timestamps: true }
);

export default mongoose.models.Complaint || mongoose.model('Complaint', complaintSchema);