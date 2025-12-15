'use client';

import React, { useState, useMemo } from 'react';
import {
  createInterventionPlan,
  getAtRiskInterventionPlans,
  type InterventionPlan,
  type Intervention,
} from '@/lib/interventionRecommendations';
import type { InterventionPriority } from '@/types';

interface InterventionPlanCardProps {
  studentId?: string;
  teacherId?: string;
  showAllAtRisk?: boolean;
}

const PriorityBadge: React.FC<{ priority: InterventionPriority }> = ({ priority }) => {
  const config = {
    critical: { bg: 'bg-red-100', text: 'text-red-600', border: 'border-red-300' },
    high: { bg: 'bg-orange-100', text: 'text-orange-600', border: 'border-orange-300' },
    medium: { bg: 'bg-amber-100', text: 'text-amber-600', border: 'border-amber-300' },
    low: { bg: 'bg-emerald-100', text: 'text-emerald-600', border: 'border-emerald-300' },
  };

  const { bg, text, border } = config[priority];

  return (
    <span className={`px-2 py-0.5 rounded text-xs font-medium uppercase ${bg} ${text} border ${border}`}>
      {priority}
    </span>
  );
};

const InterventionCard: React.FC<{
  intervention: Intervention;
  isExpanded: boolean;
  onToggle: () => void;
}> = ({ intervention, isExpanded, onToggle }) => {
  const categoryIcons: Record<string, string> = {
    foundational: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4',
    'skill-gap': 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4',
    'question-type': 'M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
    consistency: 'M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15',
    advancement: 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6',
  };

  return (
    <div className="bg-slate-50 rounded-xl overflow-hidden border border-slate-200">
      <button
        onClick={onToggle}
        className="w-full p-4 flex items-start justify-between hover:bg-slate-100 transition-colors"
      >
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d={categoryIcons[intervention.category] || categoryIcons.foundational}
              />
            </svg>
          </div>
          <div className="text-left">
            <h4 className="text-slate-800 font-medium">{intervention.title}</h4>
            <p className="text-slate-600 text-sm mt-1">{intervention.description}</p>
            <div className="flex flex-wrap items-center gap-2 mt-2">
              <PriorityBadge priority={intervention.priority} />
              <span className="text-slate-400 text-xs">|</span>
              <span className="text-slate-500 text-xs">{intervention.targetArea}</span>
              <span className="text-slate-400 text-xs">|</span>
              <span className="text-slate-500 text-xs">{intervention.estimatedDuration}</span>
            </div>
          </div>
        </div>
        <svg
          className={`w-5 h-5 text-slate-400 transition-transform flex-shrink-0 ${isExpanded ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isExpanded && (
        <div className="px-4 pb-4 space-y-4 border-t border-slate-200">
          {/* Rationale */}
          <div className="pt-4">
            <h5 className="text-slate-500 text-sm font-medium mb-2">Why This Intervention?</h5>
            <p className="text-slate-600 text-sm bg-white rounded-lg p-3 border border-slate-200">
              {intervention.rationale}
            </p>
          </div>

          {/* Activities */}
          <div>
            <h5 className="text-slate-500 text-sm font-medium mb-2">Activities</h5>
            <div className="space-y-2">
              {intervention.activities.map((activity, idx) => (
                <div key={idx} className="bg-white rounded-lg p-3 border border-slate-200">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-800 text-sm font-medium">{activity.name}</span>
                    <span className="text-emerald-600 text-xs">{activity.duration}</span>
                  </div>
                  <p className="text-slate-600 text-sm mt-1">{activity.description}</p>
                  {activity.frequency && (
                    <p className="text-slate-500 text-xs mt-1">Frequency: {activity.frequency}</p>
                  )}
                  {activity.materials && activity.materials.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {activity.materials.map((material, midx) => (
                        <span key={midx} className="text-xs px-2 py-0.5 bg-slate-100 rounded text-slate-500">
                          {material}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Resources */}
          {intervention.resources.length > 0 && (
            <div>
              <h5 className="text-slate-500 text-sm font-medium mb-2">Resources</h5>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {intervention.resources.map((resource, idx) => (
                  <div key={idx} className="bg-white rounded-lg p-3 flex items-start gap-2 border border-slate-200">
                    <div className="w-8 h-8 rounded bg-indigo-100 flex items-center justify-center flex-shrink-0">
                      <span className="text-indigo-600 text-xs uppercase">{resource.type.slice(0, 2)}</span>
                    </div>
                    <div>
                      <p className="text-slate-800 text-sm">{resource.name}</p>
                      <p className="text-slate-500 text-xs">{resource.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Checkpoints */}
          <div>
            <h5 className="text-slate-500 text-sm font-medium mb-2">Progress Checkpoints</h5>
            <div className="relative">
              <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-slate-200" />
              <div className="space-y-4">
                {intervention.checkpoints.map((checkpoint, idx) => (
                  <div key={idx} className="flex items-start gap-4 relative">
                    <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center z-10">
                      <span className="text-white text-xs font-bold">{idx + 1}</span>
                    </div>
                    <div className="flex-1 bg-white rounded-lg p-3 border border-slate-200">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-800 text-sm font-medium">{checkpoint.milestone}</span>
                        <span className="text-emerald-600 text-xs">{checkpoint.timeframe}</span>
                      </div>
                      <p className="text-slate-600 text-sm mt-1">{checkpoint.indicator}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const StudentPlanSection: React.FC<{
  plan: InterventionPlan;
  defaultExpanded?: boolean;
}> = ({ plan, defaultExpanded = false }) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const [expandedInterventions, setExpandedInterventions] = useState<Set<string>>(new Set());

  const toggleIntervention = (id: string) => {
    const newExpanded = new Set(expandedInterventions);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedInterventions(newExpanded);
  };

  const priorityColors = {
    critical: 'border-red-500',
    high: 'border-orange-500',
    medium: 'border-amber-500',
    low: 'border-emerald-500',
  };

  return (
    <div className={`bg-white rounded-xl overflow-hidden border border-slate-200 shadow-sm border-l-4 ${priorityColors[plan.overallPriority]}`}>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-4 flex items-center justify-between hover:bg-slate-50 transition-colors"
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold">
            {plan.studentName.charAt(0)}
          </div>
          <div className="text-left">
            <h3 className="text-slate-800 font-semibold">{plan.studentName}</h3>
            <p className="text-slate-500 text-sm">
              {plan.interventions.length} interventions | Priority: {plan.overallPriority}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <PriorityBadge priority={plan.overallPriority} />
          <svg
            className={`w-5 h-5 text-slate-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {isExpanded && (
        <div className="p-4 pt-0 space-y-4">
          {/* Summary */}
          <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
            <p className="text-slate-600 text-sm">{plan.summary}</p>
          </div>

          {/* Context Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-slate-50 rounded-lg p-3 text-center border border-slate-200">
              <p className="text-slate-500 text-xs">Average Score</p>
              <p className="text-xl font-bold text-slate-800">{plan.context.averageScore}%</p>
            </div>
            <div className="bg-slate-50 rounded-lg p-3 text-center border border-slate-200">
              <p className="text-slate-500 text-xs">Performance</p>
              <p className="text-sm font-medium text-slate-800">{plan.context.performanceTier}</p>
            </div>
            <div className="bg-slate-50 rounded-lg p-3 text-center border border-slate-200">
              <p className="text-slate-500 text-xs">Trend</p>
              <p className={`text-sm font-medium ${
                plan.context.trend === 'improving' ? 'text-emerald-500' :
                plan.context.trend === 'declining' ? 'text-red-500' : 'text-slate-500'
              }`}>
                {plan.context.trend.charAt(0).toUpperCase() + plan.context.trend.slice(1)}
              </p>
            </div>
            <div className="bg-slate-50 rounded-lg p-3 text-center border border-slate-200">
              <p className="text-slate-500 text-xs">Assessments</p>
              <p className="text-xl font-bold text-slate-800">{plan.context.totalAssessments}</p>
            </div>
          </div>

          {/* Weak Subjects */}
          {plan.context.weakSubjects.length > 0 && (
            <div>
              <h4 className="text-slate-500 text-sm font-medium mb-2">Weak Subjects</h4>
              <div className="flex flex-wrap gap-2">
                {plan.context.weakSubjects.map((subject) => (
                  <span
                    key={subject.subject}
                    className="px-3 py-1.5 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600"
                  >
                    {subject.subject}: {subject.averageScore}%
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Weekly Focus */}
          {plan.weeklyFocus.length > 0 && (
            <div>
              <h4 className="text-slate-500 text-sm font-medium mb-2">Weekly Focus Plan</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {plan.weeklyFocus.slice(0, 4).map((week) => (
                  <div key={week.week} className="bg-slate-50 rounded-lg p-3 border border-slate-200">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="w-6 h-6 rounded-full bg-indigo-500 flex items-center justify-center text-white text-xs font-bold">
                        {week.week}
                      </span>
                      <span className="text-slate-800 text-sm font-medium">Week {week.week}</span>
                    </div>
                    <p className="text-slate-600 text-sm">{week.focus}</p>
                    <p className="text-emerald-600 text-xs mt-1">Goal: {week.goal}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Quick Wins */}
          {plan.quickWins.length > 0 && (
            <div>
              <h4 className="text-slate-500 text-sm font-medium mb-2">Quick Wins</h4>
              <div className="flex flex-wrap gap-2">
                {plan.quickWins.map((intervention) => (
                  <span
                    key={intervention.id}
                    className="px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-lg text-sm text-emerald-600"
                  >
                    {intervention.title}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Interventions */}
          <div>
            <h4 className="text-slate-500 text-sm font-medium mb-2">Interventions ({plan.interventions.length})</h4>
            <div className="space-y-2">
              {plan.interventions.map((intervention) => (
                <InterventionCard
                  key={intervention.id}
                  intervention={intervention}
                  isExpanded={expandedInterventions.has(intervention.id)}
                  onToggle={() => toggleIntervention(intervention.id)}
                />
              ))}
            </div>
          </div>

          {/* Generated Info */}
          <div className="text-center text-slate-500 text-xs">
            Generated on {new Date(plan.generatedAt).toLocaleString()}
          </div>
        </div>
      )}
    </div>
  );
};

export const InterventionPlanCard: React.FC<InterventionPlanCardProps> = ({
  studentId,
  teacherId,
  showAllAtRisk = false,
}) => {
  // Generate plans
  const plans = useMemo(() => {
    if (studentId) {
      const plan = createInterventionPlan(studentId);
      return plan ? [plan] : [];
    }
    if (teacherId && showAllAtRisk) {
      return getAtRiskInterventionPlans(teacherId);
    }
    return [];
  }, [studentId, teacherId, showAllAtRisk]);

  if (plans.length === 0) {
    return (
      <div className="bg-white rounded-xl p-8 text-center border border-slate-200">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-indigo-100 flex items-center justify-center">
          <svg className="w-8 h-8 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        </div>
        <h3 className="text-slate-800 font-medium mb-2">No Intervention Plans</h3>
        <p className="text-slate-500 text-sm">
          {studentId
            ? 'No assessment data available to generate an intervention plan.'
            : 'No at-risk students found requiring intervention plans.'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-800">Intervention Recommendations</h2>
        <p className="text-slate-600 text-sm">
          AI-generated personalized intervention plans for student improvement
        </p>
      </div>

      {/* Summary Stats */}
      {plans.length > 1 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
            <p className="text-slate-500 text-sm">Total Plans</p>
            <p className="text-2xl font-bold text-slate-800">{plans.length}</p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
            <p className="text-slate-500 text-sm">Critical Priority</p>
            <p className="text-2xl font-bold text-red-500">
              {plans.filter(p => p.overallPriority === 'critical').length}
            </p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
            <p className="text-slate-500 text-sm">High Priority</p>
            <p className="text-2xl font-bold text-orange-500">
              {plans.filter(p => p.overallPriority === 'high').length}
            </p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
            <p className="text-slate-500 text-sm">Total Interventions</p>
            <p className="text-2xl font-bold text-indigo-600">
              {plans.reduce((sum, p) => sum + p.interventions.length, 0)}
            </p>
          </div>
        </div>
      )}

      {/* Plans */}
      <div className="space-y-4">
        {plans.map((plan, idx) => (
          <StudentPlanSection
            key={plan.studentId}
            plan={plan}
            defaultExpanded={plans.length === 1 || idx === 0}
          />
        ))}
      </div>
    </div>
  );
};

export default InterventionPlanCard;
