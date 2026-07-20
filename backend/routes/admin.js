import express from 'express';
import mongoose from 'mongoose';
import PDFDocument from 'pdfkit';
import { createObjectCsvStringifier } from 'csv-writer';
import User from '../models/User.js';
import Donation from '../models/Donation.js';
import Announcement from '../models/Announcement.js';
import { protect, authorize } from '../middleware/auth.js';
import { getGlobalStats, calculateImpact } from '../services/analyticsService.js';

const router = express.Router();

// --- PUBLIC ROUTE FOR ANNOUNCEMENTS ---
// Get public announcements (unprotected or accessible by logged in users - let's place it before admin middleware)
router.get('/announcements/public', async (req, res) => {
  try {
    const announcements = await Announcement.find()
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 })
      .limit(10);
    res.json(announcements);
  } catch (error) {
    console.error('[DATABASE ERROR] Failed to fetch public announcements:', error);
    res.status(500).json([]);
  }
});

// Apply protect & admin authorize middleware to ALL subsequent routes in this file
router.use(protect);
router.use(authorize('admin'));

// --- USER MANAGEMENT ---

// @desc    Get all users (with optional query filter and search)
// @route   GET /api/admin/users
router.get('/users', async (req, res) => {
  const { search, role } = req.query;
  try {
    let query = {};
    if (role && role !== 'all') {
      query.role = role;
    }
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { organization: { $regex: search, $options: 'i' } }
      ];
    }
    const users = await User.find(query).select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching users', error: error.message });
  }
});

// @desc    Update user status and roles
// @route   PUT /api/admin/users/:id
router.put('/users/:id', async (req, res) => {
  const { 
    name, email, role, isActive, isSuspended, 
    ngoVerificationStatus, ngoDocumentUrl, ngoDocumentName,
    organization, address 
  } = req.body;
  
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Update fields if provided
    if (name !== undefined) user.name = name;
    if (email !== undefined) user.email = email;
    if (role !== undefined) user.role = role;
    if (isActive !== undefined) user.isActive = isActive;
    if (isSuspended !== undefined) {
      user.isSuspended = isSuspended;
      // If suspended, also make inactive
      if (isSuspended) {
        user.isActive = false;
      }
    }
    if (ngoVerificationStatus !== undefined) user.ngoVerificationStatus = ngoVerificationStatus;
    if (ngoDocumentUrl !== undefined) user.ngoDocumentUrl = ngoDocumentUrl;
    if (ngoDocumentName !== undefined) user.ngoDocumentName = ngoDocumentName;
    if (organization !== undefined) user.organization = organization;
    if (address !== undefined) user.address = address;

    await user.save();
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ message: 'Server error updating user', error: error.message });
  }
});

// @desc    Delete a user
// @route   DELETE /api/admin/users/:id
router.delete('/users/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    // Prevent self-deletion
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'Admins cannot delete themselves' });
    }
    await User.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error deleting user', error: error.message });
  }
});

// --- DONATION MANAGEMENT ---

// @desc    Get all donations
// @route   GET /api/admin/donations
router.get('/donations', async (req, res) => {
  try {
    const donations = await Donation.find()
      .populate('donor', 'name email organization')
      .populate('claimedBy', 'name email organization')
      .sort({ createdAt: -1 });
    res.json(donations);
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching donations', error: error.message });
  }
});

// @desc    Update a donation's status
// @route   PUT /api/admin/donations/:id/status
router.put('/donations/:id/status', async (req, res) => {
  const { status } = req.body;
  try {
    const donation = await Donation.findById(req.params.id);
    if (!donation) {
      return res.status(404).json({ message: 'Donation not found' });
    }
    donation.status = status;
    await donation.save();
    res.json({ success: true, donation });
  } catch (error) {
    res.status(500).json({ message: 'Server error updating donation status', error: error.message });
  }
});

