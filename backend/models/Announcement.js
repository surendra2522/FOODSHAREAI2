import mongoose from 'mongoose';

const announcementSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add an announcement title'],
    trim: true,
  },
  content: {
    type: String,
    required: [true, 'Please add announcement content'],
    trim: true,
  },
  type: {
    type: String,
    enum: ['info', 'warning', 'success', 'alert'],
    default: 'info',
  },
  targetAudience: {
    type: String,
    enum: ['all', 'donor', 'charity'],
    default: 'all',
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Announcement = mongoose.model('Announcement', announcementSchema);
export default Announcement;
