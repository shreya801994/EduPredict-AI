import React from 'react';
import AnalyticsReport from '../components/AnalyticsReport';

export default function AnalyticsPage() {
  // Using verified student ID containing database records
  const currentStudentId =
  localStorage.getItem("user_id");

  return (
    <div className="h-full overflow-auto bg-slate-950 text-slate-100 p-6 md:p-10">
      <header className="max-w-5xl mx-auto mb-8">
        <h1 className="text-3xl font-black tracking-tight text-white">Predictive Analytics Hub</h1>
        <p className="text-sm text-slate-400 mt-1">Standalone validation route analyzing semester behavioral variables.</p>
      </header>

      <main className="max-w-5xl mx-auto">
        <AnalyticsReport studentId={currentStudentId} />
      </main>
    </div>
  );
}