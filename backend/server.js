import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/db.js';
// Trigger nodemon reload 4
import User from './models/User.js';

// Route files
import authRoutes from './routes/auth.js';
import donationRoutes from './routes/donations.js';
import adminRoutes from './routes/admin.js';

// Load env vars
dotenv.config();

// Connect to database
connectDB();

// Seed default admin user if none exists
const seedAdmin = async () => {
  try {
    const adminExists = await User.findOne({ email: 'admin@foodshare.com' });
    if (!adminExists) {
      await User.create({
        name: 'System Admin',
        email: 'admin@foodshare.com',
        password: 'admin123',
        role: 'admin',
        address: 'HQ Terminal 1',
      });
      console.log('Seeded default admin account: admin@foodshare.com / admin123');
    }
  } catch (err) {
    console.warn('DB seed check skipped: MongoDB connection is likely in fallback mock mode.', err.message);
  }
};
seedAdmin();

const app = express();

// Enable CORS for frontend requests
app.use(cors({
  origin: '*', // Allow all origins for testing/development flexibility
  credentials: true
}));

// Body parser
app.use(express.json());

// Mount routers
app.use('/api/auth', authRoutes);
app.use('/api/donations', donationRoutes);
app.use('/api/admin', adminRoutes);

// Root route
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to the FoodShare AI Core Logistics Telemetry API',
    status: 'online',
    version: '1.0.0'
  });
});

// Custom 404 handler
app.use((req, res, next) => {
  res.status(404).json({ message: `Resource not found: ${req.originalUrl}` });
});

// Custom Global Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    message: err.message || 'An internal telemetry server error occurred',
    error: process.env.NODE_ENV === 'development' ? err.stack : {}
  });
});

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log(`Unhandled Rejection Error: ${err.message}`);
  // Keep server running for dev mode
});
