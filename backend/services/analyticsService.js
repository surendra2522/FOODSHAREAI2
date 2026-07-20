import Donation from '../models/Donation.js';
import User from '../models/User.js';

export const calculateImpact = (donations) => {
  let totalMeals = 0;
  donations.forEach(d => {
    if (d.quantity) {
      const match = String(d.quantity).match(/(\d+(\.\d+)?)/);
      if (match) totalMeals += parseFloat(match[0]);
    }
  });

  const mealsShared = Math.round(totalMeals);
  const foodWastePreventedKg = mealsShared * 0.4;
  const co2PreventedKg = parseFloat((foodWastePreventedKg * 2.8).toFixed(1));
  const treesPlanted = Math.round(co2PreventedKg / 22);
  const carMilesSaved = Math.round(co2PreventedKg * 2.5);

  return {
    totalMeals: mealsShared,
    wastePreventedKg: parseFloat(foodWastePreventedKg.toFixed(1)),
    co2PreventedKg,
    treesPlanted,
    carMilesSaved
  };
};

export const getGlobalStats = async () => {
  const donations = await Donation.find().populate('donor', 'name organization');
  const impact = calculateImpact(donations);
  
  const totalDonations = donations.length;
  const claimedCount = donations.filter(d => ['claimed', 'completed', 'Delivered', 'NGO Accepted', 'Picked Up', 'In Transit'].includes(d.status)).length;
  const activeMatches = donations.filter(d => ['claimed', 'NGO Accepted', 'Picked Up', 'In Transit'].includes(d.status)).length;
  const redistributionRate = totalDonations > 0 ? Math.round((claimedCount / totalDonations) * 100) : 0;
  
  const activePartners = await User.countDocuments({ role: { $in: ['donor', 'charity'] } });
  
  const uniqueNgosList = await Donation.distinct('claimedBy', { claimedBy: { $ne: null } });
  const ngosHelped = uniqueNgosList.length;

  let foodTypeBreakdown = {};
  donations.forEach(d => {
    const type = d.foodType ? d.foodType.charAt(0).toUpperCase() + d.foodType.slice(1).toLowerCase() : 'Other';
    foodTypeBreakdown[type] = (foodTypeBreakdown[type] || 0) + 1;
  });

  return {
    ...impact,
    totalDonations,
    redistributionRate,
    activePartners,
    ngosHelped,
    activeMatches,
    foodTypeBreakdown
  };
};

export const getPersonalStats = async (userId, role) => {
  let filter = {};
  if (role === 'donor') filter = { donor: userId };
  else if (role === 'charity') filter = { claimedBy: userId };

  const donations = await Donation.find(filter);
  const impact = calculateImpact(donations);

  const totalDonations = donations.length;
  const activeMissions = donations.filter(d => ['claimed', 'NGO Accepted', 'Picked Up', 'In Transit'].includes(d.status)).length;
  
  let ngosHelped = 0;
  if (role === 'donor') {
    const uniqueClaimers = new Set();
    donations.forEach(d => {
      if (d.claimedBy) uniqueClaimers.add(d.claimedBy.toString());
    });
    ngosHelped = uniqueClaimers.size;
  }

  let donorsConnected = 0;
  if (role === 'charity') {
    const uniqueDonors = new Set();
    donations.forEach(d => {
      if (d.donor) uniqueDonors.add(d.donor.toString());
    });
    donorsConnected = uniqueDonors.size;
  }

  return {
    ...impact,
    totalDonations,
    activeMissions,
    ngosHelped,
    donorsConnected
  };
};