// @desc    Flag expired donations dynamically
// @route   POST /api/admin/donations/flag-expired
router.post('/donations/flag-expired', async (req, res) => {
  try {
    const now = new Date();
    // Find all available donations that have passed their expiry time
    const result = await Donation.updateMany(
      { status: 'available', expiryTime: { $lt: now } },
      { status: 'expired' }
    );
    res.json({ 
      success: true, 
      message: `Successfully flagged ${result.modifiedCount} expired donations.`,
      modifiedCount: result.modifiedCount 
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error flagging expired donations', error: error.message });
  }
});

// @desc    Delete a donation listing
// @route   DELETE /api/admin/donations/:id
router.delete('/donations/:id', async (req, res) => {
  try {
    const donation = await Donation.findById(req.params.id);
    if (!donation) {
      return res.status(404).json({ message: 'Donation not found' });
    }
    await Donation.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Donation listing deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error deleting donation', error: error.message });
  }
});

// --- CLAIM/REQUESTS MANAGEMENT ---

// @desc    Get all claimed request matches
// @route   GET /api/admin/requests
router.get('/requests', async (req, res) => {
  try {
    const requests = await Donation.find({ status: { $in: ['claimed', 'completed'] } })
      .populate('donor', 'name email organization')
      .populate('claimedBy', 'name email organization')
      .sort({ updatedAt: -1 });
    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching requests', error: error.message });
  }
});

// @desc    Cancel a claim (reset status to available)
// @route   PUT /api/admin/requests/:id/cancel
router.put('/requests/:id/cancel', async (req, res) => {
  try {
    const donation = await Donation.findById(req.params.id);
    if (!donation) {
      return res.status(404).json({ message: 'Request not found' });
    }
    donation.status = 'available';
    donation.claimedBy = undefined;
    await donation.save();
    res.json({ success: true, donation });
  } catch (error) {
    res.status(500).json({ message: 'Server error updating request', error: error.message });
  }
});

// --- NOTIFICATION & ANNOUNCEMENT MANAGEMENT ---

// @desc    Get all announcements (admin panel)
// @route   GET /api/admin/announcements
router.get('/announcements', async (req, res) => {
  try {
    const announcements = await Announcement.find()
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });
    res.json(announcements);
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching announcements', error: error.message });
  }
});

// @desc    Create a new announcement
// @route   POST /api/admin/announcements
router.post('/announcements', async (req, res) => {
  const { title, content, type, targetAudience } = req.body;
  try {
    const announcement = await Announcement.create({
      title,
      content,
      type: type || 'info',
      targetAudience: targetAudience || 'all',
      createdBy: req.user._id,
    });
    res.status(201).json({ success: true, announcement });
  } catch (error) {
    res.status(500).json({ message: 'Server error creating announcement', error: error.message });
  }
});

// @desc    Delete an announcement
// @route   DELETE /api/admin/announcements/:id
router.delete('/announcements/:id', async (req, res) => {
  try {
    const announcement = await Announcement.findById(req.params.id);
    if (!announcement) {
      return res.status(404).json({ message: 'Announcement not found' });
    }
    await Announcement.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Announcement deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error deleting announcement', error: error.message });
  }
});

// --- ANALYTICS AND REPORTS ---

