import React, { useEffect, useState } from 'react';
import { analyticsService } from '../api/analyticsService';

export default function AnalyticsReport({ studentId }) {
  const [data, setData] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        setLoading(true);
        const [liveData, historyData] = await Promise.all([
          analyticsService.getLiveAnalytics(studentId),
          analyticsService.getPredictionHistory(studentId)
        ]);
        setData(liveData);
        setHistory(historyData);
      } catch (err) {
        setError(err.response?.data?.detail || "Error loading system analytics indicators.");
      } finally {
        setLoading(false);
      }
    }
    
    if (studentId) {
      loadDashboardData();
    }
  }, [studentId]);

  if (loading) return <div className="text-center p-12 text-slate-400 font-medium">Running background predictive analytics...</div>;
  if (error || !data) return <div className="p-6 bg-red-950/20 border border-red-900/50 rounded-xl text-red-400 text-sm">⚠️ {error || "No data located."}</div>;

  const { features, analytics } = data;
  
  const getRiskStyles = (level) => {
    switch (level?.toUpperCase()) {
      case 'HIGH': return 'bg-red-500/10 text-red-400 border-red-500/30';
      case 'MEDIUM': return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      default: return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
    }
  };

  // Helper to cleanly extract a readable date string from the database timestamp
  const formatDate = (timestampStr) => {
    if (!timestampStr) return "Recent";
    try {
      const dateObj = new Date(timestampStr);
      return dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    } catch {
      return "Recent";
    }
  };

  return (
    <div className="space-y-6 text-slate-200">
      {/* SCORECARDS ROW */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl shadow-xl">
          <span className="text-xs font-bold uppercase text-slate-400 tracking-wider">Current Semester SGPA</span>
          <p className="text-4xl font-extrabold text-white mt-2">{Number(features?.current_sgpa || 0).toFixed(2)}</p>
        </div>
        <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl shadow-xl">
          <span className="text-xs font-bold uppercase text-indigo-400 tracking-wider">Predicted Next SGPA</span>
          <p className="text-4xl font-extrabold text-indigo-400 mt-2">{Number(analytics?.predicted_sgpa || 0).toFixed(2)}</p>
        </div>
        <div className={`border p-6 rounded-2xl shadow-xl ${getRiskStyles(analytics?.risk_level)}`}>
          <span className="text-xs font-bold uppercase tracking-wider opacity-80">Attrition Risk Index</span>
          <p className="text-3xl font-black mt-2">{analytics?.risk_level || "UNKNOWN"}</p>
        </div>
      </div>

      {/* CHART & SHAP IMPACT ROW */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* NATIVE TREND CHART */}
        <div className="bg-slate-900/40 border border-slate-800 p-6 rounded-2xl shadow-lg">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-6">Historical Evaluation Trends</h3>
          
          {history.length === 0 ? (
            <div className="h-44 flex items-center justify-center border border-dashed border-slate-800 rounded-xl text-slate-500 text-xs">
              No evaluation footprint tracked yet. Run computations to map trending curves.
            </div>
          ) : (
            <div className="h-44 flex items-end justify-between space-x-4 border-b border-slate-800 pb-2">
              {history.slice(-7).map((run) => ( // Show the 7 most recent snapshots
                <div key={run.id} className="flex-1 flex flex-col items-center group h-full justify-end">
                  <div className="w-full flex justify-center space-x-1 items-end h-32">
                    {/* Actual/Current Column */}
                    <div 
                      style={{ height: `${(run.calculated_current_sgpa || 0) * 10}%` }} 
                      className="w-3 bg-slate-700 rounded-t group-hover:bg-slate-600 transition-all duration-300" 
                      title={`Actual SGPA: ${run.calculated_current_sgpa}`} 
                    />
                    {/* Forecasted/Predicted Column */}
                    <div 
                      style={{ height: `${(run.predicted_next_sgpa || 0) * 10}%` }} 
                      className="w-3 bg-indigo-600 rounded-t group-hover:bg-indigo-500 transition-all duration-300" 
                      title={`Predicted Next SGPA: ${run.predicted_next_sgpa}`} 
                    />
                  </div>
                  <span className="text-[9px] text-slate-500 mt-1 truncate max-w-full font-mono">
                    {formatDate(run.timestamp)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* FEATURE IMPACTS */}
        <div className="bg-slate-900/40 border border-slate-800 p-6 rounded-2xl shadow-lg">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-4">Feature Impact Analysis</h3>
          <div className="space-y-3">
            {analytics?.explainability?.map((item, idx) => (
              <div key={idx} className="p-3 bg-slate-950/40 border border-slate-800/60 rounded-xl flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-300">{item.factor}</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">{item.description}</p>
                </div>
                {item.weight && (
                  <span className="text-xs font-mono font-bold px-2 py-0.5 bg-indigo-950/50 text-indigo-400 border border-indigo-900/50 rounded-md">
                    {item.weight}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* TARGETED INTERVENTIONS */}
      {analytics?.recommendations && analytics.recommendations.length > 0 && (
        <div className="bg-slate-900/40 border border-slate-800 p-6 rounded-2xl shadow-lg">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-4">Targeted Interventions</h3>
          <div className="space-y-2">
            {analytics.recommendations.map((rec, idx) => (
              <div key={idx} className="text-xs p-3 bg-slate-950/20 border border-slate-800/80 rounded-xl flex items-start space-x-2">
                <span className="text-indigo-400 font-bold">✓</span>
                <p className="text-slate-300 leading-relaxed">{rec}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}