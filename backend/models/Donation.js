import mongoose from 'mongoose';

const donationSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a donation title'],
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  foodType: {
    type: String,
    required: [true, 'Please add a food type'],
    enum: ['produce', 'prepared', 'bakery', 'dairy', 'meat', 'pantry'],
    lowercase: true,
    trim: true,
    set: v => v ? v.toLowerCase().trim() : v,
  },
  quantity: {
    type: String,
    required: [true, 'Please add a quantity'],
  },
  predictedSurplus: {
    type: String,
  },
  expiryTime: {
    type: Date,
    required: [true, 'Please add an expiration date & time'],
  },
  pickupAddress: {
    type: String,
    required: [true, 'Please add a pickup address'],
  },
  latitude: {
    type: Number,
  },
  longitude: {
    type: Number,
  },
  donor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  status: {
    type: String,
    enum: ['available', 'claimed', 'completed', 'expired', 'Posted', 'AI Verified', 'NGO Accepted', 'Picked Up', 'In Transit', 'Delivered'],
    default: 'available',
  },
  claimedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Donation = mongoose.model('Donation', donationSchema);
export default Donation;
