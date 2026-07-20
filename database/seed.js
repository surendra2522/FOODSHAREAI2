import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Define schemas directly in the seed script to allow independent database folder operations
const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: { type: String, select: false },
  role: String,
  organization: String,
  address: String,
  createdAt: { type: Date, default: Date.now },
});

const donationSchema = new mongoose.Schema({
  title: String,
  description: String,
  foodType: String,
  quantity: String,
  expiryTime: Date,
  pickupAddress: String,
  latitude: Number,
  longitude: Number,
  donor: mongoose.Schema.Types.ObjectId,
  status: { type: String, default: 'available' },
  claimedBy: mongoose.Schema.Types.ObjectId,
  createdAt: { type: Date, default: Date.now },
});

// Pre-save hashing for credentials
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

const User = mongoose.model('User', userSchema);
const Donation = mongoose.model('Donation', donationSchema);

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../backend/.env') });

const seedDatabase = async () => {
  const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/foodshare';
  
  console.log(`Connecting to database: ${mongoUri}`);
  try {
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB. Starting database cleaning...');

    // Clear existing data
    await User.deleteMany({});
    await Donation.deleteMany({});
    console.log('Cleared existing users and listings.');

    // Create Donors
    const donor1 = new User({
      name: 'Fresh Foods Grocer',
      email: 'donor@foodshare.com',
      password: 'password123',
      role: 'donor',
      organization: 'Fresh Foods Inc.',
      address: '200 Emerald Way, Green City',
    });
    await donor1.save();

    const donor2 = new User({
      name: 'Daily Bread Bakery',
      email: 'bakery@foodshare.com',
      password: 'password123',
      role: 'donor',
      organization: 'Daily Bread Bakers',
      address: '45 Yeast Boulevard, Flour Town',
    });
    await donor2.save();

    // Create Charity
    const charity = new User({
      name: 'Mercy Soup Kitchen',
      email: 'charity@foodshare.com',
      password: 'password123',
      role: 'charity',
      organization: 'Mercy Foundation',
      address: '88 Kindness Road, Care City',
    });
    await charity.save();

    console.log('Created accounts:');
    console.log(' - Donor Account: donor@foodshare.com / password123');
    console.log(' - Charity Account: charity@foodshare.com / password123');

    // Create Listings
    const list1 = new Donation({
      title: 'Fresh Veggies and Fruits Box',
      description: 'Mixed crate of organic tomatoes, cucumbers, apples, and bananas. Perfect condition.',
      foodType: 'produce',
      quantity: '15 kg',
      expiryTime: new Date(Date.now() + 8 * 60 * 60 * 1000), // 8 hours from now
      pickupAddress: donor1.address,
      latitude: 17.4129,
      longitude: 78.4452,
      donor: donor1._id,
      status: 'available',
    });
    await list1.save();

    const list2 = new Donation({
      title: 'Assorted Sourdough Loaves',
      description: 'Freshly baked sourdough bread and baguettes. Great for dinner services.',
      foodType: 'bakery',
      quantity: '20 loaves',
      expiryTime: new Date(Date.now() + 16 * 60 * 60 * 1000),
      pickupAddress: donor2.address,
      latitude: 17.3984,
      longitude: 78.5020,
      donor: donor2._id,
      status: 'available',
    });
    await list2.save();

    const list3 = new Donation({
      title: 'Prepared Vegetarian Rice Trays',
      description: 'Catering containers of steamed jasmine rice and fried mixed vegetables.',
      foodType: 'prepared',
      quantity: '10 servings',
      expiryTime: new Date(Date.now() + 3 * 60 * 60 * 1000),
      pickupAddress: donor1.address,
      latitude: 17.4129,
      longitude: 78.4452,
      donor: donor1._id,
      status: 'claimed',
      claimedBy: charity._id,
    });
    await list3.save();

    console.log('Created 3 starter listings (2 available, 1 claimed).');
    console.log('Database seeding complete!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();
