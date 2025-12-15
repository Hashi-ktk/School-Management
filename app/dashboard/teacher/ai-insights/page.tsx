'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { StudentGroupingPanel } from '@/components/ai/StudentGroupingPanel';
import { AtRiskDashboard } from '@/components/ai/AtRiskDashboard';
import { InterventionPlanCard } from '@/components/ai/InterventionPlanCard';

type TabType = 'grouping' | 'at-risk' | 'interventions';

export default function AIInsightsPage() {
  const { user, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('grouping');

  if (isLoading) {
    return (
      <div className="min-h-[50vh] grid place-content-center">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-slate-600">Loading AI Insights...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-[50vh] grid place-content-center text-slate-600">
        Please log in to view AI insights.
      </div>
    );
  }

  const tabs: { id: TabType; label: string; icon: string; description: string }[] = [
    {
      id: 'grouping',
      label: 'Student Grouping',
      icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z',
      description: 'AI-powered TaRL grouping',
    },
    {
      id: 'at-risk',
      label: 'At-Risk Students',
      icon: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z',
      description: 'Early warning system',
    },
    {
      id: 'interventions',
      label: 'Interventions',
      icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4',
      description: 'Personalized action plans',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6 px-4 md:px-0 py-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              AI-Powered
            </span>
            <span className="px-2 py-0.5 bg-indigo-100 text-indigo-600 text-xs rounded-full font-medium border border-indigo-200">
              NEW
            </span>
          </div>
          <h1 className="text-3xl font-bold text-slate-800">
            AI Insights Dashboard
          </h1>
          <p className="text-slate-600 mt-1">
            Intelligent analytics and recommendations powered by machine learning
          </p>
        </div>

        {/* Feature Summary */}
        <div className="flex items-center gap-4 bg-gradient-to-br from-indigo-50 to-purple-50 border-2 border-indigo-200 rounded-xl p-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center shadow-md">
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <div>
            <p className="text-slate-800 font-medium">AI Features Active</p>
            <p className="text-slate-600 text-sm">4 intelligent modules</p>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-slate-100 rounded-xl p-2 flex flex-wrap gap-2 border border-slate-200">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
              activeTab === tab.id
                ? 'bg-indigo-500 text-white shadow-md'
                : 'text-slate-600 hover:text-slate-800 hover:bg-white'
            }`}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={tab.icon} />
            </svg>
            <div className="text-left">
              <p className="font-medium">{tab.label}</p>
              <p className={`text-xs ${activeTab === tab.id ? 'text-white/70' : 'text-slate-500'}`}>
                {tab.description}
              </p>
            </div>
          </button>
        ))}
      </div>

      {/* Feature Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 border-l-4 border-emerald-500 shadow-sm border border-slate-200">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center">
              <svg className="w-4 h-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <span className="text-slate-500 text-sm">TaRL Grouping</span>
          </div>
          <p className="text-slate-800 font-semibold">Auto-group students by competency level</p>
        </div>

        <div className="bg-white rounded-xl p-4 border-l-4 border-amber-500 shadow-sm border border-slate-200">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center">
              <svg className="w-4 h-4 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <span className="text-slate-500 text-sm">Adaptive Learning</span>
          </div>
          <p className="text-slate-800 font-semibold">Dynamic difficulty adjustment</p>
        </div>

        <div className="bg-white rounded-xl p-4 border-l-4 border-red-500 shadow-sm border border-slate-200">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center">
              <svg className="w-4 h-4 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <span className="text-slate-500 text-sm">Risk Prediction</span>
          </div>
          <p className="text-slate-800 font-semibold">Early warning for at-risk students</p>
        </div>

        <div className="bg-white rounded-xl p-4 border-l-4 border-indigo-500 shadow-sm border border-slate-200">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center">
              <svg className="w-4 h-4 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
            </div>
            <span className="text-slate-500 text-sm">Interventions</span>
          </div>
          <p className="text-slate-800 font-semibold">Personalized action plans</p>
        </div>
      </div>

      {/* Tab Content */}
      <div className="bg-gradient-to-br from-slate-50 to-indigo-50 rounded-2xl p-6 border border-slate-200">
        {activeTab === 'grouping' && (
          <StudentGroupingPanel teacherId={user.id} />
        )}
        {activeTab === 'at-risk' && (
          <AtRiskDashboard teacherId={user.id} />
        )}
        {activeTab === 'interventions' && (
          <InterventionPlanCard teacherId={user.id} showAllAtRisk={true} />
        )}
      </div>

      {/* Footer Info */}
      <div className="bg-white rounded-xl p-4 flex flex-col md:flex-row items-center justify-between gap-4 border border-slate-200 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
            <svg className="w-5 h-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <p className="text-slate-800 font-medium">About AI Insights</p>
            <p className="text-slate-600 text-sm">
              All AI features run locally using rule-based algorithms. No data is sent to external services.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-slate-500 text-sm">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>All systems operational</span>
        </div>
      </div>
    </div>
  );
}
