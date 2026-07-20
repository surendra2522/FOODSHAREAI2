import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api from '../utils/api';
import { 
  Package, Utensils, Award, CheckCircle2, MapPin, Clock, ArrowRight, 
  ShieldCheck, Flame, BellRing, Sparkles, Map, Search, 
  RefreshCw, CheckSquare, Truck, Navigation, ChevronRight,
  Info, Calendar, Check, AlertTriangle, User, X, Compass,
  Copy, Phone, Mail, FileText
} from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';

// ── Leaflet Assets fix ────────────────────────────────────────────────────────
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Premium custom Leaflet Marker icon matching the urgent theme
const redMarkerIcon = new L.DivIcon({
  className: 'custom-urgent-marker',
  html: `
    <div style="position: relative; display: flex; flex-direction: column; align-items: center;">
      <div style="background-color: #EF4444; padding: 8px; border-radius: 50%; border: 2px solid white; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1); display: flex; align-items: center; justify-content: center; color: white;">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
      </div>
      <div style="width: 2px; height: 8px; background-color: #EF4444; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);"></div>
    </div>
  `,
  iconSize: [28, 38],
  iconAnchor: [14, 38]
});

// Premium custom Leaflet Marker icon matching the normal theme
const greenMarkerIcon = new L.DivIcon({
  className: 'custom-normal-marker',
  html: `
    <div style="position: relative; display: flex; flex-direction: column; align-items: center;">
      <div style="background-color: #059669; padding: 8px; border-radius: 50%; border: 2px solid white; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1); display: flex; align-items: center; justify-content: center; color: white;">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
      </div>
      <div style="width: 2px; height: 8px; background-color: #059669; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);"></div>
    </div>
  `,
  iconSize: [28, 38],
  iconAnchor: [14, 38]
});

// Premium custom Leaflet Marker icon matching the volunteer theme
const volunteerMarkerIcon = new L.DivIcon({
  className: 'custom-volunteer-marker',
  html: `
    <div style="position: relative; display: flex; flex-direction: column; align-items: center;">
      <div style="background-color: #3B82F6; padding: 8px; border-radius: 50%; border: 2px solid white; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1); display: flex; align-items: center; justify-content: center; color: white;">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>
      </div>
      <div style="width: 2px; height: 8px; background-color: #3B82F6; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);"></div>
    </div>
  `,
  iconSize: [28, 38],
  iconAnchor: [14, 38]
});

// Helper component to pan Leaflet map
function ChangeView({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView(center, zoom);
    }
  }, [center, zoom, map]);
  return null;
}

