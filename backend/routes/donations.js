import express from 'express';
import Donation from '../models/Donation.js';
import User from '../models/User.js';
import { protect, authorize } from '../middleware/auth.js';
import { getGlobalStats, getPersonalStats } from '../services/analyticsService.js';

const router = express.Router();

// @desc    Get all active donations
// @route   GET /api/donations
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    let donations;
    if (req.user.role === 'donor') {
      donations = await Donation.find()
        .populate('donor', 'name address')
        .sort({ createdAt: -1 });
    } else {
      // Charities see available ones or ones they claimed
      donations = await Donation.find({
        $or: [
          { status: 'available' },
          { claimedBy: req.user.id },
        ],
      })
        .populate('donor', 'name address')
        .sort({ createdAt: -1 });
    }
    res.json(donations);
  } catch (error) {
    res.status(500).json({ message: 'Server database fetch error', error: error.message });
  }
});

// @desc    Create a new donation
// @route   POST /api/donations
// @access  Private (Donor only)
router.post('/', protect, authorize('donor'), async (req, res) => {
  const { title, description, foodType, quantity, predictedSurplus, expiryTime, pickupAddress, latitude, longitude } = req.body;

  let resolvedAddress = pickupAddress;
  if (!resolvedAddress && req.user && req.user.address) {
    resolvedAddress = req.user.address;
  }
  if (!resolvedAddress) {
    resolvedAddress = 'Default Donor Location';
  }

  try {
    if (!title || !title.trim()) {
      return res.status(400).json({ message: 'Title is required.' });
    }

    const numericQty = parseFloat(quantity);
    if (isNaN(numericQty) || numericQty <= 0) {
      return res.status(400).json({ message: 'Quantity must be a positive number.' });
    }

    if (expiryTime && new Date(expiryTime) <= new Date()) {
      return res.status(400).json({ message: 'Expiry time must be in the future.' });
    }

    // Validation to prevent quantity anomalies
    if (predictedSurplus && quantity) {
      const p = parseFloat(predictedSurplus);
      const q = parseFloat(quantity.match(/(\d+(\.\d+)?)/)?.[0] || 0);
      if (!isNaN(p) && !isNaN(q) && q > p) {
        return res.status(400).json({ message: 'Quantity cannot exceed predicted surplus or food prepared.' });
      }
      if (!isNaN(p) && p < 0) {
        return res.status(400).json({ message: 'Predicted surplus cannot be negative.' });
      }
    }

    const donation = await Donation.create({
      title,
      description,
      foodType: foodType ? foodType.toLowerCase().trim() : foodType,
      quantity,
      predictedSurplus,
      expiryTime,
      pickupAddress: resolvedAddress,
      latitude,
      longitude,
      donor: req.user.id,
    });

    res.status(201).json({ success: true, donation });
  } catch (error) {
    res.status(500).json({ message: 'Server database write error', error: error.message });
  }
});

// @desc    Get weekly AI intelligence stats
// @route   GET /api/donations/stats/weekly
// @access  Private
router.get('/stats/weekly', protect, async (req, res) => {
  try {
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const weeklyDonations = await Donation.countDocuments({ createdAt: { $gte: weekAgo } });
    const weeklySuccessful = await Donation.countDocuments({
      createdAt: { $gte: weekAgo },
      status: { $in: ['claimed', 'completed', 'Delivered'] }
    });
    const efficiency = weeklyDonations > 0 ? Math.round((weeklySuccessful / weeklyDonations) * 100) : 0;
    
    // Transparent AI-Assisted Prediction Logic based on real data
    const baseConfidence = 70;
    const aiConfidence = weeklyDonations > 0 ? Math.min(99, baseConfidence + (efficiency * 0.2) + (weeklySuccessful * 0.5)) : 0;
    
    const avgPickupTimeMinutes = Math.max(10, 45 - (efficiency * 0.3));

    res.json({
      weeklyDonations,
      weeklySuccessful,
      efficiency,
      aiConfidence: Math.round(aiConfidence),
      responseRate: efficiency,
      avgPickupTime: `${Math.round(avgPickupTimeMinutes)} min`,
      successProbability: Math.min(99, efficiency + (weeklySuccessful > 5 ? 10 : 0))
    });
  } catch (error) {
    res.status(500).json({ message: 'Weekly stats error', error: error.message });
  }
});