// @desc    Get aggregated stats and charts data for Admin Dashboard
// @route   GET /api/admin/analytics
router.get('/analytics', async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const donorCount = await User.countDocuments({ role: 'donor' });
    const charityCount = await User.countDocuments({ role: 'charity' });
    const adminCount = await User.countDocuments({ role: 'admin' });

    const availableDonations = await Donation.countDocuments({ status: 'available' });
    const claimedDonations = await Donation.countDocuments({ status: 'claimed' });
    const completedDonations = await Donation.countDocuments({ status: 'completed' });
    const expiredDonations = await Donation.countDocuments({ status: 'expired' });

    const globalStats = await getGlobalStats();

    // Generate monthly donations aggregation
    let monthlyDonations = [];
    try {
      const grouped = await Donation.aggregate([
        {
          $group: {
            _id: { $month: "$createdAt" },
            count: { $sum: 1 }
          }
        },
        { $sort: { "_id": 1 } }
      ]);
      const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      monthlyDonations = grouped.map(g => ({
        name: months[g._id - 1] || `Month ${g._id}`,
        donations: g.count
      }));
    } catch (aggErr) {
      console.warn('DB aggregation for monthly trend failed.');
    }

    // Top Donors list
    let topDonors = [];
    try {
      const donorAgg = await Donation.aggregate([
        { $group: { _id: "$donor", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 5 }
      ]);
      const populatedDonors = await User.populate(donorAgg, { path: "_id", select: "name email organization" });
      topDonors = populatedDonors.map(d => ({
        id: d._id?._id || 'unknown',
        name: d._id?.name || 'Anonymous',
        email: d._id?.email || '',
        organization: d._id?.organization || 'Individual',
        donationsCount: d.count
      }));
    } catch (aggErr) {
      console.warn('DB aggregation for top donors failed.');
    }

    // Most Active NGOs
    let activeNGOs = [];
    try {
      const ngoAgg = await Donation.aggregate([
        { $match: { claimedBy: { $ne: null } } },
        { $group: { _id: "$claimedBy", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 5 }
      ]);
      const populatedNGOs = await User.populate(ngoAgg, { path: "_id", select: "name email organization" });
      activeNGOs = populatedNGOs.map(n => ({
        id: n._id?._id || 'unknown',
        name: n._id?.name || 'NGO Partner',
        email: n._id?.email || '',
        organization: n._id?.organization || 'Charity Org',
        claimsCount: n.count
      }));
    } catch (aggErr) {
      console.warn('DB aggregation for top NGOs failed.');
    }

    res.json({
      users: { total: totalUsers, donors: donorCount, NGOs: charityCount, admins: adminCount },
      donations: { 
        total: globalStats.totalDonations, 
        available: availableDonations, 
        claimed: claimedDonations, 
        completed: completedDonations, 
        expired: expiredDonations,
        totalMeals: globalStats.totalMeals 
      },
      mealsShared: globalStats.totalMeals,
      co2Prevented: globalStats.co2PreventedKg,
      foodWastePrevented: globalStats.wastePreventedKg,
      monthlyDonations,
      topDonors,
      activeNGOs
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error computing stats', error: error.message });
  }
});

// --- SYSTEM DIAGNOSTIC MONITORING ---

// @desc    Get system diagnostic and health checks
// @route   GET /api/admin/system
// @access  Private (Admin)
router.get('/system', async (req, res) => {
  const sysUptime = process.uptime();
  const memoryUsed = process.memoryUsage();

  // Real MongoDB connection state
  const dbStateMap = {
    0: 'Disconnected',
    1: 'Connected',
    2: 'Connecting',
    3: 'Disconnecting',
  };
  const dbState = mongoose.connection.readyState;
  const dbStatus = dbStateMap[dbState] || 'Unknown';

  // Measure real DB round-trip latency
  let dbLatency = 'N/A';
  let dbLatencyRaw = null;
  if (dbState === 1) {
    try {
      const start = Date.now();
      await mongoose.connection.db.admin().ping();
      dbLatencyRaw = Date.now() - start;
      dbLatency = `${dbLatencyRaw}ms`;
    } catch {
      dbLatency = 'Error';
    }
  }

  res.json({
    uptime: `${Math.floor(sysUptime / 3600)}h ${Math.floor((sysUptime % 3600) / 60)}m ${Math.floor(sysUptime % 60)}s`,
    uptimeSeconds: Math.floor(sysUptime),
    memory: {
      rss: `${Math.round(memoryUsed.rss / 1024 / 1024)} MB`,
      heapTotal: `${Math.round(memoryUsed.heapTotal / 1024 / 1024)} MB`,
      heapUsed: `${Math.round(memoryUsed.heapUsed / 1024 / 1024)} MB`,
    },
    database: {
      status: dbStatus,
      latency: dbLatency,
      latencyMs: dbLatencyRaw,
      stateCode: dbState,
      uri: process.env.MONGO_URI ? process.env.MONGO_URI.replace(/:\/\/.*@/, '://***@') : 'localhost',
    },
    server: {
      status: 'Healthy',
      nodeVersion: process.version,
      environment: process.env.NODE_ENV || 'development',
    },
    checkedAt: new Date().toISOString(),
  });
});

// --- EXPORT ROUTES ---

// @desc    Export System Data as CSV
// @route   GET /api/admin/export/csv
router.get('/export/csv', async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalDonors = await User.countDocuments({ role: 'donor' });
    const totalNGOs = await User.countDocuments({ role: 'charity' });
    const donations = await Donation.find().populate('donor', 'name organization').populate('claimedBy', 'name organization').sort({ createdAt: -1 });
    
    const totalDonations = donations.length;
    const impact = calculateImpact(donations);
    const mealsShared = impact.totalMeals;
    const co2Saved = impact.co2PreventedKg;

    let csvOutput = `FOODSHARE AI EXPORT REPORT\n\n`;
    csvOutput += `EXECUTIVE SUMMARY\n`;
    csvOutput += `Total Donations,${totalDonations}\n`;
    csvOutput += `Total Meals Shared,${mealsShared}\n`;
    csvOutput += `Total NGOs,${totalNGOs}\n`;
    csvOutput += `Total Donors,${totalDonors}\n`;
    csvOutput += `CO2 Saved (kg),${co2Saved}\n\n`;

    csvOutput += `DONATION HISTORY\n`;
    csvOutput += `ID,Title,Status,Donor,Claimed By,Date\n`;
    
    donations.forEach(d => {
      csvOutput += `"${d._id}","${d.title}","${d.status}","${d.donor ? d.donor.name : 'Unknown'}","${d.claimedBy ? d.claimedBy.name : 'None'}","${new Date(d.createdAt).toLocaleDateString()}"\n`;
    });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="foodshare_report.csv"');
    res.send(csvOutput);
  } catch (error) {
    res.status(500).json({ message: 'Server error generating CSV', error: error.message });
  }
});