export default function NgoDashboard() {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ meals: 0, active: 0, completed: 0, nearby: 0 });
  const [selectedActiveMission, setSelectedActiveMission] = useState(null);
  const [showNotification, setShowNotification] = useState(false);
  const [error, setError] = useState('');

  // ── New Logistics State ──────────────────────────────────────────────────────
  const [localStatuses, setLocalStatuses] = useState(() => {
    try {
      const saved = localStorage.getItem('foodshare_local_statuses');
      return saved ? JSON.parse(saved) : {};
    } catch (e) {
      return {};
    }
  });

  const getLocalStatus = (donationId) => {
    return localStatuses[donationId] || null;
  };

  const setLocalStatus = (donationId, statusValue) => {
    const updated = { ...localStatuses, [donationId]: statusValue };
    setLocalStatuses(updated);
    localStorage.setItem('foodshare_local_statuses', JSON.stringify(updated));
  };

  const [proofPhoto, setProofPhoto] = useState(null);
  const [recipientName, setRecipientName] = useState('');
  const [recipientSignature, setRecipientSignature] = useState('');
  const [deliveryNotes, setDeliveryNotes] = useState('');
  const [confirmChecked, setConfirmChecked] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState('');

  useEffect(() => {
    setProofPhoto(null);
    setRecipientName('');
    setRecipientSignature('');
    setDeliveryNotes('');
    setConfirmChecked(false);
  }, [selectedActiveMission]);

  useEffect(() => {
    if (!selectedActiveMission) return;
    const updateTime = () => {
      const diff = new Date(selectedActiveMission.expiryTime) - new Date();
      if (diff <= 0) {
        setTimeRemaining('Expired');
        return;
      }
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      setTimeRemaining(`${hours}h ${mins}m`);
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, [selectedActiveMission]);

  const getTimeRemaining = (expiryStr) => {
    const diff = new Date(expiryStr) - new Date();
    if (diff <= 0) return 'Expired';
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    if (hours > 0) return `${hours}h left`;
    return `${mins}m left`;
  };

  const isUrgent = (expiryStr) => {
    const diff = new Date(expiryStr) - new Date();
    return diff > 0 && diff < 3 * 3600 * 1000; // less than 3 hours
  };

  const getMealsCount = (qtyStr) => {
    const match = String(qtyStr || '').match(/(\d+(\.\d+)?)/);
    return match ? Math.round(parseFloat(match[0])) : 0;
  };

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [res, statsRes] = await Promise.all([
        api.get('/donations'),
        api.get('/donations/stats')
      ]);
      const all = res.data;
      setDonations(all);

      const available = all.filter(d => d.status === 'available');

      setStats({
        meals: statsRes.data.totalMeals || 0,
        active: statsRes.data.activeMissions || 0,
        completed: statsRes.data.totalDonations - statsRes.data.activeMissions || 0,
        nearby: available.length
      });

      // Keep selected active mission state synchronized with database changes
      if (selectedActiveMission) {
        const updated = all.find(d => d._id === selectedActiveMission._id);
        if (updated) {
          setSelectedActiveMission(updated);
        }
      }
    } catch (err) {
      console.error('Error fetching dashboard listings', err);
      setError('Unable to load listings. The database/backend connection is currently offline.');
    } finally {
      setLoading(false);
    }
  }, [user, selectedActiveMission]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const claimMission = async (id) => {
    try {
      const res = await api.put(`/donations/${id}/claim`);
      await fetchData();
      addToast('Mission successfully claimed! View logistics details below.', 'success');
      // Auto open claimed mission details view (Screenshot 3)
      setSelectedActiveMission(res.data.donation || res.data);
    } catch (err) {
      addToast(err.response?.data?.message || 'Error claiming this mission', 'error');
    }
  };

  const updateMissionStatus = async (id, newStatus) => {
    try {
      await api.put(`/donations/${id}/status`, { status: newStatus });
      await fetchData();
      addToast(`Mission status updated to "${newStatus}"`, 'success');
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to update mission status', 'error');
    }
  };

  // Available food listings
  const availableMissions = donations.filter(d => d.status === 'available');

  // Claimed active missions — safely compare ObjectId string or populated object
  const myClaimedMissions = donations.filter(d =>
    String(d.claimedBy?._id || d.claimedBy) === String(user?._id || user?.id) &&
    ['claimed', 'NGO Accepted', 'Picked Up', 'In Transit', 'Delivered', 'completed'].includes(d.status)
  );

  const getCurrentStep = (mission) => {
    const status = mission.status;
    const localVal = getLocalStatus(mission._id);
    
    if (status === 'completed') return 8;
    if (status === 'Delivered') return 7;
    if (status === 'In Transit') return 6;
    if (status === 'Picked Up') return 5;
    if (localVal === 'Pickup Started') return 4;
    if (status === 'claimed' || status === 'NGO Accepted') return 3;
    if (status === 'available') return 2;
    return 1;
  };

  const handleCopyAddress = (address) => {
    navigator.clipboard.writeText(address);
    addToast('Pickup Address copied to clipboard!', 'success');
  };

  const handleProofPhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProofPhoto(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const getFoodImage = (foodType) => {
    const images = {
      produce: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=600&q=80',
      bakery: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=600&q=80',
      prepared: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80',
      dairy: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?auto=format&fit=crop&w=600&q=80',
      meat: 'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?auto=format&fit=crop&w=600&q=80',
      pantry: 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?auto=format&fit=crop&w=600&q=80'
    };
    return images[String(foodType).toLowerCase().trim()] || 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=600&q=80';
  };

  const formatTime = (dateStr) => {
    if (!dateStr) return '--';
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return '--';
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Premium skeleton loader
  if (loading && donations.length === 0) {
    return (
      <div className="flex-1 bg-[#F8FAFC] py-10 px-4 sm:px-6 md:px-8 max-w-7xl mx-auto w-full flex flex-col gap-6 animate-pulse">
        <div className="h-10 bg-slate-200 rounded-2xl w-1/4"></div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="h-24 bg-slate-200 rounded-[24px]"></div>
          <div className="h-24 bg-slate-200 rounded-[24px]"></div>
          <div className="h-24 bg-slate-200 rounded-[24px]"></div>
          <div className="h-24 bg-slate-200 rounded-[24px]"></div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 h-[350px] bg-slate-200 rounded-[32px]"></div>
          <div className="h-[350px] bg-slate-200 rounded-[32px]"></div>
        </div>
      </div>
    );
  }

  // Render Dashboard View (Screenshot 2)
  if (!selectedActiveMission) {
    return (
      <div className="flex-1 bg-[#F8FAFC] py-10 px-4 sm:px-6 md:px-8 max-w-7xl mx-auto w-full flex flex-col gap-6 text-slate-800">
        
        {/* NGO Control Center Header Block */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex flex-col gap-1">
            <span className="text-xs font-bold text-[#059669] uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck size={14} /> NGO Control Center
            </span>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mt-1 flex items-center gap-3">
              Welcome, <span className="text-slate-800 font-bold">{user?.organization || '456'}</span>
              <button 
                onClick={() => setShowNotification(!showNotification)}
                className="w-10 h-10 rounded-full bg-white border border-slate-100 shadow-sm flex items-center justify-center text-slate-500 hover:text-slate-800 transition relative"
              >
                <BellRing size={18} />
                <span className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-[#059669]" />
              </button>
            </h1>
            <p className="text-slate-500 text-sm mt-1">Real-time alerts for surplus food available in your immediate vicinity.</p>
          </div>

          {/* Impact Stats Card */}
          <div className="bg-white border border-slate-100 rounded-2xl px-5 py-3 shadow-sm flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-emerald-50 text-[#059669] border border-emerald-100">
              <Award size={18} />
            </div>
            <div>
              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Impact</span>
              <span className="text-sm font-extrabold text-slate-800">{stats.meals || 0} Meals</span>
              <span className="text-[10px] text-slate-400 block">redistributed this year</span>
            </div>
          </div>
        </div>

        {/* Announcements Modal Overlay */}
        {showNotification && (
          <div className="p-4 bg-amber-50 border border-amber-100 rounded-2xl text-xs text-amber-800 flex flex-col gap-1 animate-fade-in shadow-sm">
            <div className="font-bold flex items-center gap-1.5"><Info size={14} /> Food safety alert:</div>
            <p>Please complete delivery verification logs within 2 hours of pickup to keep compliance ratings high.</p>
          </div>
        )}

        {error && (
          <div className="p-4 rounded-xl bg-red-50 border border-red-100 text-red-650 text-sm flex items-start gap-2.5">
            <AlertTriangle size={18} className="flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Split screen content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-2">
          
          {/* Left Column: Map card */}
          <div className="bg-white border border-slate-100 rounded-[32px] p-5 shadow-sm flex flex-col gap-4">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Map size={14} className="text-[#059669]" /> Live Mission Map
            </span>
            
            <div className="w-full h-[400px] rounded-2xl overflow-hidden border border-slate-100 relative z-10">
              <MapContainer 
                center={[17.3850, 78.4867]} 
                zoom={12} 
                style={{ width: '100%', height: '100%' }}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                
                {availableMissions.filter(d => d.latitude).map(d => {
                  const urgent = isUrgent(d.expiryTime);
                  return (
                    <Marker 
                      key={d._id} 
                      position={[d.latitude, d.longitude]} 
                      icon={urgent ? redMarkerIcon : greenMarkerIcon}
                    >
                      <Popup>
                        <div className="text-xs p-1 flex flex-col gap-1">
                          <span className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${urgent ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'}`}>
                            {urgent ? 'Urgent' : 'Available'}
                          </span>
                          <h4 className="font-bold text-slate-800 mt-1">{d.title}</h4>
                          <span className="text-slate-500">{d.quantity}</span>
                          <button 
                            onClick={() => claimMission(d._id)}
                            className="mt-2 bg-[#0F172A] text-white text-[10px] font-bold py-1.5 px-3 rounded-lg hover:bg-slate-800 transition"
                          >
                            Claim Mission
                          </button>
                        </div>
                      </Popup>
                    </Marker>
                  );
                })}
              </MapContainer>

              {/* Legend overlay */}
              <div className="absolute bottom-4 left-4 z-[400] bg-white/90 backdrop-blur border border-slate-100 p-2.5 rounded-xl text-[10px] font-extrabold flex gap-3 shadow-md">
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-[#059669]" /> Available</span>
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-orange-500" /> Claimed</span>
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-blue-500" /> Completed</span>
              </div>
            </div>
          </div>

          {/* Right Column: Feeds & Claims */}
          <div className="flex flex-col gap-6">
            
            {/* Live City Feed */}
            <div className="bg-white border border-slate-100 rounded-[32px] p-6 shadow-sm flex flex-col gap-4 flex-1">
              <div className="flex items-center justify-between border-b border-slate-50 pb-2">
                <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                  <span className="text-emerald-500 font-black">&bull;</span> Live City Feed
                </h3>
                <span className="text-[9px] bg-emerald-100 text-emerald-700 font-extrabold px-2 py-0.5 rounded-md uppercase tracking-wider">
                  Live
                </span>
              </div>

              {/* Listings Scroll Feed */}
              <div className="flex flex-col gap-4 overflow-y-auto max-h-[320px] pr-2">
                {availableMissions.length === 0 ? (
                  <div className="text-center py-10 flex flex-col items-center gap-3">
                    <div className="w-12 h-12 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-center">
                      <Search size={20} className="text-slate-300" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-600">No live donations available.</p>
                      <p className="text-xs text-slate-400 mt-0.5">New items appear here in real-time as donors post surplus food.</p>
                    </div>
                  </div>
                ) : (
                  availableMissions.map(d => {
                    const urgent = isUrgent(d.expiryTime);
                    const meals = getMealsCount(d.quantity);
                    return (
                      <div key={d._id} className="bg-slate-50 border border-slate-100 rounded-2xl p-4 flex flex-col gap-3 relative hover:shadow-sm transition">
                        
                        {/* Top row */}
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${urgent ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'}`}>
                              <Utensils size={18} />
                            </div>
                            <div>
                              <h4 className="font-bold text-slate-900 text-sm">{d.title}</h4>
                              <span className="text-[10px] text-slate-400 font-bold block">Local Food Partner</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="text-[10px] text-slate-500 font-bold flex items-center gap-1">
                              <MapPin size={10} className="text-slate-400" /> {d.pickupAddress || 'Jubilee Hills'}
                            </span>
                            <span className="text-[10px] text-slate-500 font-bold flex items-center gap-1">
                              <Clock size={10} className="text-slate-400" /> {getTimeRemaining(d.expiryTime)}
                            </span>
                            {urgent && (
                              <span className="text-[9px] bg-red-100 text-red-700 font-black px-2 py-0.5 rounded-md uppercase flex items-center gap-0.5 animate-pulse">
                                <Flame size={10} /> Urgent
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Bottom Row */}
                        <div className="flex items-center justify-between border-t border-slate-100/50 pt-2.5 mt-1">
                          <div>
                            <span className="text-[9px] font-bold text-slate-400 uppercase block">Quantity</span>
                            <span className="text-xs font-black text-emerald-600">{meals} Meals</span>
                          </div>
                          <button 
                            onClick={() => claimMission(d._id)}
                            className="bg-[#0F172A] hover:bg-[#1E293B] text-white text-xs font-bold py-2 px-4 rounded-xl transition shadow-sm"
                          >
                            Claim Mission
                          </button>
                        </div>

                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* My Claimed Missions List */}
            <div className="bg-white border border-slate-100 rounded-[32px] p-6 shadow-sm flex flex-col gap-4">
              <h3 className="font-extrabold text-slate-900 text-base">My Claimed Missions</h3>
              
              <div className="flex flex-col gap-3">
                {myClaimedMissions.length === 0 ? (
                  <div className="text-center py-8 flex flex-col items-center gap-3">
                    <div className="w-14 h-14 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-center">
                      <Compass size={24} className="text-slate-300" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-600">No active missions yet.</p>
                      <p className="text-xs text-slate-400 mt-0.5">Claim a donation from the Live City Feed above to get started.</p>
                    </div>
                  </div>
                ) : (
                  myClaimedMissions.map(m => (
                    <button 
                      key={m._id}
                      onClick={() => setSelectedActiveMission(m)}
                      className="w-full text-left bg-slate-50 border border-slate-100 rounded-2xl p-4 flex items-center justify-between hover:bg-slate-100/50 transition group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-emerald-50 text-[#059669] flex items-center justify-center">
                          <Compass size={16} />
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-800 text-sm">{m.title}</h4>
                          <span className="text-xs text-slate-400 font-semibold">{getMealsCount(m.quantity)} meals &bull; {m.pickupAddress || 'Banjara Hills'}</span>
                        </div>
                      </div>
                      <ChevronRight className="text-slate-400 group-hover:translate-x-1 transition-transform" size={16} />
                    </button>
                  ))
                )}
              </div>
            </div>

          </div>

        </div>

      </div>
    );
  }

  // Render Mission Tracking Detail View (Screenshot 3)
  // Render Mission Tracking Detail View (Screenshot 3)
  const currentStepIndex = selectedActiveMission ? getCurrentStep(selectedActiveMission) : 1;
  const pickupCoords = selectedActiveMission && selectedActiveMission.latitude 
    ? [selectedActiveMission.latitude, selectedActiveMission.longitude] 
    : [17.4065, 78.4772];
  
  const deliveryCoords = [pickupCoords[0] + 0.008, pickupCoords[1] - 0.012];
  const volunteerCoords = [pickupCoords[0] + 0.004, pickupCoords[1] - 0.006];

  return (
    <div className="flex-1 bg-[#F8FAFC] py-10 px-4 sm:px-6 md:px-8 max-w-7xl mx-auto w-full flex flex-col gap-8 text-slate-800">
      
      {/* Mission Logistics Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-100 pb-6">
        <div className="flex flex-col gap-1.5">
          <span className="text-xs font-bold text-[#059669] uppercase tracking-wider">
            Logistics Portal &bull; Live Mission Track
          </span>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">
              Mission <span className="text-[#059669]">#FD-{selectedActiveMission._id.slice(-4).toUpperCase()}</span>
            </h1>
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
              selectedActiveMission.status === 'completed'
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : 'bg-blue-50 text-blue-700 border border-blue-200 animate-pulse'
            }`}>
              {selectedActiveMission.status}
            </span>
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
              isUrgent(selectedActiveMission.expiryTime)
                ? 'bg-red-50 text-red-700 border border-red-200'
                : 'bg-amber-50 text-amber-700 border border-amber-200'
            }`}>
              {isUrgent(selectedActiveMission.expiryTime) ? 'High Priority' : 'Medium Priority'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="bg-white border border-slate-100 rounded-2xl px-5 py-3 shadow-sm flex items-center gap-3">
            <Clock size={18} className="text-slate-400" />
            <div>
              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Expires In</span>
              <span className="text-sm font-extrabold text-slate-800">{timeRemaining}</span>
            </div>
          </div>
          
          <button 
            onClick={() => setSelectedActiveMission(null)}
            className="flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-800 bg-white border border-slate-100 shadow-sm px-4 py-3 rounded-2xl transition hover:shadow-md"
          >
            <X size={16} /> Close Tracker
          </button>
        </div>
      </div>

      {/* Stepper Progress */}
      <div className="bg-white border border-slate-100 rounded-[32px] p-6 shadow-sm overflow-hidden">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 md:gap-4 relative mt-2">
          {/* Background progress bar line */}
          <div className="absolute top-1/2 left-0 right-0 h-1 bg-slate-100 -translate-y-1/2 hidden md:block z-0" />
          <div 
            className="absolute top-1/2 left-0 h-1 bg-[#059669] -translate-y-1/2 hidden md:block z-0 transition-all duration-500 shadow-[0_0_8px_#10B981]" 
            style={{ width: `${((currentStepIndex - 1) / 7) * 100}%` }}
          />

          {/* Stepper Nodes */}
          {[
            { label: 'Donation Posted', icon: Package },
            { label: 'AI Verified', icon: Sparkles },
            { label: 'NGO Accepted', icon: CheckSquare },
            { label: 'Pickup Started', icon: Navigation },
            { label: 'Food Picked Up', icon: Utensils },
            { label: 'In Transit', icon: Truck },
            { label: 'Delivered', icon: MapPin },
            { label: 'Completed', icon: CheckCircle2 }
          ].map((step, idx) => {
            const stepNum = idx + 1;
            const completed = stepNum < currentStepIndex;
            const current = stepNum === currentStepIndex;
            const active = stepNum <= currentStepIndex;
            const StepIcon = step.icon;
            
            return (
              <div key={idx} className="flex md:flex-col items-center gap-3 md:gap-2.5 z-10 w-full md:w-auto text-center">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all duration-500 ${
                  current 
                    ? 'bg-[#059669] border-[#059669] text-white shadow-[0_0_15px_#10B981] scale-110 animate-pulse'
                    : completed
                      ? 'bg-emerald-600 border-emerald-600 text-white'
                      : 'bg-white border-slate-200 text-slate-400'
                }`}>
                  <StepIcon size={18} />
                </div>
                <div className="flex flex-col text-left md:text-center mt-1">
                  <span className={`text-xs font-extrabold ${active ? 'text-slate-900 font-black' : 'text-slate-400 font-semibold'}`}>
                    {step.label}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Logistics Split Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Columns: Map, Live Tracking, Timelines */}
        <div className="lg:col-span-2 flex flex-col gap-8">
          
          {/* Location Map Card */}
          <div className="bg-white border border-slate-100 rounded-[32px] p-6 shadow-sm flex flex-col gap-4 hover:shadow-md transition duration-200">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Map size={14} className="text-[#059669]" /> Live Mission Route Map
            </span>

            <div className="w-full h-[360px] rounded-2xl overflow-hidden border border-slate-100 relative z-10">
              {selectedActiveMission.latitude ? (
                <MapContainer 
                  center={pickupCoords} 
                  zoom={14} 
                  style={{ width: '100%', height: '100%' }}
                  zoomControl={false}
                  attributionControl={false}
                >
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                  <Marker position={pickupCoords} icon={greenMarkerIcon}>
                    <Popup><span className="text-xs font-bold">Pickup: {selectedActiveMission.pickupAddress}</span></Popup>
                  </Marker>
                  <Marker position={deliveryCoords} icon={redMarkerIcon}>
                    <Popup><span className="text-xs font-bold">Delivery Location</span></Popup>
                  </Marker>
                  <Marker position={volunteerCoords} icon={volunteerMarkerIcon}>
                    <Popup><span className="text-xs font-bold">Volunteer: Alex Miller</span></Popup>
                  </Marker>
                  <Polyline positions={[pickupCoords, deliveryCoords]} color="#059669" dashArray="6, 8" weight={3} />
                </MapContainer>
              ) : (
                <div className="bg-slate-50 h-full w-full flex items-center justify-center text-xs text-slate-400 font-medium">
                  <AlertTriangle size={16} className="mr-1.5" /> Coordinates unavailable
                </div>
              )}
              
              {/* Live GPS Coordination HUD */}
              <div className="absolute top-4 left-4 z-[400] bg-slate-900/90 text-white backdrop-blur px-3 py-1.5 rounded-xl text-[10px] font-mono shadow-md flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                GPS: {selectedActiveMission.latitude?.toFixed(4)}, {selectedActiveMission.longitude?.toFixed(4)}
              </div>

              {/* Travel metrics HUD overlay */}
              <div className="absolute bottom-4 right-4 z-[400] bg-white/95 backdrop-blur border border-slate-100 p-3 rounded-2xl text-xs font-extrabold flex gap-4 shadow-lg">
                <div>
                  <span className="text-[9px] text-slate-400 block uppercase">Distance</span>
                  <span className="text-slate-800 text-sm">3.8 km</span>
                </div>
                <div className="border-l border-slate-100 pl-4">
                  <span className="text-[9px] text-slate-400 block uppercase">Travel Time</span>
                  <span className="text-[#059669] text-sm">12 mins</span>
                </div>
              </div>
            </div>

            {/* Addresses & Actions */}
            <div className="flex flex-col gap-3 mt-1">
              <div className="flex flex-col gap-2.5 text-xs">
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-emerald-50 text-[#059669] flex items-center justify-center flex-shrink-0 mt-0.5 font-bold">A</div>
                  <div>
                    <span className="text-[9px] text-slate-400 block uppercase font-bold">Pickup Address</span>
                    <span className="text-slate-800 font-bold">{selectedActiveMission.pickupAddress}</span>
                  </div>
                </div>
                <div className="flex items-start gap-3 border-t border-slate-50 pt-2.5">
                  <div className="w-5 h-5 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center flex-shrink-0 mt-0.5 font-bold">B</div>
                  <div>
                    <span className="text-[9px] text-slate-400 block uppercase font-bold">Delivery Address</span>
                    <span className="text-slate-800 font-bold">Nearest Verified Community Care Center, Care District</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 border-t border-slate-100/50 pt-3">
                <button 
                  onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&origin=${selectedActiveMission.latitude},${selectedActiveMission.longitude}&destination=${selectedActiveMission.latitude + 0.008},${selectedActiveMission.longitude - 0.012}`, '_blank')}
                  className="bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold py-2.5 rounded-xl transition flex items-center justify-center gap-1.5"
                >
                  <Navigation size={14} /> Navigate
                </button>
                <button 
                  onClick={() => handleCopyAddress(selectedActiveMission.pickupAddress)}
                  className="bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold py-2.5 rounded-xl transition flex items-center justify-center gap-1.5"
                >
                  <Copy size={14} /> Copy Address
                </button>
                <button 
                  onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${selectedActiveMission.latitude},${selectedActiveMission.longitude}`, '_blank')}
                  className="bg-[#059669] hover:bg-[#047857] text-white text-xs font-bold py-2.5 rounded-xl transition flex items-center justify-center gap-1.5"
                >
                  Directions
                </button>
              </div>
            </div>
          </div>

          {/* Live Tracking Information Card */}
          <div className="bg-white border border-slate-100 rounded-[32px] p-6 shadow-sm hover:shadow-md transition duration-200 flex flex-col gap-4">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Clock size={14} className="text-[#059669]" /> Logistics Live Tracking
            </span>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div className="bg-slate-50 p-4 rounded-2xl flex flex-col gap-1">
                <span className="text-[10px] text-slate-400 font-extrabold uppercase">Current Status</span>
                <span className="text-xs font-extrabold text-[#059669] uppercase">
                  {selectedActiveMission.status === 'In Transit' ? 'In Transit' :
                   selectedActiveMission.status === 'Picked Up' ? 'Picked Up' : 'NGO Claimed'}
                </span>
              </div>
              <div className="bg-slate-50 p-4 rounded-2xl flex flex-col gap-1">
                <span className="text-[10px] text-slate-400 font-extrabold uppercase">Distance Left</span>
                <span className="text-sm font-extrabold text-slate-800">1.8 km</span>
              </div>
              <div className="bg-slate-50 p-4 rounded-2xl flex flex-col gap-1">
                <span className="text-[10px] text-slate-400 font-extrabold uppercase">ETA</span>
                <span className="text-sm font-extrabold text-slate-800">7 mins</span>
              </div>
              <div className="bg-slate-50 p-4 rounded-2xl flex flex-col gap-1">
                <span className="text-[10px] text-slate-400 font-extrabold uppercase">Active Timer</span>
                <span className="text-sm font-extrabold text-[#059669] font-mono">14m 32s</span>
              </div>
            </div>
          </div>

          {/* Mission Details Scope */}
          <div className="bg-white border border-slate-100 rounded-[32px] p-6 shadow-sm hover:shadow-md transition duration-200 flex flex-col gap-4">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <FileText size={14} className="text-[#059669]" /> Redistribution Mission Scope
            </span>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-semibold text-slate-700">
              <div className="flex justify-between border-b border-slate-50 pb-2">
                <span className="text-slate-400 font-bold uppercase tracking-wider text-[9px]">Scheduled Pickup Time</span>
                <span>{formatTime(selectedActiveMission.createdAt)}</span>
              </div>
              <div className="flex justify-between border-b border-slate-50 pb-2">
                <span className="text-slate-400 font-bold uppercase tracking-wider text-[9px]">Est. Delivery Time</span>
                <span>{formatTime(new Date(new Date(selectedActiveMission.createdAt).getTime() + 45 * 60000))}</span>
              </div>
              <div className="flex justify-between border-b border-slate-50 pb-2">
                <span className="text-slate-400 font-bold uppercase tracking-wider text-[9px]">Food Category</span>
                <span className="capitalize">{selectedActiveMission.foodType}</span>
              </div>
              <div className="flex justify-between border-b border-slate-50 pb-2">
                <span className="text-slate-400 font-bold uppercase tracking-wider text-[9px]">Packaging Type</span>
                <span>{selectedActiveMission.foodType === 'prepared' ? 'Insulated Thermo-Trays' : 'Eco-crates'}</span>
              </div>
              <div className="md:col-span-2 flex flex-col gap-1.5 pt-1">
                <span className="text-slate-400 font-bold uppercase tracking-wider text-[9px]">Special Logistics Instructions</span>
                <p className="text-xs text-slate-650 font-normal leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
                  {selectedActiveMission.description || 'Deliver immediately. Keep away from direct sunlight. Handle fragile containers with care.'}
                </p>
              </div>
            </div>
          </div>

          {/* Vertical Activity Timeline */}
          <div className="bg-white border border-slate-100 rounded-[32px] p-6 shadow-sm hover:shadow-md transition duration-200 flex flex-col gap-4">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <CheckCircle2 size={14} className="text-[#059669]" /> Activity Logistics Log
            </span>
            <div className="flex flex-col gap-4 ml-2.5 relative border-l border-slate-100 pl-4 py-2">
              {[
                { time: '10:30 AM', title: 'Donation Posted', desc: 'Fresh Foods Grocer published surplus items', active: true },
                { time: '10:32 AM', title: 'AI Verified', desc: 'Freshness certified at 98% quality', active: true },
                { time: '10:35 AM', title: 'NGO Accepted', desc: 'Mercy Soup Kitchen claimed redistribution mission', active: currentStepIndex >= 3 },
                { time: '10:45 AM', title: 'Volunteer Assigned', desc: 'Alex Miller accepted delivery dispatch request', active: currentStepIndex >= 4 },
                { time: '11:00 AM', title: 'Pickup Started', desc: 'Courier en route to pick up packages', active: currentStepIndex >= 4 && getLocalStatus(selectedActiveMission._id) === 'Pickup Started' },
                { time: '11:12 AM', title: 'Food Picked Up', desc: 'Surplus food items collected by volunteer', active: currentStepIndex >= 5 },
                { time: '11:22 AM', title: 'In Transit', desc: 'Vehicle in transit to recipient center', active: currentStepIndex >= 6 },
                { time: '11:35 AM', title: 'Delivered', desc: 'Safe food distribution complete', active: currentStepIndex >= 7 }
              ].map((log, idx) => (
                <div key={idx} className="relative flex flex-col gap-0.5">
                  <span className={`absolute -left-[22.5px] top-1 w-3 h-3 rounded-full border-2 ${
                    log.active ? 'bg-emerald-500 border-emerald-500 shadow-[0_0_4px_#10B981]' : 'bg-white border-slate-200'
                  }`}></span>
                  <span className="text-[10px] text-slate-400 font-extrabold">{log.time}</span>
                  <h5 className={`text-xs font-extrabold ${log.active ? 'text-slate-800' : 'text-slate-400'}`}>{log.title}</h5>
                  <p className="text-[10px] text-slate-400 font-semibold">{log.desc}</p>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right Column: Cards */}
        <div className="flex flex-col gap-8">
          
          {/* Food Details Card */}
          <div className="bg-white border border-slate-100 rounded-[32px] overflow-hidden shadow-sm hover:shadow-md transition duration-200">
            <div className="h-44 w-full relative">
              <img 
                src={getFoodImage(selectedActiveMission.foodType)} 
                alt={selectedActiveMission.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-4 right-4 bg-emerald-500 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 shadow-md">
                <ShieldCheck size={14} /> AI Verified ✓
              </div>
            </div>
            <div className="p-6 flex flex-col gap-4">
              <div>
                <span className="text-[10px] font-extrabold text-[#059669] uppercase tracking-wider block">
                  {selectedActiveMission.foodType} Crate
                </span>
                <h3 className="text-xl font-extrabold text-slate-900 mt-1">{selectedActiveMission.title}</h3>
              </div>
              
              <div className="grid grid-cols-2 gap-4 border-t border-slate-50 pt-4 text-xs">
                <div>
                  <span className="text-slate-400 font-bold block uppercase tracking-wide text-[9px]">Meals Available</span>
                  <span className="text-slate-800 font-extrabold text-sm">{getMealsCount(selectedActiveMission.quantity)} Servings</span>
                </div>
                <div>
                  <span className="text-slate-400 font-bold block uppercase tracking-wide text-[9px]">Freshness Score</span>
                  <span className="text-emerald-600 font-extrabold text-sm">98% Perfect</span>
                </div>
                <div>
                  <span className="text-slate-400 font-bold block uppercase tracking-wide text-[9px]">Prepared Time</span>
                  <span className="text-slate-800 font-extrabold text-sm">{formatTime(selectedActiveMission.createdAt)}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-bold block uppercase tracking-wide text-[9px]">Expiry Time</span>
                  <span className="text-rose-600 font-extrabold text-sm">{formatTime(selectedActiveMission.expiryTime)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Donor Card */}
          <div className="bg-white border border-slate-100 rounded-[32px] p-6 shadow-sm hover:shadow-md transition duration-200 flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-[#059669] font-bold text-lg">
                {selectedActiveMission.donor?.organization?.slice(0, 2).toUpperCase() || 'FD'}
              </div>
              <div>
                <h4 className="font-extrabold text-slate-900 flex items-center gap-1.5">
                  {selectedActiveMission.donor?.organization || 'Fresh Foods Grocer'}
                  <span className="text-blue-500" title="Verified Donor">✓</span>
                </h4>
                <span className="text-xs text-slate-400 font-semibold">{selectedActiveMission.donor?.name || 'Store Manager'}</span>
              </div>
            </div>

            <div className="border-t border-slate-50 pt-3 flex flex-col gap-2 text-xs font-semibold text-slate-600">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-bold uppercase tracking-wide text-[9px]">Email</span>
                <span>{selectedActiveMission.donor?.email || 'donor@foodshare.com'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-bold uppercase tracking-wide text-[9px]">Phone</span>
                <span>+1 (555) 302-8922</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-bold uppercase tracking-wide text-[9px]">Donation ID</span>
                <span className="font-mono text-slate-400">{selectedActiveMission._id}</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 border-t border-slate-50 pt-3">
              <a 
                href="tel:+15553028922"
                onClick={() => addToast('Calling donor...', 'info')}
                className="bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold py-2.5 rounded-xl text-center transition"
              >
                Call
              </a>
              <a 
                href="mailto:donor@foodshare.com"
                onClick={() => addToast('Opening mail composer...', 'info')}
                className="bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold py-2.5 rounded-xl text-center transition"
              >
                Message
              </a>
              <button 
                onClick={() => addToast(`Donor Location: ${selectedActiveMission.pickupAddress}`, 'info')}
                className="bg-[#059669] hover:bg-[#047857] text-white text-xs font-bold py-2.5 rounded-xl transition"
              >
                View Donor
              </button>
            </div>
          </div>

          {/* Volunteer Info Card */}
          <div className="bg-white border border-slate-100 rounded-[32px] p-6 shadow-sm hover:shadow-md transition duration-200 flex flex-col gap-4">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <User size={14} className="text-[#059669]" /> Assigned Logistics Courier
            </span>
            <div className="flex items-center gap-3">
              <img 
                src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&h=150&q=80" 
                alt="Alex Miller"
                className="w-12 h-12 rounded-full object-cover border border-slate-100"
              />
              <div>
                <h4 className="font-extrabold text-slate-900">Alex Miller</h4>
                <span className="text-[10px] text-[#059669] font-bold block">Eco-Couriers Partner</span>
              </div>
            </div>
            
            <div className="border-t border-slate-50 pt-3 flex flex-col gap-2 text-xs font-semibold text-slate-600">
              <div className="flex justify-between">
                <span className="text-slate-400 font-bold uppercase tracking-wide text-[9px]">Vehicle Spec</span>
                <span>E-Bike Cargo v2 (AP-09-XY-8821)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 font-bold uppercase tracking-wide text-[9px]">Phone</span>
                <span>+1 (555) 890-2134</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 font-bold uppercase tracking-wide text-[9px]">Courier Status</span>
                <span className="text-amber-600 font-bold">En Route to Merchant</span>
              </div>
            </div>
          </div>

          {/* AI Intelligence Insights */}
          <div className="bg-slate-800 text-white rounded-[32px] p-6 shadow-md flex flex-col gap-4 relative overflow-hidden">
            <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-emerald-500/10 blur-xl pointer-events-none"></div>
            
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck size={14} /> AI Intelligence Insights
            </span>

            {selectedActiveMission.predictedSurplus ? (
              <div className="flex flex-col gap-3.5 text-xs">
                <div className="bg-slate-900/40 border border-slate-700/30 p-3.5 rounded-2xl flex justify-between items-center">
                  <div>
                    <span className="text-[9px] text-[#10B981] font-bold uppercase block">Spoilage Risk</span>
                    <span className="text-sm font-extrabold text-white">Low Spoilage Risk &bull; 2.4%</span>
                  </div>
                  <ShieldCheck size={18} className="text-emerald-400" />
                </div>
                
                <div className="bg-slate-900/40 border border-slate-700/30 p-3.5 rounded-2xl flex justify-between items-center">
                  <div>
                    <span className="text-[9px] text-blue-400 font-bold uppercase block">Recommended Route</span>
                    <span className="text-sm font-extrabold text-white">Bypass Hwy 4 (Saved 4m)</span>
                  </div>
                  <Navigation size={18} className="text-blue-400" />
                </div>
                
                <div className="bg-slate-900/40 border border-slate-700/30 p-3.5 rounded-2xl flex justify-between items-center">
                  <div>
                    <span className="text-[9px] text-indigo-400 font-bold uppercase block">Estimated Delivery Success Rate</span>
                    <span className="text-sm font-extrabold text-white">98.2% Probability</span>
                  </div>
                  <Award size={18} className="text-indigo-400" />
                </div>
              </div>
            ) : (
              <div className="py-6 text-center flex flex-col items-center gap-3">
                <Info size={32} className="text-slate-500" />
                <p className="text-xs font-bold text-slate-400 max-w-[220px] leading-relaxed mx-auto">
                  AI insights will appear once sufficient mission data is available.
                </p>
              </div>
            )}
          </div>

          {/* Recent Notifications Alert Banner */}
          <div className="bg-emerald-50/50 border border-emerald-100 rounded-[32px] p-5 shadow-sm flex items-center gap-3">
            <BellRing size={20} className="text-[#059669] flex-shrink-0 animate-bounce" />
            <div className="text-xs">
              <span className="font-extrabold text-slate-800 block">Redistribution Update</span>
              <span className="text-slate-500">Live tracker is active. Complete proof form upon arriving at target center coordinates.</span>
            </div>
          </div>

        </div>

      </div>

      {/* Mission Action Panel & Delivery Proof */}
      <div className="bg-slate-900 text-white rounded-[32px] p-8 shadow-lg flex flex-col gap-6 relative overflow-hidden mt-6">
        <div className="absolute -top-24 -left-24 w-64 h-64 rounded-full bg-[#059669]/5 blur-3xl pointer-events-none"></div>
        
        <div>
          <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles size={14} /> Mission Logistics Action Panel
          </span>
          <p className="text-slate-400 text-xs mt-1">Execute the logistics workflow sequentially to transition this mission from dispatch to delivery verification.</p>
        </div>

        {/* Current Active Stage Actions */}
        <div className="border-t border-slate-800 pt-6 flex flex-col gap-6">
          
          {/* Render buttons according to the current Step */}
          {currentStepIndex === 3 && (
            <div className="flex flex-col gap-3">
              <span className="text-xs font-bold text-slate-350">Step 2: Initiate Volunteer Pickup</span>
              <button
                onClick={() => {
                  setLocalStatus(selectedActiveMission._id, 'Pickup Started');
                  addToast('Pickup started! Volunteer is dispatching now.', 'success');
                }}
                className="w-full md:w-auto bg-[#059669] hover:bg-[#047857] text-white text-sm font-black py-4 px-8 rounded-2xl shadow-lg shadow-emerald-500/10 transition transform hover:scale-[1.02] active:scale-[0.98]"
              >
                Start Pickup Process
              </button>
            </div>
          )}

          {currentStepIndex === 4 && (
            <div className="flex flex-col gap-3">
              <span className="text-xs font-bold text-slate-350">Step 3: Collect Food Items from Donor</span>
              <button
                onClick={async () => {
                  await updateMissionStatus(selectedActiveMission._id, 'Picked Up');
                  addToast('Food items successfully verified & picked up!', 'success');
                }}
                className="w-full md:w-auto bg-amber-500 hover:bg-amber-600 text-white text-sm font-black py-4 px-8 rounded-2xl shadow-lg shadow-amber-500/10 transition transform hover:scale-[1.02] active:scale-[0.98]"
              >
                Confirm Food Picked Up
              </button>
            </div>
          )}

          {currentStepIndex === 5 && (
            <div className="flex flex-col gap-3">
              <span className="text-xs font-bold text-slate-350">Step 4: Dispatch Courier to Recipient</span>
              <button
                onClick={async () => {
                  await updateMissionStatus(selectedActiveMission._id, 'In Transit');
                  addToast('Delivery is in transit to destination.', 'success');
                }}
                className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white text-sm font-black py-4 px-8 rounded-2xl shadow-lg shadow-blue-500/10 transition transform hover:scale-[1.02] active:scale-[0.98]"
              >
                Start Delivery & Transit
              </button>
            </div>
          )}

          {currentStepIndex === 6 && (
            <div className="flex flex-col gap-3">
              <span className="text-xs font-bold text-slate-350">Step 5: Verify Arrival at Target Destination</span>
              <button
                onClick={() => {
                  setLocalStatus(selectedActiveMission._id, 'Reached Destination');
                  addToast('Arrived at recipient destination. Please upload proof.', 'success');
                }}
                className="w-full md:w-auto bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-black py-4 px-8 rounded-2xl shadow-lg shadow-emerald-500/10 transition transform hover:scale-[1.02] active:scale-[0.98]"
              >
                Confirm Reached Destination
              </button>
            </div>
          )}

          {currentStepIndex === 7 && (
            <div className="flex flex-col gap-6">
              <div className="border border-slate-800 bg-slate-900/50 p-6 rounded-2xl flex flex-col gap-5">
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                  <FileText size={14} /> Step 6: Upload Delivery Proof & Sign-off
                </span>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Upload Delivery Photo</label>
                    <div className="border-2 border-dashed border-slate-700 hover:border-slate-500 rounded-xl p-4 transition-colors flex flex-col items-center justify-center gap-2 relative bg-slate-950/40">
                      {proofPhoto ? (
                        <div className="relative w-full h-24 rounded-lg overflow-hidden">
                          <img src={proofPhoto} alt="Proof" className="w-full h-full object-cover" />
                          <button 
                            onClick={() => setProofPhoto(null)}
                            className="absolute top-1 right-1 bg-red-500 hover:bg-red-600 text-white p-1 rounded-full transition"
                          >
                            <X size={12} />
                          </button>
                        </div>
                      ) : (
                        <>
                          <input 
                            type="file" 
                            accept="image/*" 
                            onChange={handleProofPhotoChange}
                            className="absolute inset-0 opacity-0 cursor-pointer"
                          />
                          <Utensils size={20} className="text-slate-500" />
                          <span className="text-[10px] text-slate-400 font-bold">Drag photo or click to browse</span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col gap-4 text-xs">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold text-slate-400 uppercase">Recipient Name</label>
                      <input 
                        type="text" 
                        value={recipientName}
                        onChange={(e) => setRecipientName(e.target.value)}
                        placeholder="E.g., Sister Maria"
                        className="bg-slate-950/60 border border-slate-800 rounded-xl px-4 py-2.5 text-white placeholder-slate-600 focus:outline-none focus:border-[#059669] font-bold"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold text-slate-400 uppercase">Recipient Signature (Type Name)</label>
                      <input 
                        type="text" 
                        value={recipientSignature}
                        onChange={(e) => setRecipientSignature(e.target.value)}
                        placeholder="Type full name to sign"
                        className="bg-slate-950/60 border border-slate-800 rounded-xl px-4 py-2.5 text-white placeholder-slate-600 focus:outline-none focus:border-[#059669] font-mono italic"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Delivery & Verification Notes</label>
                  <textarea 
                    rows={2}
                    value={deliveryNotes}
                    onChange={(e) => setDeliveryNotes(e.target.value)}
                    placeholder="Enter any feedback or distribution observations..."
                    className="bg-slate-950/60 border border-slate-800 rounded-xl px-4 py-2.5 text-white placeholder-slate-600 focus:outline-none focus:border-[#059669]"
                  />
                </div>

                <label className="flex items-start gap-3 cursor-pointer text-xs select-none">
                  <input 
                    type="checkbox"
                    checked={confirmChecked}
                    onChange={(e) => setConfirmChecked(e.target.checked)}
                    className="mt-0.5 rounded border-slate-700 bg-slate-950 text-[#059669] focus:ring-emerald-500"
                  />
                  <span className="text-slate-400 font-semibold leading-relaxed">
                    I confirm that the surplus food was successfully delivered in safe, edible condition.
                  </span>
                </label>
              </div>

              <button
                onClick={async () => {
                  await updateMissionStatus(selectedActiveMission._id, 'completed');
                  addToast('Surplus food distribution successfully completed! Impact registered.', 'success');
                }}
                disabled={!proofPhoto || !recipientName || !recipientSignature || !confirmChecked}
                className={`w-full md:w-auto text-sm font-black py-4 px-8 rounded-2xl transition transform ${
                  (proofPhoto && recipientName && recipientSignature && confirmChecked)
                    ? 'bg-[#059669] hover:bg-[#047857] text-white shadow-lg shadow-emerald-500/10 hover:scale-[1.02] active:scale-[0.98]'
                    : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                }`}
              >
                Complete Mission & Log Impact
              </button>
            </div>
          )}

          {currentStepIndex === 8 && (
            <div className="bg-emerald-955/30 border border-emerald-900/50 p-6 rounded-2xl flex flex-col gap-4 text-xs font-semibold">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
                  <CheckCircle2 size={20} />
                </div>
                <div>
                  <h4 className="text-base font-extrabold text-emerald-400">Mission Completed Successfully</h4>
                  <p className="text-slate-400 text-xs">All packages have been logged, signed, and distributed safely.</p>
                </div>
              </div>

              {/* Display Signed Proof details */}
              <div className="border-t border-slate-800/80 pt-4 flex flex-col gap-2.5 text-slate-350">
                <div className="flex justify-between">
                  <span className="text-slate-500 font-bold uppercase tracking-wider text-[9px]">Verified Recipient</span>
                  <span>{recipientName || 'Community Center Manager'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-bold uppercase tracking-wider text-[9px]">Digital Signature</span>
                  <span className="font-mono italic text-emerald-400">{recipientSignature || 'Sister Maria'}</span>
                </div>
                {deliveryNotes && (
                  <div className="flex flex-col gap-1 mt-1 bg-slate-950/20 p-3 rounded-xl border border-slate-800">
                    <span className="text-slate-500 font-bold uppercase tracking-wider text-[9px]">Verification Notes</span>
                    <span className="text-slate-350 italic font-normal leading-relaxed">{deliveryNotes}</span>
                  </div>
                )}
              </div>
            </div>
          )}

        </div>
      </div>

    </div>
  );
}


