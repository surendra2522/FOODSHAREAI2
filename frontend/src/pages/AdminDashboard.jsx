import React, { useState, useEffect, useCallback } from 'react';
import api from '../utils/api';
import { useToast } from '../context/ToastContext';
import { 
  Users, Gift, RefreshCw, Trash2, Edit, BarChart3, Cpu, 
  Database, UserCheck, Activity, Award, ShieldAlert,
  Download, Search, Ban, FileText, Bell, Printer, Plus, Check,
  AlertTriangle, Filter, Sparkles, Heart
} from 'lucide-react';

// --- PREMIUM SKELETON LOADERS ---
const StatsSkeleton = () => (
  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
    {[1, 2, 3, 4, 5, 6].map(i => (
      <div key={i} className="bg-white border border-slate-100 p-5 rounded-2xl shadow-sm flex flex-col gap-2 animate-pulse">
        <div className="h-3 w-16 bg-slate-200 rounded"></div>
        <div className="h-7 w-20 bg-slate-200 rounded"></div>
        <div className="h-3 w-24 bg-slate-200 rounded mt-1"></div>
      </div>
    ))}
  </div>
);

const ChartSkeleton = () => (
  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
    <div className="lg:col-span-2 bg-white border border-slate-100 p-6 rounded-3xl shadow-sm flex flex-col gap-4 animate-pulse">
      <div className="flex justify-between items-center">
        <div className="flex flex-col gap-2">
          <div className="h-4 w-48 bg-slate-200 rounded"></div>
          <div className="h-3 w-32 bg-slate-200 rounded"></div>
        </div>
        <div className="h-8 w-24 bg-slate-200 rounded-lg"></div>
      </div>
      <div className="h-64 w-full bg-slate-50/50 rounded-2xl border border-dashed border-slate-200"></div>
    </div>
    <div className="bg-white border border-slate-100 p-6 rounded-3xl shadow-sm flex flex-col gap-5 animate-pulse items-center justify-center">
      <div className="h-32 w-32 bg-slate-100 rounded-full mb-4"></div>
      <div className="h-4 w-32 bg-slate-200 rounded"></div>
      <div className="h-3 w-48 bg-slate-200 rounded mt-2"></div>
    </div>
  </div>
);

