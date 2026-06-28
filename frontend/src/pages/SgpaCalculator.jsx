import React, { useState } from 'react';
import axios from 'axios';

const SgpaCalculator = () => {
  const API_BASE_URL = `${import.meta.env.VITE_API_URL}/api/v1`;

  const [courses, setCourses] = useState([
    {
      name: "",
      grade: "A",
      credits: 3,
    },
  ]);
  
  const [profile, setProfile] = useState({
    age: "",
    gender: "",
    attendance: "",
    study_hours: "",
    sleep_hours: "",
    family_support: "",
    internet_access: "",
  });
  
  const [analyticsResult, setAnalyticsResult] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  const gradeOptions = ['A+', 'A', 'B+','B', 'C+', 'C', 'D', 'F'];
  const creditOptions = [1, 2, 3, 4, 5];

  const handleCourseChange = (index, field, value) => {
    const updated = [...courses];
    updated[index][field] = value;
    setCourses(updated);
  };

  const addCourseRow = () => {
    setCourses([...courses, { name: '', grade: 'A', credits: 4 }]);
  };

  const removeCourseRow = (index) => {
    setCourses(courses.filter((_, i) => i !== index));
  };

  const handleProfileChange = (field, value) => {
    setProfile({ ...profile, [field]: value });
  };

  const calculateAndSync = async () => {
    try {
      setErrorMessage('');
      const token = localStorage.getItem('token');
      const studentId = localStorage.getItem("user_id");
      
      if (!token) {
        setErrorMessage('Authentication token missing. Please log in again.');
        return;
      }
      if (!studentId) {
        setErrorMessage("Student ID not found.");
        return;
      }

      const payload = {
        profile: {
          age: parseInt(profile.age),
          gender: profile.gender,
          attendance: parseFloat(profile.attendance),
          study_hours: parseFloat(profile.study_hours),
          sleep_hours: parseFloat(profile.sleep_hours),
          family_support: profile.family_support,
          internet_access: profile.internet_access
        },
        scores: courses.map(c => ({
          subject: c.name || "Unnamed Course",
          grade: c.grade,
          credits: parseInt(c.credits)
        }))
      };

      // 1. Submit logs into backend database
      await axios.post( `${API_BASE_URL}/profile/submit`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // 2. Fetch the analytical results payload
      const response = await axios.get(
      `${API_BASE_URL}/predict/metrics/${studentId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

      const serverData = response.data;

      // Point gpa_prediction directly to your true current transcript calculation (features.current_sgpa)
      setAnalyticsResult({
        gpa_prediction: Number(serverData.features.current_sgpa).toFixed(2), 
        predicted_next_sgpa: Number(serverData.analytics.predicted_sgpa).toFixed(2),
        risk_status: serverData.analytics.risk_level,
        optimization_targets: serverData.analytics.explainability.reduce((acc, curr) => {
          acc[curr.factor] = curr.description;
          return acc;
        }, {})
      });

    } catch (err) {
      if (err.response && err.response.data && err.response.data.detail) {
        const detail = err.response.data.detail;
        setErrorMessage(typeof detail === 'object' ? JSON.stringify(detail) : detail);
      } else {
        console.error(err);
        setErrorMessage(
          err.message || "Unexpected error."
        );
      }
    }
  };

  return (
    // NEW SIDE-BY-SIDE FLEX BOX LAYOUT FOR MAIN WINDOW
    <div className="w-full max-w-6xl flex flex-col lg:flex-row gap-6 items-start">
      
      {/* LEFT COLUMN: Input form fields */}
      <div className="flex-1 bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 md:p-8 shadow-xl">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-white">Semester SGPA Matrix Calculator</h2>
            <p className="text-xs text-slate-400 mt-1">Select explicit course letter grades paired with corresponding credit weights.</p>
          </div>
          <button 
            onClick={addCourseRow}
            className="bg-indigo-600/20 text-indigo-400 hover:bg-indigo-600/30 border border-indigo-500/30 px-3 py-1.5 rounded-xl text-xs font-semibold transition"
          >
            + Add Row
          </button>
        </div>

        {errorMessage && (
          <div className="bg-red-950/40 border border-red-800 text-red-400 p-4 rounded-lg mb-6 text-xs font-mono break-all">
            {errorMessage}
          </div>
        )}

        {/* Demographics Segment */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 border-b border-slate-800/60 pb-6">
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Attendance (%)</label>
            <input type="number" value={profile.attendance} onChange={(e) => handleProfileChange('attendance', e.target.value)} className="w-full bg-slate-950/60 border border-slate-800 text-xs p-2.5 rounded-xl focus:outline-none focus:border-indigo-500 text-white" />
          </div>
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Daily Study Hours</label>
            <input type="number" value={profile.study_hours} onChange={(e) => handleProfileChange('study_hours', e.target.value)} className="w-full bg-slate-950/60 border border-slate-800 text-xs p-2.5 rounded-xl focus:outline-none focus:border-indigo-500 text-white" />
          </div>
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Sleep Hours</label>
            <input type="number" value={profile.sleep_hours} onChange={(e) => handleProfileChange('sleep_hours', e.target.value)} className="w-full bg-slate-950/60 border border-slate-800 text-xs p-2.5 rounded-xl focus:outline-none focus:border-indigo-500 text-white" />
          </div>
        </div>

        {/* Academic Course Mapping Matrix */}
        <div className="space-y-2.5 mb-6 max-h-[400px] overflow-y-auto pr-1 custom-scrollbar">
          {courses.map((course, index) => (
            <div key={index} className="flex flex-col sm:flex-row items-center gap-2.5 bg-slate-950/40 p-2.5 rounded-xl border border-slate-800/50">
              <input 
                type="text" 
                placeholder="Course Title" 
                value={course.name} 
                onChange={(e) => handleCourseChange(index, 'name', e.target.value)} 
                className="flex-1 min-w-0 bg-slate-900 border border-slate-800 text-xs p-2.5 rounded-xl focus:outline-none focus:border-indigo-500 text-white placeholder-slate-600" 
              />
              
              <div className="w-full sm:w-28">
                <select 
                  value={course.grade} 
                  onChange={(e) => handleCourseChange(index, 'grade', e.target.value)} 
                  className="w-full bg-slate-900 border border-slate-800 text-xs p-2.5 rounded-xl focus:outline-none focus:border-indigo-500 text-white"
                >
                  {gradeOptions.map(g => <option key={g} value={g}>{g}</option>)}
                </select>
              </div>

              <div className="w-full sm:w-28">
                <select 
                  value={course.credits} 
                  onChange={(e) => handleCourseChange(index, 'credits', e.target.value)} 
                  className="w-full bg-slate-900 border border-slate-800 text-xs p-2.5 rounded-xl focus:outline-none focus:border-indigo-500 text-white"
                >
                  {creditOptions.map(c => <option key={c} value={c}>{c} Credits</option>)}
                </select>
              </div>

              {courses.length > 1 && (
                <button onClick={() => removeCourseRow(index)} className="text-slate-600 hover:text-red-400 px-1 transition text-xs">
                  ✕
                </button>
              )}
            </div>
          ))}
        </div>

        <button 
          onClick={calculateAndSync} 
          className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold py-3 rounded-xl transition shadow-lg text-xs"
        >
          Run Credit-Weighted Analytics Computation
        </button>
      </div>

      {/* RIGHT COLUMN: Sticky Dashboard Analytics Output (No Scrolling Needed!) */}
      <div className="w-full lg:w-80 shrink-0 lg:sticky lg:top-4">
        {analyticsResult ? (
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 shadow-xl space-y-4">
            
            {/* Real Calculated GPA Card */}
            <div className="bg-slate-950/40 border border-slate-800 p-4 rounded-xl text-center">
              <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">Calculated Transcript SGPA</span>
              <div className="text-4xl font-black text-emerald-400 mt-1">{analyticsResult.gpa_prediction}</div>
              <span className="inline-block mt-2 px-2.5 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full text-[9px] font-bold uppercase tracking-wider">
                Accurate Matrix Match
              </span>
            </div>

            {/* Projected Next Semester Card */}
            <div className="bg-slate-950/40 border border-slate-800 p-4 rounded-xl text-center">
              <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">AI Projected Trend</span>
              <div className="text-3xl font-extrabold text-indigo-400 mt-1">{analyticsResult.predicted_next_sgpa}</div>
              <div className="text-[10px] text-slate-500 mt-1">Risk index status: <span className="text-amber-400 font-bold">{analyticsResult.risk_status}</span></div>
            </div>

            {/* Academic Summary Logs */}
            <div className="bg-slate-950/40 border border-slate-800 p-4 rounded-xl">
              <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase block mb-2">Metric Attribution Factors</span>
              <div className="space-y-2">
                {Object.entries(analyticsResult.optimization_targets).map(([key, val]) => (
                  <div key={key} className="text-[11px] text-slate-300 bg-slate-950/80 p-2 rounded-lg border border-slate-800/40 leading-relaxed">
                    <span className="text-indigo-400 font-bold">{key}:</span> {val}
                  </div>
                ))}
              </div>
            </div>

          </div>
        ) : (
          <div className="h-48 border border-dashed border-slate-800 bg-slate-900/20 rounded-2xl flex flex-col items-center justify-center text-center p-4">
            <span className="text-2xl mb-2"></span>
            <p className="text-xs font-medium text-slate-500">Awaiting processing execution...</p>
            <p className="text-[10px] text-slate-600 max-w-[180px] mt-0.5">Click compute to map live metrics here instantly.</p>
          </div>
        )}
      </div>

    </div>
  );
};

export default SgpaCalculator;