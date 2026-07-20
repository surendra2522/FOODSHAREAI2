import express from 'express';
import jwt from 'jsonwebtoken';
import rateLimit from 'express-rate-limit';
import User from '../models/User.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Define Rate Limiter for Authentication routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per `window` (here, per 15 minutes)
  message: { message: 'Too many attempts. Please try again later.' },
  handler: (req, res, next, options) => {
    console.warn(`[RATE LIMIT VIOLATION] IP: ${req.ip || req.connection.remoteAddress} exceeded auth limits. Path: ${req.originalUrl}`);
    res.status(options.statusCode).send(options.message);
  },
  standardHeaders: true, 
  legacyHeaders: false, 
});

// Helper to sign JWT token
const generateToken = (user) => {
  return jwt.sign(
    { 
      id: user._id, 
      name: user.name, 
      email: user.email, 
      role: user.role, 
      address: user.address 
    },
    process.env.JWT_SECRET || 'super_secret_key_1234567890',
    { expiresIn: '30d' }
  );
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
router.post('/register', authLimiter, async (req, res) => {
  const { name, email, password, organization, address } = req.body;
  // Normalise 'ngo' alias → 'charity' (the stored enum value)
  let role = req.body.role;
  if (role === 'ngo') role = 'charity';

  try {
    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    const validRoles = ['donor', 'charity', 'admin'];
    if (!role || !validRoles.includes(role)) {
      return res.status(400).json({ message: 'Please select a valid user role (Donor, NGO, or Admin).' });
    }

    const user = await User.create({
      name,
      email,
      password,
      role,
      organization,
      address,
    });

    const token = generateToken(user);

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        organization: user.organization,
        address: user.address,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Server registration error', error: error.message });
  }
});

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
router.post('/login', authLimiter, async (req, res) => {
  const { email, password } = req.body;
  // Optional: client sends the role the user selected on the UI
  let selectedRole = req.body.role;
  if (selectedRole === 'ngo') selectedRole = 'charity'; // normalise alias

  try {
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials. No account found with this email.' });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials. Please check your password.' });
    }

    if (user.isActive === false || user.isSuspended === true) {
      return res.status(403).json({ message: 'Your account is deactivated or suspended. Please contact support.' });
    }

    // Role mismatch check — only validate when the client sends a role
    if (selectedRole && user.role !== selectedRole) {
      const roleLabel = selectedRole === 'charity' ? 'NGO' : selectedRole.charAt(0).toUpperCase() + selectedRole.slice(1);
      const actualLabel = user.role === 'charity' ? 'NGO' : user.role.charAt(0).toUpperCase() + user.role.slice(1);
      return res.status(403).json({
        message: `Role mismatch: You selected "${roleLabel}" but this account is registered as "${actualLabel}". Please select the correct role.`,
      });
    }

    const token = generateToken(user);

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        organization: user.organization,
        address: user.address,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Server login error', error: error.message });
  }
});

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
router.get('/me', protect, async (req, res) => {
  try {
    res.json({ success: true, user: req.user });
  } catch (error) {
    res.status(500).json({ message: 'Server token query error', error: error.message });
  }
});

// @desc    Update user profile details
// @route   PUT /api/auth/profile
// @access  Private
router.put('/profile', protect, async (req, res) => {
  const { name, email, phone, address, profilePicture } = req.body;

  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (email && email !== user.email) {
      const emailExists = await User.findOne({ email });
      if (emailExists) {
        return res.status(400).json({ message: 'Email is already taken by another account' });
      }
      user.email = email;
    }

    if (name !== undefined) user.name = name;
    if (phone !== undefined) user.phone = phone;
    if (address !== undefined) user.address = address;
    if (profilePicture !== undefined) user.profilePicture = profilePicture;

    await user.save();

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        organization: user.organization,
        address: user.address,
        phone: user.phone || '',
        profilePicture: user.profilePicture || '',
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server profile update error', error: error.message });
  }
});

export default router;