const TableSkeleton = ({ cols = 6 }) => (
  <div className="bg-white border border-slate-100 rounded-3xl shadow-sm p-6 flex flex-col gap-4 animate-pulse">
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div className="h-9 w-64 bg-slate-200 rounded-xl"></div>
      <div className="h-9 w-32 bg-slate-200 rounded-xl"></div>
    </div>
    <div className="overflow-x-auto border border-slate-100 rounded-2xl">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-slate-50 border-b border-slate-100">
            {Array.from({ length: cols }).map((_, i) => (
              <th key={i} className="py-4 px-5"><div className="h-3 w-16 bg-slate-200 rounded"></div></th>
            ))}
          </tr>
        </thead>
        <tbody>
          {[1, 2, 3, 4, 5].map(r => (
            <tr key={r} className="border-b border-slate-50">
              {Array.from({ length: cols }).map((_, i) => (
                <td key={i} className="py-4 px-5"><div className="h-3 w-24 bg-slate-100 rounded"></div></td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

const BroadcastSkeleton = () => (
  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-pulse">
    <div className="bg-white border border-slate-100 p-6 rounded-3xl shadow-sm flex flex-col gap-4">
      <div className="h-4 w-32 bg-slate-200 rounded"></div>
      <div className="h-32 bg-slate-100 rounded-2xl"></div>
      <div className="h-10 bg-slate-200 rounded-xl"></div>
    </div>
    <div className="lg:col-span-2 bg-white border border-slate-100 p-6 rounded-3xl shadow-sm flex flex-col gap-4">
      <div className="h-4 w-48 bg-slate-200 rounded"></div>
      <div className="flex flex-col gap-3">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-20 bg-slate-50 rounded-2xl"></div>
        ))}
      </div>
    </div>
  </div>
);

const SystemSkeleton = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-pulse">
    {[1, 2].map(i => (
      <div key={i} className="bg-white border border-slate-100 p-6 rounded-3xl shadow-sm flex flex-col gap-4">
        <div className="h-4 w-32 bg-slate-200 rounded"></div>
        <div className="flex flex-col gap-3 mt-4">
          {[1, 2, 3, 4, 5].map(j => (
            <div key={j} className="h-8 bg-slate-50 rounded-xl"></div>
          ))}
        </div>
      </div>
    ))}
  </div>
);

// --- PREMIUM EMPTY STATE COMPONENT ---
const EmptyState = ({ message = "No data found", description = "Try adjusting your filters or search terms." }) => (
  <div className="flex flex-col items-center justify-center py-12 px-4 text-center border border-dashed border-slate-200 rounded-3xl bg-slate-50/30 gap-3">
    <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
      <Search size={20} />
    </div>
    <div className="flex flex-col gap-1">
      <h3 className="font-bold text-slate-700 text-sm">{message}</h3>
      <p className="text-xs text-slate-400 max-w-[280px]">{description}</p>
    </div>
  </div>
);

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('analytics');
  const [users, setUsers] = useState([]);
  const [donations, setDonations] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [system, setSystem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [exportLoading, setExportLoading] = useState(null);
  const [error, setError] = useState('');
  const { addToast } = useToast();
  
  // Search & Filter state
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('all');
  
  const [donationSearch, setDonationSearch] = useState('');
  const [donationStatusFilter, setDonationStatusFilter] = useState('all');

  const [ngoSearch, setNgoSearch] = useState('');
  const [ngoStatusFilter, setNgoStatusFilter] = useState('all');

  // User edit modal state
  const [editingUser, setEditingUser] = useState(null);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editRole, setEditRole] = useState('donor');
  const [editOrg, setEditOrg] = useState('');
  const [editAddress, setEditAddress] = useState('');

  // NGO document review modal state
  const [reviewingNgo, setReviewingNgo] = useState(null);

  // Announcement creator state
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newType, setNewType] = useState('info');
  const [newAudience, setNewAudience] = useState('all');
  const [broadcastLoading, setBroadcastLoading] = useState(false);

  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [usersRes, donationsRes, analyticsRes, systemRes, announcementsRes] = await Promise.all([
        api.get('/admin/users').catch(err => {
          console.error('Error fetching users:', err);
          return { data: [] };
        }),
        api.get('/admin/donations').catch(err => {
          console.error('Error fetching donations:', err);
          return { data: [] };
        }),
        api.get('/admin/analytics').catch(err => {
          console.error('Error fetching analytics:', err);
          return { data: null };
        }),
        api.get('/admin/system').catch(err => {
          console.error('Error fetching system:', err);
          return { data: null };
        }),
        api.get('/admin/announcements').catch(() => ({ data: [] }))
      ]);

      setUsers(usersRes.data || []);
      setDonations(donationsRes.data || []);
      setAnalytics(analyticsRes.data || null);
      setSystem(systemRes.data || null);
      setAnnouncements(announcementsRes.data || []);

      if (!usersRes.data || !donationsRes.data || !analyticsRes.data) {
        setError('Partial administrative telemetry data loaded. Some system layers are operating in fallback/offline mode.');
      }
    } catch (err) {
      setError('Failed to sync administrative telemetry data. System is running on localized state.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // --- EXPORT REPORTS ---
  const handleBackendExport = async (type) => {
    setExportLoading(type);
    try {
      const response = await api.get(`/admin/export/${type}`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `foodshare_report.${type}`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
      addToast(`Telemetry report exported successfully to ${type.toUpperCase()}!`, 'success');
    } catch (err) {
      addToast(`Error exporting ${type.toUpperCase()} report`, 'error');
      console.error(err);
    } finally {
      setExportLoading(null);
    }
  };

  // --- USER ACTIONS ---
  const handleDeleteUser = async (userId) => {
    if (!window.confirm('CRITICAL ACTION: Are you sure you want to permanently delete this user account? This cannot be undone and all associated listings might be orphaned.')) return;
    try {
      await api.delete(`/admin/users/${userId}`);
      setUsers(users.filter(u => u._id !== userId));
      addToast('User account permanently deleted successfully.', 'success');
      fetchDashboardData();
    } catch (err) {
      addToast(err.response?.data?.message || 'Error deleting user', 'error');
    }
  };

  const handleOpenEditModal = (user) => {
    setEditingUser(user);
    setEditName(user.name);
    setEditEmail(user.email);
    setEditRole(user.role);
    setEditOrg(user.organization || '');
    setEditAddress(user.address || '');
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/admin/users/${editingUser._id}`, {
        name: editName,
        email: editEmail,
        role: editRole,
        organization: editOrg,
        address: editAddress
      });
      setEditingUser(null);
      addToast('User details updated successfully!', 'success');
      fetchDashboardData();
    } catch (err) {
      addToast(err.response?.data?.message || 'Error updating user', 'error');
    }
  };

  const handleToggleUserActive = async (user) => {
    const updatedStatus = !user.isActive;
    const actionText = updatedStatus ? 'activate' : 'deactivate';
    if (!window.confirm(`Are you sure you want to ${actionText} this user account?`)) return;
    try {
      await api.put(`/admin/users/${user._id}`, {
        isActive: updatedStatus,
        isSuspended: updatedStatus ? false : user.isSuspended
      });
      addToast(`User account successfully ${updatedStatus ? 'activated' : 'deactivated'}!`, 'success');
      fetchDashboardData();
    } catch (err) {
      addToast(err.response?.data?.message || 'Error toggling account status', 'error');
    }
  };

  // --- NGO ACTIONS ---
  const handleVerifyNgo = async (ngoId, status) => {
    if (status === 'rejected') {
      if (!window.confirm('Are you sure you want to reject this NGO registration certificate? The NGO will be notified of the verification failure.')) return;
    }
    try {
      await api.put(`/admin/users/${ngoId}`, {
        ngoVerificationStatus: status
      });
      setReviewingNgo(null);
      if (status === 'verified') {
        addToast('NGO partner successfully verified and approved!', 'success');
      } else {
        addToast('NGO partner verification rejected.', 'warning');
      }
      fetchDashboardData();
    } catch (err) {
      addToast(err.response?.data?.message || 'Error verifying NGO', 'error');
    }
  };

  const handleToggleNgoSuspended = async (ngo) => {
    const suspendStatus = !ngo.isSuspended;
    const actionText = suspendStatus ? 'suspend' : 'unsuspend';
    if (!window.confirm(`Are you sure you want to ${actionText} this NGO partner account? Suspended NGOs will not be able to claim food listings.`)) return;
    try {
      await api.put(`/admin/users/${ngo._id}`, {
        isSuspended: suspendStatus,
        isActive: !suspendStatus
      });
      addToast(`NGO partner account successfully ${suspendStatus ? 'suspended' : 'unsuspended'}!`, 'success');
      fetchDashboardData();
    } catch (err) {
      addToast(err.response?.data?.message || 'Error toggling suspension', 'error');
    }
  };

  // --- DONATION ACTIONS ---
  const handleDeleteDonation = async (donationId) => {
    if (!window.confirm('Are you sure you want to permanently delete this donation listing? This action is irreversible.')) return;
    try {
      await api.delete(`/admin/donations/${donationId}`);
      setDonations(donations.filter(d => d._id !== donationId));
      addToast('Donation listing deleted successfully.', 'success');
      fetchDashboardData();
    } catch (err) {
      addToast(err.response?.data?.message || 'Error deleting donation', 'error');
    }
  };

  const handleFlagExpiredDonations = async () => {
    try {
      const res = await api.post('/admin/donations/flag-expired');
      addToast(res.data.message || 'Successfully updated expired listings.', 'success');
      fetchDashboardData();
    } catch (err) {
      addToast(err.response?.data?.message || 'Error flagging expired donations', 'error');
    }
  };

  // --- REQUEST ACTIONS ---
  const handleCancelRequest = async (requestId) => {
    if (!window.confirm('Are you sure you want to cancel and reset this claim match? The listing will return to available status.')) return;
    try {
      await api.put(`/admin/requests/${requestId}/cancel`);
      addToast('Claim match canceled and listing status reset to available.', 'success');
      fetchDashboardData();
    } catch (err) {
      addToast(err.response?.data?.message || 'Error canceling request', 'error');
    }
  };

  // --- ANNOUNCEMENT ACTIONS ---
  const handleBroadcastAnnouncement = async (e) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) {
      addToast('Please fill out all fields.', 'warning');
      return;
    }
    setBroadcastLoading(true);
    try {
      await api.post('/admin/announcements', {
        title: newTitle,
        content: newContent,
        type: newType,
        targetAudience: newAudience
      });
      setNewTitle('');
      setNewContent('');
      setNewType('info');
      setNewAudience('all');
      addToast('Global broadcast announcement dispatched successfully!', 'success');
      fetchDashboardData();
    } catch (err) {
      addToast(err.response?.data?.message || 'Error broadcasting announcement', 'error');
    } finally {
      setBroadcastLoading(false);
    }
  };

  const handleDeleteAnnouncement = async (id) => {
    if (!window.confirm('Are you sure you want to permanently delete this broadcast announcement?')) return;
    try {
      await api.delete(`/admin/announcements/${id}`);
      addToast('Broadcast announcement deleted successfully.', 'success');
      fetchDashboardData();
    } catch (err) {
      addToast(err.response?.data?.message || 'Error deleting announcement', 'error');
    }
  };

  // --- EXPORT TO CSV ---
  const exportCSV = (data, filename) => {
    if (!data || data.length === 0) {
      addToast('No data to export', 'warning');
      return;
    }
    const headers = Object.keys(data[0]).join(',');
    const rows = data.map(row => 
      Object.values(row).map(val => `"${String(val).replace(/"/g, '""')}"`).join(',')
    );
    const csvContent = [headers, ...rows].join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    addToast('Telemetry report exported successfully!', 'success');
  };

  const handleExportUsers = () => {
    if (users.length === 0) return;
    const csvData = users.map(u => ({
      ID: u._id,
      Name: u.name,
      Email: u.email,
      Role: u.role,
      Organization: u.organization || 'N/A',
      Address: u.address || 'N/A',
      Status: u.isSuspended ? 'Suspended' : u.isActive ? 'Active' : 'Deactivated',
      NGO_Verification: u.role === 'charity' ? u.ngoVerificationStatus : 'N/A',
      Created_At: new Date(u.createdAt).toLocaleDateString()
    }));
    exportCSV(csvData, 'foodshare_users_report.csv');
  };

  const handleExportDonations = () => {
    if (donations.length === 0) return;
    const csvData = donations.map(d => ({
      ID: d._id,
      Title: d.title,
      Food_Type: d.foodType,
      Quantity: d.quantity,
      Status: d.status,
      Expiry_Time: new Date(d.expiryTime).toLocaleString(),
      Donor_Name: d.donor?.name || 'Unknown',
      Donor_Org: d.donor?.organization || 'Individual',
      Claimed_By: d.claimedBy?.name || 'None',
      Created_At: new Date(d.createdAt).toLocaleDateString()
    }));
    exportCSV(csvData, 'foodshare_donations_report.csv');
  };

  // --- PRINT IMPACT REPORT ---
  const handlePrintReport = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      addToast('Popup blocked! Please allow popups to print report.', 'warning');
      return;
    }
    const monthlyItems = analytics?.monthlyDonations || [];
    const monthlyListHTML = monthlyItems.map(m => `<li>${m.name}: ${m.donations} listings</li>`).join('');
    
    printWindow.document.write(`
      <html>
        <head>
          <title>FoodShare AI - System Impact Report</title>
          <style>
            body { font-family: sans-serif; color: #1e293b; padding: 40px; line-height: 1.6; }
            h1 { color: #059669; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px; }
            h2 { color: #334155; margin-top: 30px; }
            .grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin: 30px 0; }
            .card { background: #f8fafc; border: 1px solid #e2e8f0; padding: 20px; border-radius: 12px; }
            .card-title { font-size: 12px; color: #64748b; text-transform: uppercase; font-weight: bold; }
            .card-value { font-size: 28px; color: #0f172a; font-weight: 800; margin-top: 5px; }
            table { width: 100%; border-collapse: collapse; margin-top: 15px; }
            th, td { text-align: left; padding: 12px; border-bottom: 1px solid #e2e8f0; }
            th { background-color: #f1f5f9; color: #475569; }
            .footer { margin-top: 50px; font-size: 12px; color: #94a3b8; text-align: center; border-top: 1px solid #e2e8f0; padding-top: 15px; }
          </style>
        </head>
        <body>
          <h1>FoodShare AI - Impact & Telemetry Report</h1>
          <p>Generated on ${new Date().toLocaleString()} | Administrator Authorized</p>
          
          <div class="grid">
            <div class="card">
              <div class="card-title">Total Meals Shared</div>
              <div class="card-value">${analytics?.mealsShared || 0}</div>
            </div>
            <div class="card">
              <div class="card-title">Food Waste Prevented</div>
              <div class="card-value">${analytics?.foodWastePrevented || 0} kg</div>
            </div>
            <div class="card">
              <div class="card-title">CO2 Footprint Saved</div>
              <div class="card-value">${analytics?.co2Prevented || 0} kg</div>
            </div>
          </div>

          <h2>System Metrics Overview</h2>
          <ul>
            <li>Total registered users: ${analytics?.users.total || 0} (${analytics?.users.donors || 0} Donors, ${analytics?.users.NGOs || 0} NGOs)</li>
            <li>Total donation listings posted: ${analytics?.donations.total || 0}</li>
            <li>Claimed/Completed: ${Number(analytics?.donations.claimed || 0) + Number(analytics?.donations.completed || 0)}</li>
            <li>Active listings currently available: ${analytics?.donations.available || 0}</li>
            <li>Expired listings: ${analytics?.donations.expired || 0}</li>
          </ul>

          <h2>Monthly Trends</h2>
          <ul>
            ${monthlyListHTML}
          </ul>

          <h2>Top Supplying Donors</h2>
          <table>
            <thead>
              <tr><th>Donor Name</th><th>Organization</th><th>Donations Listed</th></tr>
            </thead>
            <tbody>
              ${(analytics?.topDonors || []).map(d => `<tr><td>${d.name}</td><td>${d.organization}</td><td>${d.donationsCount}</td></tr>`).join('')}
            </tbody>
          </table>

          <h2>Most Active NGO Partners</h2>
          <table>
            <thead>
              <tr><th>NGO Name</th><th>Organization</th><th>Claims Fulfilled</th></tr>
            </thead>
            <tbody>
              ${(analytics?.activeNGOs || []).map(n => `<tr><td>${n.name}</td><td>${n.organization}</td><td>${n.claimsCount}</td></tr>`).join('')}
            </tbody>
          </table>

          <div class="footer">
            FoodShare AI Logistics & Integrity Systems &copy; ${new Date().getFullYear()}
          </div>
          <script>window.print();</script>
        </body>
      </html>
    `);
    printWindow.document.close();
    addToast('Impact report printed successfully.', 'success');
  };

  // --- FILTERS LOGIC ---
  const filteredUsers = users.filter(u => {
    const matchesSearch = u.name.toLowerCase().includes(userSearch.toLowerCase()) || 
                          u.email.toLowerCase().includes(userSearch.toLowerCase()) ||
                          (u.organization && u.organization.toLowerCase().includes(userSearch.toLowerCase()));
    const matchesRole = userRoleFilter === 'all' ? true : u.role === userRoleFilter;
    return matchesSearch && matchesRole;
  });

  const filteredNGOs = users.filter(u => {
    if (u.role !== 'charity') return false;
    const matchesSearch = u.name.toLowerCase().includes(ngoSearch.toLowerCase()) || 
                          u.email.toLowerCase().includes(ngoSearch.toLowerCase()) ||
                          (u.organization && u.organization.toLowerCase().includes(ngoSearch.toLowerCase()));
    
    let matchesStatus = true;
    if (ngoStatusFilter === 'verified') matchesStatus = u.ngoVerificationStatus === 'verified';
    else if (ngoStatusFilter === 'pending') matchesStatus = u.ngoVerificationStatus === 'pending';
    else if (ngoStatusFilter === 'unverified') matchesStatus = u.ngoVerificationStatus === 'unverified' || !u.ngoVerificationStatus;
    else if (ngoStatusFilter === 'suspended') matchesStatus = u.isSuspended === true;

    return matchesSearch && matchesStatus;
  });

  const filteredDonations = donations.filter(d => {
    const matchesSearch = d.title.toLowerCase().includes(donationSearch.toLowerCase()) || 
                          (d.donor?.name && d.donor.name.toLowerCase().includes(donationSearch.toLowerCase())) ||
                          (d.claimedBy?.name && d.claimedBy.name.toLowerCase().includes(donationSearch.toLowerCase()));
    const matchesStatus = donationStatusFilter === 'all' ? true : d.status === donationStatusFilter;
    return matchesSearch && matchesStatus;
  });

  // Calculate stats for local calculations (just in case API falls back)
  const totalUsers = users.length;
  const totalDonors = users.filter(u => u.role === 'donor').length;
  const totalNGOs = users.filter(u => u.role === 'charity').length;
  const totalDonationsCount = donations.length;

  const monthlyDonations = analytics?.monthlyDonations || [];
  const maxVal = monthlyDonations.length > 0 ? Math.max(...monthlyDonations.map(x => x.donations), 10) : 10;

  // Carbon circular chart progress calculations
  const co2Prevented = analytics?.co2Prevented || 0;
  const co2Target = 5000; // System goal target in kg
  const co2Percentage = Math.min(1, co2Prevented / co2Target);
  const strokeDashoffset = 2 * Math.PI * 62 * (1 - co2Percentage);

  return (
    <div className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-6" role="region" aria-label="Admin Portal Area">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest">
            <UserCheck size={14} className="text-[#059669] animate-pulse" />
            Core Logistics Telemetry Active
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mt-1">Admin Portal</h1>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => handleBackendExport('csv')}
            disabled={exportLoading === 'csv'}
            aria-label="Export all telemetry to CSV"
            className="flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-bold py-2.5 px-4 rounded-xl transition-all duration-200 active:scale-95 text-sm shadow-md cursor-pointer disabled:opacity-50"
          >
            <Download size={16} className={exportLoading === 'csv' ? 'animate-bounce' : ''} />
            {exportLoading === 'csv' ? 'Generating CSV...' : 'Export CSV'}
          </button>
          <button
            onClick={() => handleBackendExport('pdf')}
            disabled={exportLoading === 'pdf'}
            aria-label="Export impact report to PDF"
            className="flex items-center justify-center gap-2 bg-[#F97316] hover:bg-[#EA580C] text-white font-bold py-2.5 px-4 rounded-xl transition-all duration-200 active:scale-95 text-sm shadow-md shadow-orange-500/20 cursor-pointer disabled:opacity-50"
          >
            <Printer size={16} className={exportLoading === 'pdf' ? 'animate-bounce' : ''} />
            {exportLoading === 'pdf' ? 'Generating PDF...' : 'Export PDF'}
          </button>
          <button
            onClick={fetchDashboardData}
            disabled={loading}
            aria-label="Refresh telemetry data"
            className="flex items-center justify-center gap-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-[#059669] font-bold py-2.5 px-4 rounded-xl transition-all duration-200 active:scale-95 text-sm ml-2 cursor-pointer disabled:opacity-50"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            Sync System Telemetry
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-100 text-amber-700 text-sm flex items-start gap-2.5" role="alert">
          <ShieldAlert size={18} className="flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Tabs list */}
      <div className="flex flex-wrap gap-2 border-b border-slate-100 pb-2" role="tablist" aria-label="Dashboard views">
        <button
          onClick={() => setActiveTab('analytics')}
          role="tab"
          aria-selected={activeTab === 'analytics'}
          aria-controls="analytics-panel"
          id="tab-analytics"
          className={`flex items-center gap-2 py-2.5 px-4 rounded-xl font-bold text-sm transition-all cursor-pointer ${
            activeTab === 'analytics'
              ? 'bg-[#059669] text-white shadow-md shadow-emerald-500/10'
              : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
          }`}
        >
          <BarChart3 size={16} />
          Dashboard & Analytics
        </button>
        <button
          onClick={() => setActiveTab('users')}
          role="tab"
          aria-selected={activeTab === 'users'}
          aria-controls="users-panel"
          id="tab-users"
          className={`flex items-center gap-2 py-2.5 px-4 rounded-xl font-bold text-sm transition-all cursor-pointer ${
            activeTab === 'users'
              ? 'bg-[#059669] text-white shadow-md shadow-emerald-500/10'
              : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
          }`}
        >
          <Users size={16} />
          User Management
        </button>
        <button
          onClick={() => setActiveTab('ngos')}
          role="tab"
          aria-selected={activeTab === 'ngos'}
          aria-controls="ngos-panel"
          id="tab-ngos"
          className={`flex items-center gap-2 py-2.5 px-4 rounded-xl font-bold text-sm transition-all cursor-pointer ${
            activeTab === 'ngos'
              ? 'bg-[#059669] text-white shadow-md shadow-emerald-500/10'
              : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
          }`}
        >
          <Award size={16} />
          NGO Verification
        </button>
        <button
          onClick={() => setActiveTab('donations')}
          role="tab"
          aria-selected={activeTab === 'donations'}
          aria-controls="donations-panel"
          id="tab-donations"
          className={`flex items-center gap-2 py-2.5 px-4 rounded-xl font-bold text-sm transition-all cursor-pointer ${
            activeTab === 'donations'
              ? 'bg-[#059669] text-white shadow-md shadow-emerald-500/10'
              : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
          }`}
        >
          <Gift size={16} />
          Donation Management
        </button>
        <button
          onClick={() => setActiveTab('announcements')}
          role="tab"
          aria-selected={activeTab === 'announcements'}
          aria-controls="announcements-panel"
          id="tab-announcements"
          className={`flex items-center gap-2 py-2.5 px-4 rounded-xl font-bold text-sm transition-all cursor-pointer ${
            activeTab === 'announcements'
              ? 'bg-[#059669] text-white shadow-md shadow-emerald-500/10'
              : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
          }`}
        >
          <Bell size={16} />
          Broadcast System
        </button>
        <button
          onClick={() => setActiveTab('system')}
          role="tab"
          aria-selected={activeTab === 'system'}
          aria-controls="system-panel"
          id="tab-system"
          className={`flex items-center gap-2 py-2.5 px-4 rounded-xl font-bold text-sm transition-all cursor-pointer ${
            activeTab === 'system'
              ? 'bg-[#059669] text-white shadow-md shadow-emerald-500/10'
              : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
          }`}
        >
          <Cpu size={16} />
          System Health
        </button>
      </div>

      {/* Main Tab Panels */}
      <div className="flex-1">
        
        {/* --- ANALYTICS VIEW --- */}
        {activeTab === 'analytics' && (
          <div id="analytics-panel" role="tabpanel" aria-labelledby="tab-analytics" className="flex flex-col gap-6">
            {loading ? (
              <>
                <StatsSkeleton />
                <ChartSkeleton />
              </>
            ) : (
              <>
                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                  <div className="bg-white border border-slate-100 p-5 rounded-2xl shadow-sm flex flex-col gap-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Users</span>
                    <span className="text-2xl font-extrabold text-slate-900">{analytics?.users.total ?? totalUsers}</span>
                    <span className="text-[10px] text-slate-400 mt-1">Account Registrations</span>
                  </div>
                  <div className="bg-white border border-slate-100 p-5 rounded-2xl shadow-sm flex flex-col gap-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Donors</span>
                    <span className="text-2xl font-extrabold text-slate-900">{analytics?.users.donors ?? totalDonors}</span>
                    <span className="text-[10px] text-slate-400 mt-1">Active Food Suppliers</span>
                  </div>
                  <div className="bg-white border border-slate-100 p-5 rounded-2xl shadow-sm flex flex-col gap-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total NGOs</span>
                    <span className="text-2xl font-extrabold text-slate-900">{analytics?.users.NGOs ?? totalNGOs}</span>
                    <span className="text-[10px] text-slate-400 mt-1">Verified NGO Partners</span>
                  </div>
                  <div className="bg-white border border-slate-100 p-5 rounded-2xl shadow-sm flex flex-col gap-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Donations</span>
                    <span className="text-2xl font-extrabold text-slate-900">{analytics?.donations.total ?? totalDonationsCount}</span>
                    <span className="text-[10px] text-slate-400 mt-1">Individual Listings</span>
                  </div>
                  <div className="bg-white border border-slate-100 p-5 rounded-2xl shadow-sm flex flex-col gap-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Meals Shared</span>
                    <span className="text-2xl font-extrabold text-[#059669] flex items-center gap-1">
                      <Award size={18} className="text-emerald-500" />
                      {analytics?.mealsShared ?? 0}
                    </span>
                    <span className="text-[10px] text-slate-400 mt-1">Servings Delivered</span>
                  </div>
                  <div className="bg-white border border-slate-100 p-5 rounded-2xl shadow-sm flex flex-col gap-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Waste Prevented</span>
                    <span className="text-2xl font-extrabold text-[#059669]">
                      {analytics?.foodWastePrevented ?? 0} kg
                    </span>
                    <span className="text-[10px] text-slate-400 mt-1">Diverted from Landfill</span>
                  </div>
                </div>

                {/* Main Visuals & Chart Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  
                  {/* SVG Charts Box */}
                  <div className="lg:col-span-2 bg-white border border-slate-100 p-6 rounded-3xl shadow-sm flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-extrabold text-slate-900 text-base">Monthly Food Redistribution</h3>
                        <p className="text-xs text-slate-400">Telemetry logs over previous months</p>
                      </div>
                      <div className="flex gap-2">
                        <button 
                          onClick={handlePrintReport}
                          className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors flex items-center gap-1 text-xs font-semibold cursor-pointer"
                        >
                          <Printer size={14} /> Print Report
                        </button>
                      </div>
                    </div>

                    {/* SVG Line / Bar Chart */}
                    <div className="flex gap-4 h-64 w-full pt-4">
                      {/* Y-Axis Labels */}
                      <div className="flex flex-col justify-between text-[9px] font-bold text-slate-400 pb-5 pt-1">
                        <span>{maxVal}</span>
                        <span>{Math.round(maxVal * 0.75)}</span>
                        <span>{Math.round(maxVal * 0.5)}</span>
                        <span>{Math.round(maxVal * 0.25)}</span>
                        <span>0</span>
                      </div>
                      
                      <div className="flex-1 relative bg-slate-50/50 rounded-2xl p-4 flex flex-col justify-between border border-dashed border-slate-200">
                        {monthlyDonations.length === 0 ? (
                          <div className="flex-1 flex items-center justify-center text-slate-400 text-xs">
                            No monthly trend data available.
                          </div>
                        ) : (
                          <>
                            <div className="absolute inset-0 flex flex-col justify-between p-4 pointer-events-none">
                              {[1, 2, 3, 4].map(i => (
                                <div key={i} className="w-full border-t border-slate-200/60"></div>
                              ))}
                            </div>

                            <div className="relative flex-1 h-full flex items-end justify-around gap-2 px-6 pt-6">
                              {monthlyDonations.map((m, index) => {
                                const heightPercent = `${(m.donations / maxVal) * 80}%`;
                                return (
                                  <div key={index} className="flex-1 h-full flex flex-col justify-end items-center gap-1 group relative">
                                    {/* Tooltip */}
                                    <div className="absolute bottom-full mb-2 bg-slate-900 text-white text-[10px] font-bold py-1 px-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 whitespace-nowrap shadow-md">
                                      {m.donations} donations
                                    </div>
                                    {/* Bar */}
                                    <div 
                                      style={{ height: heightPercent }} 
                                      className="w-full max-w-[28px] bg-gradient-to-t from-emerald-600 to-emerald-400 rounded-t-lg group-hover:from-emerald-500 group-hover:to-emerald-300 transition-all duration-300 shadow-sm"
                                    ></div>
                                    <span className="text-[10px] font-bold text-slate-400 mt-1">{m.name}</span>
                                  </div>
                                );
                              })}
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Impact telemetries side card */}
                  <div className="bg-white border border-slate-100 p-6 rounded-3xl shadow-sm flex flex-col gap-5">
                    <div>
                      <h3 className="font-extrabold text-slate-900 text-base">Carbon Footprint Saving</h3>
                      <p className="text-xs text-slate-400">Environmental conservation index</p>
                    </div>

                    <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center py-4">
                      <div className="relative w-36 h-36 flex items-center justify-center">
                        {/* SVG circular track */}
                        <svg className="w-full h-full transform -rotate-90">
                          <circle cx="72" cy="72" r="62" stroke="#e2e8f0" strokeWidth="10" fill="transparent" />
                          <circle cx="72" cy="72" r="62" stroke="#059669" strokeWidth="10" fill="transparent" 
                            strokeDasharray={2 * Math.PI * 62} 
                            strokeDashoffset={strokeDashoffset} 
                            strokeLinecap="round" 
                            className="transition-all duration-1000 ease-out"
                          />
                        </svg>
                        <div className="absolute flex flex-col items-center">
                          <Sparkles size={24} className="text-[#059669] mb-1" />
                          <span className="text-2xl font-black text-slate-900">{analytics?.co2Prevented ?? 0}</span>
                          <span className="text-[9px] font-bold text-slate-400 uppercase">KG CO2 Saved</span>
                        </div>
                      </div>
                      <p className="text-xs text-slate-500 max-w-[200px]">
                        Targeting {co2Target} kg CO2 prevention. Each surplus meal prevents 2.8kg of greenhouse gas emissions.
                      </p>
                    </div>
                  </div>

                </div>

                {/* Top Donors & Active NGOs lists */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* Top Donors list */}
                  <div className="bg-white border border-slate-100 p-6 rounded-3xl shadow-sm flex flex-col gap-4">
                    <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2 border-b border-slate-100 pb-3">
                      <Heart size={16} className="text-rose-500" />
                      Top Donors (Generosity Leaderboard)
                    </h3>
                    <div className="flex flex-col gap-3">
                      {(analytics?.topDonors || []).map((donor, idx) => (
                        <div key={donor.id || idx} className="flex items-center justify-between p-3 rounded-2xl hover:bg-slate-50 transition-colors">
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                              idx === 0 ? 'bg-amber-100 text-amber-700' :
                              idx === 1 ? 'bg-slate-200 text-slate-700' :
                              idx === 2 ? 'bg-orange-100 text-orange-700' : 'bg-slate-100 text-slate-500'
                            }`}>
                              #{idx + 1}
                            </div>
                            <div>
                              <div className="font-bold text-slate-800 text-sm">{donor.name}</div>
                              <div className="text-xs text-slate-400">{donor.organization || 'Individual'}</div>
                            </div>
                          </div>
                          <div className="flex flex-col items-end">
                            <span className="text-sm font-extrabold text-[#059669]">{donor.donationsCount}</span>
                            <span className="text-[9px] text-slate-400 uppercase font-bold">Listings</span>
                          </div>
                        </div>
                      ))}
                      {(analytics?.topDonors || []).length === 0 && (
                        <EmptyState 
                          message="No donor statistics" 
                          description="Once donors list surplus food donations, the leadership board will sync statistics here." 
                        />
                      )}
                    </div>
                  </div>

                  {/* Active NGOs */}
                  <div className="bg-white border border-slate-100 p-6 rounded-3xl shadow-sm flex flex-col gap-4">
                    <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2 border-b border-slate-100 pb-3">
                      <Award size={16} className="text-[#059669]" />
                      Most Active NGOs
                    </h3>
                    <div className="flex flex-col gap-3">
                      {(analytics?.activeNGOs || []).map((ngo, idx) => (
                        <div key={ngo.id || idx} className="flex items-center justify-between p-3 rounded-2xl hover:bg-slate-50 transition-colors">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-emerald-50 text-[#059669] rounded-full flex items-center justify-center font-bold text-xs">
                              {idx + 1}
                            </div>
                            <div>
                              <div className="font-bold text-slate-800 text-sm">{ngo.name}</div>
                              <div className="text-xs text-slate-400">{ngo.organization || 'Charity Partner'}</div>
                            </div>
                          </div>
                          <div className="flex flex-col items-end">
                            <span className="text-sm font-extrabold text-[#059669]">{ngo.claimsCount}</span>
                            <span className="text-[9px] text-slate-400 uppercase font-bold">Claims Fulfillments</span>
                          </div>
                        </div>
                      ))}
                      {(analytics?.activeNGOs || []).length === 0 && (
                        <EmptyState 
                          message="No NGO statistics" 
                          description="Active claim distributions by registered NGOs will be displayed in this performance card." 
                        />
                      )}
                    </div>
                  </div>

                </div>
              </>
            )}
          </div>
        )}

        {/* --- USERS MANAGEMENT VIEW --- */}
        {activeTab === 'users' && (
          <div id="users-panel" role="tabpanel" aria-labelledby="tab-users">
            {loading ? (
              <TableSkeleton cols={6} />
            ) : (
              <div className="bg-white border border-slate-100 rounded-3xl shadow-sm overflow-hidden flex flex-col gap-4 p-6">
                
                {/* Search, Filter & Actions bar */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex flex-1 flex-wrap gap-2.5">
                    {/* Search */}
                    <div className="relative flex-1 min-w-[200px] max-w-sm">
                      <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 pointer-events-none">
                        <Search size={16} />
                      </span>
                      <input
                        type="text"
                        placeholder="Search name, email, org..."
                        value={userSearch}
                        onChange={(e) => setUserSearch(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 pl-9 pr-4 text-sm focus:outline-none focus:ring-1 focus:ring-[#059669] focus:bg-white transition-all"
                      />
                    </div>

                    {/* Role Filter */}
                    <div className="relative">
                      <select
                        value={userRoleFilter}
                        onChange={(e) => setUserRoleFilter(e.target.value)}
                        className="appearance-none bg-slate-50 border border-slate-200 rounded-xl py-2 pl-4 pr-8 text-sm focus:outline-none focus:ring-1 focus:ring-[#059669] focus:bg-white transition-all"
                      >
                        <option value="all">All Roles</option>
                        <option value="donor">Donors</option>
                        <option value="charity">NGOs (Charities)</option>
                        <option value="admin">System Admins</option>
                      </select>
                    </div>
                  </div>

                  {/* CSV export */}
                  <button
                    onClick={handleExportUsers}
                    className="flex items-center justify-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2 px-4 rounded-xl transition-all duration-150 text-xs self-start md:self-auto cursor-pointer"
                  >
                    <Download size={14} /> Export User Directory
                  </button>
                </div>

                {/* Table */}
                <div className="overflow-x-auto border border-slate-100 rounded-2xl">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                        <th className="py-3.5 px-5">Name</th>
                        <th className="py-3.5 px-5">Email</th>
                        <th className="py-3.5 px-5">Organization</th>
                        <th className="py-3.5 px-5">Role</th>
                        <th className="py-3.5 px-5">Status</th>
                        <th className="py-3.5 px-5 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50 text-xs text-slate-700">
                      {filteredUsers.map(u => (
                        <tr key={u._id} className="hover:bg-slate-50/50">
                          <td className="py-3.5 px-5 font-semibold text-slate-900">{u.name}</td>
                          <td className="py-3.5 px-5">{u.email}</td>
                          <td className="py-3.5 px-5">{u.organization || <span className="text-slate-400">N/A</span>}</td>
                          <td className="py-3.5 px-5">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold capitalize ${
                              u.role === 'admin' 
                                ? 'bg-slate-950 text-white' 
                                : u.role === 'donor' 
                                ? 'bg-emerald-50 border border-emerald-100 text-emerald-700' 
                                : 'bg-blue-50 border border-blue-100 text-blue-700'
                            }`}>
                              {u.role === 'charity' ? 'NGO / Charity' : u.role}
                            </span>
                          </td>
                          <td className="py-3.5 px-5">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold capitalize ${
                              u.isSuspended 
                                ? 'bg-red-50 border border-red-100 text-red-700' 
                                : u.isActive === false
                                ? 'bg-amber-50 border border-amber-100 text-amber-700'
                                : 'bg-emerald-50 border border-emerald-100 text-emerald-700'
                            }`}>
                              {u.isSuspended ? 'Suspended' : u.isActive ? 'Active' : 'Deactivated'}
                            </span>
                          </td>
                          <td className="py-3.5 px-5 text-right flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleToggleUserActive(u)}
                              className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                                u.isActive 
                                  ? 'border-slate-200 hover:bg-slate-50 text-slate-500' 
                                  : 'border-emerald-200 hover:bg-emerald-50 text-[#059669]'
                              }`}
                              title={u.isActive ? "Deactivate Account" : "Activate Account"}
                            >
                              <Ban size={13} />
                            </button>
                            <button
                              onClick={() => handleOpenEditModal(u)}
                              className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors cursor-pointer"
                              title="Edit Details"
                            >
                              <Edit size={13} />
                            </button>
                            <button
                              onClick={() => handleDeleteUser(u._id)}
                              className="p-1.5 rounded-lg border border-red-100 hover:bg-red-50 text-red-500 transition-colors cursor-pointer"
                              title="Delete Account"
                            >
                              <Trash2 size={13} />
                            </button>
                          </td>
                        </tr>
                      ))}
                      {filteredUsers.length === 0 && (
                        <tr>
                          <td colSpan="6" className="py-8">
                            <EmptyState 
                              message="No matching user accounts" 
                              description="No registered user profiles matched your filters or search keywords." 
                            />
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

              </div>
            )}
          </div>
        )}

        {/* --- NGO VERIFICATION & MANAGEMENT --- */}
        {activeTab === 'ngos' && (
          <div id="ngos-panel" role="tabpanel" aria-labelledby="tab-ngos">
            {loading ? (
              <TableSkeleton cols={6} />
            ) : (
              <div className="bg-white border border-slate-100 rounded-3xl shadow-sm overflow-hidden flex flex-col gap-4 p-6">
                
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h3 className="font-extrabold text-slate-900 text-base">NGO Registrations & Certifications</h3>
                    <p className="text-xs text-slate-400">Review certificates, manage credentials, and audit status</p>
                  </div>

                  {/* Status Select Filter */}
                  <div className="flex items-center gap-2">
                    <Filter size={14} className="text-slate-400" />
                    <select
                      value={ngoStatusFilter}
                      onChange={(e) => setNgoStatusFilter(e.target.value)}
                      className="appearance-none bg-slate-50 border border-slate-200 rounded-xl py-1.5 px-3 text-xs focus:outline-none focus:ring-1 focus:ring-[#059669]"
                    >
                      <option value="all">All NGOs</option>
                      <option value="verified">Verified</option>
                      <option value="pending">Pending Review</option>
                      <option value="unverified">Unverified</option>
                      <option value="suspended">Suspended</option>
                    </select>
                  </div>
                </div>

                {/* NGO Search */}
                <div className="relative max-w-sm">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 pointer-events-none">
                    <Search size={14} />
                  </span>
                  <input
                    type="text"
                    placeholder="Search NGOs..."
                    value={ngoSearch}
                    onChange={(e) => setNgoSearch(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-1.5 pl-8 pr-4 text-xs focus:outline-none"
                  />
                </div>

                {/* NGO Table */}
                <div className="overflow-x-auto border border-slate-100 rounded-2xl">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                        <th className="py-3.5 px-5">NGO Partner</th>
                        <th className="py-3.5 px-5">Official Email</th>
                        <th className="py-3.5 px-5">Verification Document</th>
                        <th className="py-3.5 px-5">Verification Status</th>
                        <th className="py-3.5 px-5">Account Status</th>
                        <th className="py-3.5 px-5 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50 text-xs text-slate-700">
                      {filteredNGOs.map(ngo => (
                        <tr key={ngo._id} className="hover:bg-slate-50/50">
                          <td className="py-3.5 px-5">
                            <div className="font-semibold text-slate-900">{ngo.name}</div>
                            <div className="text-[10px] text-slate-400">{ngo.organization || 'Charity'}</div>
                          </td>
                          <td className="py-3.5 px-5">{ngo.email}</td>
                          <td className="py-3.5 px-5">
                            <button
                              onClick={() => setReviewingNgo(ngo)}
                              className="flex items-center gap-1.5 text-xs text-[#059669] hover:underline font-semibold cursor-pointer"
                            >
                              <FileText size={14} />
                              {ngo.ngoDocumentName || 'Registration_Details.pdf'}
                            </button>
                          </td>
                          <td className="py-3.5 px-5">
                            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-bold ${
                              ngo.ngoVerificationStatus === 'verified'
                                ? 'bg-emerald-50 border border-emerald-100 text-emerald-700'
                                : ngo.ngoVerificationStatus === 'pending'
                                ? 'bg-amber-50 border border-amber-100 text-amber-700 animate-pulse'
                                : ngo.ngoVerificationStatus === 'rejected'
                                ? 'bg-red-50 border border-red-100 text-red-700'
                                : 'bg-slate-100 border border-slate-200 text-slate-500'
                            }`}>
                              {ngo.ngoVerificationStatus || 'unverified'}
                            </span>
                          </td>
                          <td className="py-3.5 px-5">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold capitalize ${
                              ngo.isSuspended 
                                ? 'bg-red-50 border border-red-100 text-red-700' 
                                : 'bg-emerald-50 border border-emerald-100 text-emerald-700'
                            }`}>
                              {ngo.isSuspended ? 'Suspended' : 'Active'}
                            </span>
                          </td>
                          <td className="py-3.5 px-5 text-right flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => setReviewingNgo(ngo)}
                              className="bg-emerald-500/10 hover:bg-emerald-500/20 text-[#059669] font-bold py-1 px-2.5 rounded-lg text-[10px] transition-colors cursor-pointer"
                            >
                              Review Docs
                            </button>
                            <button
                              onClick={() => handleToggleNgoSuspended(ngo)}
                              className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                                ngo.isSuspended 
                                  ? 'border-emerald-200 hover:bg-emerald-50 text-[#059669]' 
                                  : 'border-red-100 hover:bg-red-50 text-red-500'
                              }`}
                              title={ngo.isSuspended ? "Unsuspend NGO" : "Suspend NGO"}
                            >
                              <Ban size={13} />
                            </button>
                          </td>
                        </tr>
                      ))}
                      {filteredNGOs.length === 0 && (
                        <tr>
                          <td colSpan="6" className="py-8">
                            <EmptyState 
                              message="No NGO registrations" 
                              description="No NGO verification files or registrations match the criteria selected." 
                            />
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

              </div>
            )}
          </div>
        )}

        {/* --- DONATIONS MANAGEMENT VIEW --- */}
        {activeTab === 'donations' && (
          <div id="donations-panel" role="tabpanel" aria-labelledby="tab-donations">
            {loading ? (
              <TableSkeleton cols={7} />
            ) : (
              <div className="bg-white border border-slate-100 rounded-3xl shadow-sm overflow-hidden flex flex-col gap-4 p-6">
                
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex flex-1 flex-wrap gap-2.5">
                    {/* Search */}
                    <div className="relative flex-1 min-w-[200px] max-w-sm">
                      <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 pointer-events-none">
                        <Search size={16} />
                      </span>
                      <input
                        type="text"
                        placeholder="Search titles, donors, claimants..."
                        value={donationSearch}
                        onChange={(e) => setDonationSearch(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 pl-9 pr-4 text-sm focus:outline-none"
                      />
                    </div>

                    {/* Status Filter */}
                    <div>
                      <select
                        value={donationStatusFilter}
                        onChange={(e) => setDonationStatusFilter(e.target.value)}
                        className="appearance-none bg-slate-50 border border-slate-200 rounded-xl py-2 pl-4 pr-8 text-sm focus:outline-none"
                      >
                        <option value="all">All Statuses</option>
                        <option value="available">Available</option>
                        <option value="claimed">Claimed</option>
                        <option value="completed">Completed</option>
                        <option value="expired">Expired</option>
                      </select>
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div className="flex gap-2.5">
                    <button
                      onClick={handleFlagExpiredDonations}
                      className="flex items-center justify-center gap-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 font-bold py-2 px-3.5 rounded-xl transition-all duration-150 text-xs cursor-pointer"
                    >
                      <AlertTriangle size={14} /> Scan & Flag Expired
                    </button>
                    <button
                      onClick={handleExportDonations}
                      className="flex items-center justify-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2 px-3.5 rounded-xl transition-all duration-150 text-xs cursor-pointer"
                    >
                      <Download size={14} /> CSV Report
                    </button>
                  </div>
                </div>

                {/* Listings table */}
                <div className="overflow-x-auto border border-slate-100 rounded-2xl">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                        <th className="py-3.5 px-5">Food Listing</th>
                        <th className="py-3.5 px-5">Food Category</th>
                        <th className="py-3.5 px-5">Quantity</th>
                        <th className="py-3.5 px-5">Donor (Supplier)</th>
                        <th className="py-3.5 px-5">Claimant (NGO)</th>
                        <th className="py-3.5 px-5">Status</th>
                        <th className="py-3.5 px-5 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50 text-xs text-slate-700">
                      {filteredDonations.map(d => {
                        const isExpired = new Date(d.expiryTime) < new Date() && d.status === 'available';
                        return (
                          <tr key={d._id} className="hover:bg-slate-50/50">
                            <td className="py-3.5 px-5">
                              <div className="font-semibold text-slate-900">{d.title}</div>
                              <div className="text-[10px] text-slate-400 truncate max-w-xs">{d.description || 'No description provided.'}</div>
                              <div className="text-[9px] text-rose-500 font-bold mt-0.5">
                                Expires: {new Date(d.expiryTime).toLocaleString()}
                              </div>
                            </td>
                            <td className="py-3.5 px-5 font-medium capitalize">{d.foodType}</td>
                            <td className="py-3.5 px-5 font-semibold text-slate-900">{d.quantity}</td>
                            <td className="py-3.5 px-5">
                              <div className="font-medium text-slate-800">{d.donor?.name || 'Anonymous'}</div>
                              <div className="text-[10px] text-slate-400">{d.donor?.organization || 'Individual'}</div>
                            </td>
                            <td className="py-3.5 px-5">
                              {d.claimedBy ? (
                                <div>
                                  <div className="font-semibold text-blue-700">{d.claimedBy.name}</div>
                                  <div className="text-[10px] text-slate-400">{d.claimedBy.organization || 'Charity'}</div>
                                </div>
                              ) : (
                                <span className="text-slate-400 italic">Unclaimed</span>
                              )}
                            </td>
                            <td className="py-3.5 px-5">
                              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold ${
                                d.status === 'available'
                                  ? 'bg-emerald-50 border border-emerald-100 text-emerald-700'
                                  : d.status === 'claimed'
                                  ? 'bg-amber-50 border border-amber-100 text-amber-700'
                                  : d.status === 'completed'
                                  ? 'bg-blue-50 border border-blue-100 text-blue-700'
                                  : 'bg-red-50 border border-red-100 text-red-700'
                              }`}>
                                {isExpired ? 'expired (unflagged)' : d.status}
                              </span>
                            </td>
                            <td className="py-3.5 px-5 text-right flex items-center justify-end gap-1.5">
                              {d.status === 'claimed' && (
                                <button
                                  onClick={() => handleCancelRequest(d._id)}
                                  className="bg-red-50 hover:bg-red-100 text-red-600 font-bold py-1 px-2.5 rounded-lg text-[9px] transition-colors cursor-pointer"
                                  title="Cancel Match"
                                >
                                  Reset Match
                                </button>
                              )}
                              <button
                                onClick={() => handleDeleteDonation(d._id)}
                                className="p-1.5 rounded-lg border border-red-100 hover:bg-red-50 text-red-500 transition-colors cursor-pointer"
                                title="Delete Listing"
                              >
                                <Trash2 size={13} />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                      {filteredDonations.length === 0 && (
                        <tr>
                          <td colSpan="7" className="py-8">
                            <EmptyState 
                              message="No donations match filters" 
                              description="No surplus food donation listings matched the filters or search keywords." 
                            />
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

              </div>
            )}
          </div>
        )}

        {/* --- BROADCAST ANNOUNCEMENTS VIEW --- */}
        {activeTab === 'announcements' && (
          <div id="announcements-panel" role="tabpanel" aria-labelledby="tab-announcements">
            {loading ? (
              <BroadcastSkeleton />
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Form Creator */}
                <div className="bg-white border border-slate-100 p-6 rounded-3xl shadow-sm flex flex-col gap-4">
                  <div>
                    <h3 className="font-extrabold text-slate-900 text-base">Broadcast Announcement</h3>
                    <p className="text-xs text-slate-400">Push notifications and system alerts globally</p>
                  </div>

                  <form onSubmit={handleBroadcastAnnouncement} className="flex flex-col gap-4">
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-bold text-slate-600 uppercase pl-1">Alert Title</label>
                      <input
                        type="text"
                        value={newTitle}
                        onChange={(e) => setNewTitle(e.target.value)}
                        required
                        placeholder="e.g. Server Maintenance Notice"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#059669]"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-bold text-slate-600 uppercase pl-1">Message Type</label>
                        <select
                          value={newType}
                          onChange={(e) => setNewType(e.target.value)}
                          className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs focus:outline-none"
                        >
                          <option value="info">Info (Blue)</option>
                          <option value="warning">Warning (Amber)</option>
                          <option value="success">Success (Green)</option>
                          <option value="alert">Alert (Red)</option>
                        </select>
                      </div>

                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-bold text-slate-600 uppercase pl-1">Audience</label>
                        <select
                          value={newAudience}
                          onChange={(e) => setNewAudience(e.target.value)}
                          className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs focus:outline-none"
                        >
                          <option value="all">All Users</option>
                          <option value="donor">Donors Only</option>
                          <option value="charity">NGOs Only</option>
                        </select>
                      </div>
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-bold text-slate-600 uppercase pl-1">Content Body</label>
                      <textarea
                        rows="4"
                        value={newContent}
                        onChange={(e) => setNewContent(e.target.value)}
                        required
                        placeholder="Write announcement body here..."
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#059669] resize-none"
                      ></textarea>
                    </div>

                    <button
                      type="submit"
                      disabled={broadcastLoading}
                      className="bg-[#059669] hover:bg-[#047857] text-white font-bold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all mt-2 cursor-pointer disabled:opacity-50"
                    >
                      {broadcastLoading ? (
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      ) : (
                        <>
                          <Plus size={14} /> Broadcast Announcement
                        </>
                      )}
                    </button>
                  </form>
                </div>

                {/* Previous Broadcasts */}
                <div className="lg:col-span-2 bg-white border border-slate-100 p-6 rounded-3xl shadow-sm flex flex-col gap-4">
                  <div>
                    <h3 className="font-extrabold text-slate-900 text-base">Sent Broadcast Logs</h3>
                    <p className="text-xs text-slate-400">History of dispatched global notifications</p>
                  </div>

                  <div className="flex flex-col gap-3 max-h-[420px] overflow-y-auto pr-2">
                    {announcements.map(ann => (
                      <div key={ann._id} className="p-4 border border-slate-100 rounded-2xl flex flex-col gap-2 relative group hover:border-slate-200 transition-colors">
                        <button
                          onClick={() => handleDeleteAnnouncement(ann._id)}
                          className="absolute top-4 right-4 p-1.5 rounded-lg border border-red-50 text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                          title="Delete Broadcast"
                        >
                          <Trash2 size={12} />
                        </button>

                        <div className="flex flex-wrap items-center gap-2">
                          <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase ${
                            ann.type === 'info' ? 'bg-blue-50 text-blue-600 border border-blue-100' :
                            ann.type === 'warning' ? 'bg-amber-50 text-amber-700 border border-amber-100' :
                            ann.type === 'alert' ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                          }`}>
                            {ann.type}
                          </span>
                          <span className="bg-slate-100 border border-slate-200 text-slate-500 px-2 py-0.5 rounded-full text-[8px] font-bold uppercase">
                            Audience: {ann.targetAudience}
                          </span>
                          <span className="text-[9px] text-slate-400 font-medium ml-auto pr-6">
                            {new Date(ann.createdAt).toLocaleDateString()}
                          </span>
                        </div>

                        <h4 className="font-bold text-slate-900 text-sm">{ann.title}</h4>
                        <p className="text-xs text-slate-600 leading-relaxed">{ann.content}</p>
                        <div className="text-[9px] text-slate-400 font-bold mt-1">
                          Author: {ann.createdBy?.name || 'System Admin'}
                        </div>
                      </div>
                    ))}

                    {announcements.length === 0 && (
                      <div className="text-center py-12 text-sm text-slate-400 border border-dashed border-slate-200 rounded-2xl">
                        No announcements previously dispatched. Use the composer form to broadcast.
                      </div>
                    )}
                  </div>
                </div>

              </div>
            )}
          </div>
        )}

        {/* --- SYSTEM VIEW --- */}
        {activeTab === 'system' && (
          <div id="system-panel" role="tabpanel" aria-labelledby="tab-system">
            {loading ? (
              <SystemSkeleton />
            ) : system ? (
              <div className="flex flex-col gap-6">
                {/* Last checked banner */}
                {system.checkedAt && (
                  <div className="flex items-center gap-2 text-xs text-slate-400 font-semibold">
                    <Activity size={14} className="text-[#059669]" />
                    Last telemetry sync: {new Date(system.checkedAt).toLocaleString()}
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Resource Utilization */}
                  <div className="bg-white border border-slate-100 p-6 rounded-3xl shadow-sm flex flex-col gap-4">
                    <h3 className="font-extrabold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-2 text-base">
                      <Activity size={18} className="text-[#059669]" />
                      Resource Utilization & Telemetry
                    </h3>
                    <div className="flex flex-col gap-2.5 text-sm">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Server Uptime</span>
                        <span className="font-semibold text-slate-800">{system.uptime}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Memory RSS Allocation</span>
                        <span className="font-semibold text-slate-800">{system.memory.rss}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Heap Allocation Size</span>
                        <span className="font-semibold text-slate-800">{system.memory.heapTotal}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Heap Used Size</span>
                        <span className="font-semibold text-slate-800">{system.memory.heapUsed}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Node.js Engine Version</span>
                        <span className="font-semibold text-slate-800">{system.server?.nodeVersion}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Environment</span>
                        <span className={`font-bold capitalize ${
                          system.server?.environment === 'production' ? 'text-emerald-600' : 'text-amber-600'
                        }`}>
                          {system.server?.environment || 'development'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Database Engine Health */}
                  <div className="bg-white border border-slate-100 p-6 rounded-3xl shadow-sm flex flex-col gap-4">
                    <h3 className="font-extrabold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-2 text-base">
                      <Database size={18} className="text-[#059669]" />
                      Database Engine Health
                    </h3>
                    <div className="flex flex-col gap-2.5 text-sm">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400">Database Connection</span>
                        <span className={`inline-flex items-center gap-1.5 font-bold text-sm ${
                          system.database?.status === 'Connected'
                            ? 'text-[#059669]'
                            : system.database?.status === 'Connecting'
                            ? 'text-amber-600'
                            : 'text-red-600'
                        }`}>
                          <span className={`w-2 h-2 rounded-full ${
                            system.database?.status === 'Connected'
                              ? 'bg-emerald-500'
                              : system.database?.status === 'Connecting'
                              ? 'bg-amber-500 animate-pulse'
                              : 'bg-red-500'
                          }`} />
                          {system.database?.status || 'Unknown'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Round-Trip Latency</span>
                        <span className={`font-semibold ${
                          system.database?.latencyMs !== null && system.database?.latencyMs < 50
                            ? 'text-[#059669]'
                            : system.database?.latencyMs < 200
                            ? 'text-amber-600'
                            : 'text-red-500'
                        }`}>
                          {system.database?.latency || 'N/A'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Connection URI</span>
                        <span className="font-mono text-xs text-slate-600 max-w-[200px] truncate">
                          {system.database?.uri || 'localhost'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">API Server Status</span>
                        <span className="font-bold text-[#059669]">{system.server?.status || 'Healthy'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <EmptyState 
                message="Telemetry unavailable" 
                description="Unable to reach the health endpoints. Verify backend connection settings." 
              />
            )}
          </div>
        )}

      </div>

      {/* --- EDIT USER MODAL --- */}
      {editingUser && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[32px] border border-slate-100 p-8 max-w-md w-full shadow-2xl text-slate-800 flex flex-col gap-6">
            <div>
              <h3 className="text-xl font-bold text-slate-900">Modify User Attributes</h3>
              <p className="text-xs text-slate-500 mt-1">Admin console override settings.</p>
            </div>
            
            <form onSubmit={handleUpdateUser} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase pl-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#059669]"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase pl-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#059669]"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase pl-1">Role Zone</label>
                <select
                  value={editRole}
                  onChange={(e) => setEditRole(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-[#059669]"
                >
                  <option value="donor">Donor (Supplier)</option>
                  <option value="charity">NGO / Charity (Claimant)</option>
                  <option value="admin">System Admin</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase pl-1">Organization Name</label>
                <input
                  type="text"
                  value={editOrg}
                  onChange={(e) => setEditOrg(e.target.value)}
                  placeholder="Individual / Foundation"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#059669]"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase pl-1">Address Location</label>
                <input
                  type="text"
                  value={editAddress}
                  onChange={(e) => setEditAddress(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#059669]"
                />
              </div>

              <div className="flex gap-3 mt-3">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold py-2.5 rounded-xl transition-all text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-[#059669] hover:bg-[#047857] text-white font-bold py-2.5 rounded-xl transition-all text-xs cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- NGO DOCUMENT REVIEW MODAL --- */}
      {reviewingNgo && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[32px] border border-slate-100 p-8 max-w-lg w-full shadow-2xl text-slate-800 flex flex-col gap-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-lg font-black text-slate-900">Certificate & Credentials Audit</h3>
                <p className="text-xs text-slate-400">NGO Partner: {reviewingNgo.name}</p>
              </div>
              <button onClick={() => setReviewingNgo(null)} className="text-slate-400 hover:text-slate-600 font-bold text-xl cursor-pointer">
                &times;
              </button>
            </div>

            <div className="flex flex-col gap-4 text-xs">
              <div className="bg-slate-50 p-4 rounded-2xl flex flex-col gap-2.5 border border-slate-100">
                <h4 className="font-bold text-slate-700 uppercase tracking-wider text-[10px]">Document Metadata</h4>
                <div className="flex justify-between border-b border-slate-200/50 pb-1">
                  <span className="text-slate-400">Document Filename</span>
                  <span className="font-semibold text-slate-800">{reviewingNgo.ngoDocumentName || 'NGO_Incorporation_Certificate.pdf'}</span>
                </div>
                <div className="flex justify-between border-b border-slate-200/50 pb-1">
                  <span className="text-slate-400">Upload Date</span>
                  <span className="font-semibold text-slate-800">{new Date(reviewingNgo.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between border-b border-slate-200/50 pb-1">
                  <span className="text-slate-400">Certificate Status</span>
                  <span className="font-bold text-emerald-700 capitalize">{reviewingNgo.ngoVerificationStatus || 'unverified'}</span>
                </div>
                <div className="flex justify-between pb-1">
                  <span className="text-slate-400">Tax Exempt Registration</span>
                  <span className="font-semibold text-slate-800">Yes (Section 80G Certified)</span>
                </div>
              </div>

              {/* Simulated Document Preview */}
              <div className="border border-slate-200 rounded-2xl p-5 bg-white shadow-inner flex flex-col gap-3 font-serif relative overflow-hidden">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 border-[6px] border-emerald-500/10 rounded-full flex items-center justify-center pointer-events-none">
                  <span className="text-emerald-500/5 font-black text-xl tracking-widest uppercase">Verified Seal</span>
                </div>
                <div className="text-center font-bold text-slate-900 border-b border-slate-100 pb-2 flex flex-col items-center">
                  <span className="text-xs tracking-wider uppercase font-sans text-slate-500">Government Registry of Charities</span>
                  <span className="text-sm font-black mt-1">Incorporation and Operation Authorization</span>
                </div>
                <div className="text-[11px] leading-relaxed text-slate-700 font-sans p-1">
                  This document certifies that <strong className="text-slate-900">{reviewingNgo.organization || reviewingNgo.name}</strong> is registered under the Charity Commission regulations. It is authorized to solicit and distribute surplus foodstuffs and conduct relief operations.
                </div>
                <div className="flex justify-between items-end mt-4 pt-2 border-t border-slate-100 font-sans text-[9px] text-slate-400">
                  <div>
                    <div>Verification URL:</div>
                    <span className="text-[#059669] underline break-all">{reviewingNgo.ngoDocumentUrl || 'https://registry.gov/verify/ngo-' + reviewingNgo._id.substring(0, 8)}</span>
                  </div>
                  <div className="text-right">
                    <strong>Commissioner Signature</strong>
                    <div>Authorized Audit Office</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Verification options */}
            <div className="flex gap-2.5 mt-2">
              <button
                onClick={() => handleVerifyNgo(reviewingNgo._id, 'rejected')}
                className="flex-1 bg-red-50 hover:bg-red-100 text-red-600 font-bold py-2.5 rounded-xl transition-all text-xs cursor-pointer"
              >
                Reject Certificate
              </button>
              <button
                onClick={() => handleVerifyNgo(reviewingNgo._id, 'verified')}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 rounded-xl transition-all text-xs flex items-center justify-center gap-1 cursor-pointer"
              >
                <Check size={14} /> Approve NGO Partner
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
