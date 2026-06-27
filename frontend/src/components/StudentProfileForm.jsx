import React, { useState, useEffect } from 'react';
import { authAPI } from '../api/auth';

export default function StudentProfileForm({ onSyncComplete }) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', isError: false });

  // Baseline lifestyle metrics
  const [profile, setProfile] = useState({
  age: "",
  gender: "Male",
  attendance: "",
  study_hours: "",
  sleep_hours: "",
  family_support: "High",
  internet_access: "Yes",
});

  useEffect(() => {
    loadProfile();
  }, []);

    const loadProfile = async () => {
      try {
        const existingProfile =
          await authAPI.getProfile();
        setProfile(existingProfile);
      } catch (err) {
        console.log(
          "No existing profile found."
        );
      }
    };

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfile(prev => ({
      ...prev,
      [name]:
      name === "age"
        ? value === ""
          ? ""
          : parseInt(value)
        : ["attendance", "study_hours", "sleep_hours"].includes(name)
        ? value === ""
          ? ""
          : parseFloat(value)
        : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    setLoading(true);
    setMessage({ text: '', isError: false });

    const formattedPayload = {
      profile: profile,
      scores: [] // Sent empty to comply with backend schema requirements
    };

    try {
      // 1. Core Profile Sync - Save metrics safely to your database
      await authAPI.submitProfile(formattedPayload);

      localStorage.setItem(
        "profile_completed",
        "true"
      );
      
      setMessage({ text: 'Student profile metrics successfully saved down to Supabase!', isError: false });
      
      if (onSyncComplete) {
        setTimeout(() => onSyncComplete(), 2000);
      }
    } catch (err) {
      // Gracefully capture any network or response text errors
      const errorMsg = err.response?.data?.detail || err.message || "Failed to synchronize profile data.";
      setMessage({ text: typeof errorMsg === 'object' ? JSON.stringify(errorMsg) : errorMsg, isError: true });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full flex flex-col items-center">
      {/* Input Data Submission Card */}
      <div className="w-full max-w-4xl bg-slate-900/40 backdrop-blur-xl border border-slate-800 p-8 rounded-2xl shadow-2xl z-10 animate-fadeIn">
        <div className="mb-6">
          <h2 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
            Student Demographics & Academic Profile
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Input your parameters to securely register your background and lifestyle attributes.
          </p>
        </div>

        {message.text && (
          <div className={`mb-6 p-4 rounded-xl text-sm border ${
            message.isError ? 'bg-red-950/30 text-red-400 border-red-900/50' : 'bg-emerald-950/30 text-emerald-400 border-emerald-900/50'
          }`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Age</label>
              <input 
                type="number" 
                name="age" 
                value={profile.age} 
                onChange={handleProfileChange} 
                onWheel={(e) => e.target.blur()}
                className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-xl px-4 py-2.5 text-sm focus:border-indigo-500 focus:outline-none" 
                required 
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Gender</label>
              <select
                name="gender"
                value={profile.gender}
                onChange={handleProfileChange}
                className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-xl px-4 py-2.5 text-sm focus:border-indigo-500 focus:outline-none"
                required
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Attendance (%)</label>
              <input 
                type="number" 
                step="0.1" 
                name="attendance" 
                value={profile.attendance} 
                onChange={handleProfileChange} 
                onWheel={(e) => e.target.blur()}
                className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-xl px-4 py-2.5 text-sm focus:border-indigo-500 focus:outline-none" 
                required 
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Study Hours/Day</label>
              <input 
                type="number" 
                step="0.1" 
                name="study_hours" 
                value={profile.study_hours} 
                onChange={handleProfileChange} 
                onWheel={(e) => e.target.blur()}
                className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-xl px-4 py-2.5 text-sm focus:border-indigo-500 focus:outline-none" 
                required 
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Sleep Hours/Night</label>
              <input 
                type="number" 
                step="0.1" 
                name="sleep_hours" 
                value={profile.sleep_hours} 
                onChange={handleProfileChange} 
                onWheel={(e) => e.target.blur()}
                className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-xl px-4 py-2.5 text-sm focus:border-indigo-500 focus:outline-none" 
                required 
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Family Support</label>
              <select name="family_support" value={profile.family_support} onChange={handleProfileChange} className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-xl px-4 py-2.5 text-sm focus:border-indigo-500 focus:outline-none">
                <option value="">Select Family Support</option>
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Internet Access</label>
              <select name="internet_access" value={profile.internet_access} onChange={handleProfileChange} className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-xl px-4 py-2.5 text-sm focus:border-indigo-500 focus:outline-none">
                <option value="">Select Internet Access</option>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <button type="submit" disabled={loading} className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white font-semibold text-sm px-8 py-3 rounded-xl shadow-lg transition active:scale-95 disabled:opacity-50 cursor-pointer">
              {loading ? 'Saving Parameters...' : 'Save & Sync Academic Profile'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}