import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { User, Mail, Building, MapPin, Shield, CheckCircle2, AlertTriangle, Phone, Camera, Upload } from 'lucide-react';

export default function Profile() {
  const { user, setUser } = useAuth();
  
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [organization, setOrganization] = useState(user?.organization || '');
  const [address, setAddress] = useState(user?.address || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [profilePicture, setProfilePicture] = useState(user?.profilePicture || '');
  
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) { // 2MB Limit
        setError('Image file must be under 2MB.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePicture(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setSuccess('');
    setError('');
    setLoading(true);

    try {
      const res = await api.put('/auth/profile', { 
        name, 
        email, 
        organization, 
        address,
        phone,
        profilePicture
      });
      
      setUser(res.data.user);
      setSuccess('Profile updated successfully!');
    } catch (err) {
      setError(err.response?.data?.message || 'Could not update profile.');
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="flex-1 bg-[#F8FAFC] py-10 px-4 sm:px-6 md:px-8 max-w-7xl mx-auto w-full flex flex-col gap-8 text-slate-800">
      
      {/* Header */}
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Account <span className="text-[#059669]">Settings</span>
        </h1>
        <p className="text-sm text-slate-500">Manage your profile and account preferences.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Side: Avatar & Role Info */}
        <div className="flex flex-col gap-6">
          <div className="bg-white border border-slate-100 p-8 rounded-[32px] shadow-sm flex flex-col items-center text-center gap-4">
            <div className="relative">
              {profilePicture ? (
                <img 
                  src={profilePicture} 
                  alt="Profile Avatar" 
                  className="w-24 h-24 rounded-full object-cover ring-4 ring-[#059669]/10 shadow-sm"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-[#059669]/10 flex items-center justify-center text-[#059669] text-3xl font-extrabold uppercase ring-4 ring-[#059669]/5">
                  {user.name.charAt(0)}
                </div>
              )}
              <label className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-[#059669] hover:bg-[#047857] text-white flex items-center justify-center cursor-pointer shadow-md transition-all">
                <Camera size={14} />
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleImageChange} 
                  className="hidden" 
                />
              </label>
            </div>
            
            <div>
              <h2 className="text-xl font-extrabold text-slate-900">{user.name}</h2>
              <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mt-1">{user.role} Account</p>
            </div>
            <div className="w-full border-t border-slate-50 my-2"></div>
            <div className="flex flex-col gap-3 w-full text-left text-sm">
              <div className="flex items-center gap-3 text-slate-600">
                <Mail size={16} className="text-slate-400 flex-shrink-0" />
                <span className="truncate">{user.email}</span>
              </div>
              {user.phone && (
                <div className="flex items-center gap-3 text-slate-600">
                  <Phone size={16} className="text-slate-400 flex-shrink-0" />
                  <span className="truncate">{user.phone}</span>
                </div>
              )}
              {user.organization && (
                <div className="flex items-center gap-3 text-slate-600">
                  <Building size={16} className="text-slate-400 flex-shrink-0" />
                  <span className="truncate">{user.organization}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Side: Edit Form */}
        <div className="lg:col-span-2 bg-white border border-slate-100 p-8 rounded-[32px] shadow-sm flex flex-col gap-6">
          <div className="flex items-center gap-2 text-[#059669] border-b border-slate-50 pb-4">
            <User size={20} />
            <h3 className="font-extrabold text-lg text-slate-900">Personal Information</h3>
          </div>

          {success && (
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-100 text-[#059669] text-sm flex items-start gap-2.5">
              <CheckCircle2 size={18} className="flex-shrink-0 mt-0.5" />
              <span>{success}</span>
            </div>
          )}

          {error && (
            <div className="p-4 rounded-xl bg-red-50 border border-red-100 text-red-650 text-sm flex items-start gap-2.5">
              <AlertTriangle size={18} className="flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleUpdate} className="flex flex-col gap-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider pl-1">Full Name</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 pointer-events-none">
                    <User size={18} />
                  </span>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#059669] focus:bg-white transition-all duration-200 pl-11 text-sm"
                  />
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider pl-1">Email Address</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 pointer-events-none">
                    <Mail size={18} />
                  </span>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#059669] focus:bg-white transition-all duration-200 pl-11 text-sm"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider pl-1">Phone Number</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 pointer-events-none">
                    <Phone size={18} />
                  </span>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#059669] focus:bg-white transition-all duration-200 pl-11 text-sm"
                    placeholder="+1 (555) 000-0000"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider pl-1">Organization Name</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 pointer-events-none">
                    <Building size={18} />
                  </span>
                  <input
                    type="text"
                    value={organization}
                    onChange={(e) => setOrganization(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#059669] focus:bg-white transition-all duration-200 pl-11 text-sm"
                    placeholder="Company or NGO Name"
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider pl-1">Default Address</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 pointer-events-none">
                  <MapPin size={18} />
                </span>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#059669] focus:bg-white transition-all duration-200 pl-11 text-sm"
                  placeholder="Street address, City"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider pl-1">Profile Picture (Base64 or URL)</label>
              <div className="flex items-center gap-3">
                <div className="relative flex-1">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 pointer-events-none">
                    <Upload size={18} />
                  </span>
                  <input
                    type="text"
                    value={profilePicture}
                    onChange={(e) => setProfilePicture(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#059669] focus:bg-white transition-all duration-200 pl-11 text-sm"
                    placeholder="data:image/jpeg;base64,... or HTTP image URL"
                  />
                </div>
                <label className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-3 px-5 rounded-2xl cursor-pointer text-sm transition-all border border-slate-250 flex items-center gap-1.5">
                  <Upload size={16} />
                  Choose File
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleImageChange} 
                    className="hidden" 
                  />
                </label>
              </div>
            </div>

            <div className="mt-2 flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="bg-[#059669] hover:bg-[#047857] text-white font-bold py-3 px-6 rounded-2xl transition-all shadow-md active:scale-95 text-sm flex items-center gap-2"
              >
                {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : <Shield size={16} />}
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>

        </div>
      </div>
    </div>
  );
}