// @desc    Export System Data as PDF
// @route   GET /api/admin/export/pdf
router.get('/export/pdf', async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const donors = await User.countDocuments({ role: 'donor' });
    const ngos = await User.countDocuments({ role: 'charity' });
    const donations = await Donation.find().populate('donor', 'name organization').populate('claimedBy', 'name organization').sort({ createdAt: -1 });
    
    const totalDonations = donations.length;
    const completedDonations = donations.filter(d => ['claimed', 'completed', 'Delivered'].includes(d.status)).length;
    const impact = calculateImpact(donations);
    const mealsShared = impact.totalMeals;
    const co2Saved = impact.co2PreventedKg;
    const efficiency = totalDonations > 0 ? Math.round((completedDonations / totalDonations) * 100) : 0;

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="foodshare_report.pdf"');

    const doc = new PDFDocument({ margin: 50, size: 'A4' });
    doc.pipe(res);

    // Page 1: Executive Summary
    doc.fontSize(28).fillColor('#16A34A').text('FoodShareAI', { align: 'center' });
    doc.fontSize(16).fillColor('#64748b').text('Smart Surplus Food Redistribution', { align: 'center' });
    doc.moveDown(3);
    
    doc.fontSize(20).fillColor('#0f172a').text('Executive Summary', { underline: true });
    doc.moveDown();
    doc.fontSize(12).fillColor('#334155');
    doc.text(`Generated Date: ${new Date().toLocaleDateString()}`);
    doc.moveDown();
    doc.text(`Total Users on Platform: ${totalUsers}`);
    doc.text(`Active Donors: ${donors}`);
    doc.text(`Verified NGOs: ${ngos}`);
    doc.text(`Total Donations Created: ${totalDonations}`);
    
    // Page 2: Statistics
    doc.addPage();
    doc.fontSize(20).fillColor('#0f172a').text('Impact & Statistics', { underline: true });
    doc.moveDown();
    doc.fontSize(14).fillColor('#16A34A').text(`Meals Shared: ${mealsShared}`);
    doc.fillColor('#F97316').text(`CO2 Emissions Prevented: ${co2Saved} kg`);
    doc.fillColor('#0f172a').text(`Redistribution Efficiency: ${efficiency}%`);
    doc.moveDown(2);
    
    // Page 3: History & NGO Performance
    doc.addPage();
    doc.fontSize(20).fillColor('#0f172a').text('NGO Performance & Recent Donations', { underline: true });
    doc.moveDown();
    
    doc.fontSize(14).text('Recent Donations (Top 10)');
    doc.moveDown(0.5);
    doc.fontSize(10).fillColor('#475569');
    
    donations.slice(0, 10).forEach((d, i) => {
      doc.text(`${i + 1}. ${d.title} - ${d.status.toUpperCase()} (Donor: ${d.donor?.name || 'Unknown'})`);
    });
    
    doc.end();
  } catch (error) {
    if (!res.headersSent) {
      res.status(500).json({ message: 'Server error generating PDF', error: error.message });
    }
  }
});

export default router;