// @desc    Get dashboard metrics & impact statistics (Personal)
// @route   GET /api/donations/stats
// @access  Private
// NOTE: Must be defined before /:id to avoid route collision
router.get('/stats', protect, async (req, res) => {
  try {
    const personalStats = await getPersonalStats(req.user.id, req.user.role);
    res.json(personalStats);
  } catch (error) {
    res.status(500).json({ message: 'Server stats calculation error', error: error.message });
  }
});

// @desc    Get public analytics & impact stats
// @route   GET /api/donations/public-stats
// @access  Public
// NOTE: Must be defined before /:id to avoid route collision
router.get('/public-stats', async (req, res) => {
  try {
    const globalStats = await getGlobalStats();

    const now = new Date();
    let efficiencyDays = [];
    const donations = await Donation.find();
    for (let i = 6; i >= 0; i--) {
      const dStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
      const dEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i + 1);
      const dayDonations = donations.filter(d => new Date(d.createdAt) >= dStart && new Date(d.createdAt) < dEnd);
      const dayClaimed = dayDonations.filter(d => ['claimed', 'completed', 'Delivered'].includes(d.status));
      const eff = dayDonations.length > 0 ? Math.round((dayClaimed.length / dayDonations.length) * 100) : 0;
      efficiencyDays.push(eff);
    }

    const liveFeed = await Donation.find({ status: 'available' })
      .populate('donor', 'name organization address')
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      totalMealsSaved: globalStats.totalMeals,
      redistributionRate: globalStats.redistributionRate,
      activePartners: globalStats.activePartners,
      co2Offset: globalStats.co2PreventedKg,
      treesPlanted: globalStats.treesPlanted,
      carMilesSaved: globalStats.carMilesSaved,
      foodTypeBreakdown: globalStats.foodTypeBreakdown,
      liveFeed,
      efficiencyDays,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error computing public stats', error: error.message });
  }
});

// @desc    Claim a donation
// @route   PUT /api/donations/:id/claim
// @access  Private (Charity only)
router.put('/:id/claim', protect, authorize('charity'), async (req, res) => {
  try {
    const donation = await Donation.findById(req.params.id);

    if (!donation) {
      return res.status(404).json({ message: 'Donation listing not found' });
    }

    if (donation.status !== 'available') {
      return res.status(400).json({ message: 'This food item has already been claimed' });
    }

    donation.status = 'claimed';
    donation.claimedBy = req.user.id;
    await donation.save();

    res.json({ success: true, donation });
  } catch (error) {
    res.status(500).json({ message: 'Server database update error', error: error.message });
  }
});

// @desc    Update status of a donation
// @route   PUT /api/donations/:id/status
// @access  Private
router.put('/:id/status', protect, async (req, res) => {
  const { status } = req.body;
  try {
    const donation = await Donation.findById(req.params.id);
    if (!donation) {
      return res.status(404).json({ message: 'Donation not found' });
    }

    const isDonor = donation.donor.toString() === req.user.id;
    const isClaimingCharity =
      donation.claimedBy && donation.claimedBy.toString() === req.user.id;
    const isAdmin = req.user.role === 'admin';

    if (!isDonor && !isClaimingCharity && !isAdmin) {
      return res.status(403).json({ message: 'Not authorized to update this listing' });
    }

    donation.status = status;
    await donation.save();
    res.json({ success: true, donation });
  } catch (error) {
    res.status(500).json({ message: 'Server database update error', error: error.message });
  }
});

// @desc    Delete a donation (donor: own only | admin: any)
// @route   DELETE /api/donations/:id
// @access  Private
router.delete('/:id', protect, async (req, res) => {
  try {
    const donation = await Donation.findById(req.params.id);
    if (!donation) {
      return res.status(404).json({ message: 'Donation not found' });
    }

    const isDonorOwner = donation.donor.toString() === req.user.id;
    const isAdmin = req.user.role === 'admin';

    if (!isDonorOwner && !isAdmin) {
      return res.status(403).json({ message: 'Not authorized to delete this donation' });
    }

    await Donation.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Donation deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error deleting donation', error: error.message });
  }
});

export default router;
