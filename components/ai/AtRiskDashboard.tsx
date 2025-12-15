'use client';

import React, { useState, useMemo } from 'react';
import {
  calculateClassRisk,
  calculateStudentRisk,
  generateRiskAlerts,
  acknowledgeAlert,
  type RiskAssessment,
  type ClassRiskSummary,
  type RiskAlert,
} from '@/lib/atRiskPrediction';
import type { RiskLevel } from '@/types';

interface AtRiskDashboardProps {
  teacherId: string;
}

const RiskLevelBadge: React.FC<{ level: RiskLevel; score: number }> = ({ level, score }) => {
  const config = {
    high: { bg: 'bg-red-100', text: 'text-red-600', border: 'border-red-300' },
    medium: { bg: 'bg-amber-100', text: 'text-amber-600', border: 'border-amber-300' },
    low: { bg: 'bg-emerald-100', text: 'text-emerald-600', border: 'border-emerald-300' },
  };

  const { bg, text, border } = config[level];

  return (
    <span className={`px-3 py-1 rounded-full text-sm font-medium ${bg} ${text} border ${border}`}>
      {level.toUpperCase()} ({score})
    </span>
  );
};

const RiskFactorBar: React.FC<{ label: string; value: number; color: string }> = ({ label, value, color }) => {
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-sm">
        <span className="text-slate-500">{label}</span>
        <span className="text-slate-800">{value}</span>
      </div>
      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${value}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
};

const StudentRiskCard: React.FC<{
  assessment: RiskAssessment;
  isExpanded: boolean;
  onToggle: () => void;
}> = ({ assessment, isExpanded, onToggle }) => {
  const trendIcon = {
    worsening: { icon: 'arrow-down', color: 'text-red-500', label: 'Worsening' },
    stable: { icon: 'minus', color: 'text-slate-500', label: 'Stable' },
    improving: { icon: 'arrow-up', color: 'text-emerald-500', label: 'Improving' },
  };

  const trend = trendIcon[assessment.trend];

  return (
    <div className="bg-white rounded-xl overflow-hidden border border-slate-200 shadow-sm">
      {/* Header */}
      <button
        onClick={onToggle}
        className="w-full p-4 flex items-center justify-between hover:bg-slate-50 transition-colors"
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold">
            {assessment.studentName.charAt(0)}
          </div>
          <div className="text-left">
            <h4 className="text-slate-800 font-medium">{assessment.studentName}</h4>
            <p className="text-slate-500 text-sm">
              Grade {assessment.grade} | {assessment.assessmentCount} assessments
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className={`flex items-center gap-1 ${trend.color}`}>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {assessment.trend === 'worsening' && (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              )}
              {assessment.trend === 'improving' && (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
              )}
              {assessment.trend === 'stable' && (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
              )}
            </svg>
            <span className="text-sm">{trend.label}</span>
          </div>
          <RiskLevelBadge level={assessment.riskLevel} score={assessment.overallRiskScore} />
        </div>
      </button>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="px-4 pb-4 space-y-4 border-t border-slate-100">
          {/* Risk Factors */}
          <div className="pt-4">
            <h5 className="text-slate-500 text-sm font-medium mb-3">Risk Factors</h5>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <RiskFactorBar
                label="Academic"
                value={assessment.riskFactors.academicScore}
                color={assessment.riskFactors.academicScore > 60 ? '#ef4444' : '#10b981'}
              />
              <RiskFactorBar
                label="Trend"
                value={assessment.riskFactors.trendScore}
                color={assessment.riskFactors.trendScore > 60 ? '#ef4444' : '#10b981'}
              />
              <RiskFactorBar
                label="Engagement"
                value={assessment.riskFactors.engagementScore}
                color={assessment.riskFactors.engagementScore > 60 ? '#ef4444' : '#10b981'}
              />
              <RiskFactorBar
                label="Consistency"
                value={assessment.riskFactors.consistencyScore}
                color={assessment.riskFactors.consistencyScore > 60 ? '#ef4444' : '#10b981'}
              />
            </div>
          </div>

          {/* Triggers */}
          {assessment.triggerFactors.length > 0 && (
            <div>
              <h5 className="text-slate-500 text-sm font-medium mb-2">Risk Triggers</h5>
              <div className="space-y-2">
                {assessment.triggerFactors.map((trigger, idx) => (
                  <div
                    key={idx}
                    className={`p-3 rounded-lg border ${
                      trigger.severity === 'critical'
                        ? 'bg-red-50 border-red-200'
                        : trigger.severity === 'warning'
                        ? 'bg-amber-50 border-amber-200'
                        : 'bg-blue-50 border-blue-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-slate-800 text-sm font-medium">{trigger.factor}</span>
                      <span className={`text-xs px-2 py-0.5 rounded ${
                        trigger.severity === 'critical' ? 'bg-red-500 text-white' :
                        trigger.severity === 'warning' ? 'bg-amber-500 text-white' :
                        'bg-blue-500 text-white'
                      }`}>
                        {trigger.severity}
                      </span>
                    </div>
                    <p className="text-slate-600 text-sm mt-1">{trigger.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Primary Concerns */}
          {assessment.primaryConcerns.length > 0 && (
            <div>
              <h5 className="text-slate-500 text-sm font-medium mb-2">Primary Concerns</h5>
              <ul className="space-y-1">
                {assessment.primaryConcerns.map((concern, idx) => (
                  <li key={idx} className="text-slate-600 text-sm flex items-start gap-2">
                    <span className="text-red-500">!</span>
                    {concern}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Recommended Actions */}
          <div>
            <h5 className="text-slate-500 text-sm font-medium mb-2">Recommended Actions</h5>
            <ul className="space-y-1">
              {assessment.recommendedActions.map((action, idx) => (
                <li key={idx} className="text-slate-600 text-sm flex items-start gap-2">
                  <span className="text-emerald-600">→</span>
                  {action}
                </li>
              ))}
            </ul>
          </div>

          {/* Last Assessment */}
          <div className="text-slate-500 text-sm">
            Last assessment: {new Date(assessment.lastAssessmentDate).toLocaleDateString()}
          </div>
        </div>
      )}
    </div>
  );
};

export const AtRiskDashboard: React.FC<AtRiskDashboardProps> = ({ teacherId }) => {
  const [expandedStudents, setExpandedStudents] = useState<Set<string>>(new Set());
  const [selectedRiskLevel, setSelectedRiskLevel] = useState<RiskLevel | 'all'>('all');

  // Calculate class risk
  const classSummary = useMemo(() => {
    return calculateClassRisk(teacherId);
  }, [teacherId]);

  // Generate alerts
  const alerts = useMemo(() => {
    return generateRiskAlerts(teacherId);
  }, [teacherId]);

  // Filter students by risk level
  const filteredStudents = useMemo(() => {
    if (selectedRiskLevel === 'all') {
      return [...classSummary.highRiskStudents, ...classSummary.mediumRiskStudents];
    }
    if (selectedRiskLevel === 'high') {
      return classSummary.highRiskStudents;
    }
    return classSummary.mediumRiskStudents;
  }, [classSummary, selectedRiskLevel]);

  const toggleStudent = (studentId: string) => {
    const newExpanded = new Set(expandedStudents);
    if (newExpanded.has(studentId)) {
      newExpanded.delete(studentId);
    } else {
      newExpanded.add(studentId);
    }
    setExpandedStudents(newExpanded);
  };

  const trendConfig = {
    worsening: { color: 'text-red-500', bg: 'bg-red-100' },
    stable: { color: 'text-slate-500', bg: 'bg-slate-100' },
    improving: { color: 'text-emerald-500', bg: 'bg-emerald-100' },
  };

  const trend = trendConfig[classSummary.classRiskTrend];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">At-Risk Student Dashboard</h2>
          <p className="text-slate-600 text-sm">
            AI-powered early warning system for student intervention
          </p>
        </div>

        <div className={`px-4 py-2 rounded-lg ${trend.bg}`}>
          <span className={`${trend.color} font-medium`}>
            Class Trend: {classSummary.classRiskTrend.charAt(0).toUpperCase() + classSummary.classRiskTrend.slice(1)}
          </span>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
          <p className="text-slate-500 text-sm">Total Students</p>
          <p className="text-2xl font-bold text-slate-800">{classSummary.totalStudents}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border-l-4 border-red-500 border border-slate-200 shadow-sm">
          <p className="text-slate-500 text-sm">High Risk</p>
          <p className="text-2xl font-bold text-red-500">{classSummary.highRiskCount}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border-l-4 border-amber-500 border border-slate-200 shadow-sm">
          <p className="text-slate-500 text-sm">Medium Risk</p>
          <p className="text-2xl font-bold text-amber-500">{classSummary.mediumRiskCount}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border-l-4 border-emerald-500 border border-slate-200 shadow-sm">
          <p className="text-slate-500 text-sm">Low Risk</p>
          <p className="text-2xl font-bold text-emerald-500">{classSummary.lowRiskCount}</p>
        </div>
      </div>

      {/* Risk Distribution Bar */}
      <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-slate-800 font-medium">Risk Distribution</h3>
          <span className="text-slate-500 text-sm">
            Avg Risk Score: {classSummary.averageRiskScore}
          </span>
        </div>
        <div className="flex h-4 rounded-full overflow-hidden bg-slate-100">
          {classSummary.totalStudents > 0 && (
            <>
              <div
                className="h-full bg-red-500 transition-all"
                style={{ width: `${(classSummary.highRiskCount / classSummary.totalStudents) * 100}%` }}
              />
              <div
                className="h-full bg-amber-500 transition-all"
                style={{ width: `${(classSummary.mediumRiskCount / classSummary.totalStudents) * 100}%` }}
              />
              <div
                className="h-full bg-emerald-500 transition-all"
                style={{ width: `${(classSummary.lowRiskCount / classSummary.totalStudents) * 100}%` }}
              />
            </>
          )}
        </div>
      </div>

      {/* Alerts Section */}
      {alerts.length > 0 && (
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
          <h3 className="text-slate-800 font-medium mb-3">Active Alerts ({alerts.length})</h3>
          <div className="space-y-2">
            {alerts.slice(0, 5).map((alert) => (
              <div
                key={alert.id}
                className={`p-3 rounded-lg flex items-start justify-between ${
                  alert.severity === 'critical'
                    ? 'bg-red-50 border border-red-200'
                    : 'bg-amber-50 border border-amber-200'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`p-1 rounded ${
                    alert.severity === 'critical' ? 'bg-red-500' : 'bg-amber-500'
                  }`}>
                    <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-slate-800 text-sm font-medium">{alert.message}</p>
                    <p className="text-slate-500 text-xs mt-1">
                      {new Date(alert.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Common Risk Factors */}
      {classSummary.commonRiskFactors.length > 0 && (
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
          <h3 className="text-slate-800 font-medium mb-3">Common Risk Factors</h3>
          <div className="flex flex-wrap gap-2">
            {classSummary.commonRiskFactors.map((factor) => (
              <span
                key={factor.factor}
                className="px-3 py-1.5 bg-slate-100 rounded-lg text-sm text-slate-600 border border-slate-200"
              >
                {factor.factor} ({factor.count} students)
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Filter */}
      <div className="flex gap-2">
        <button
          onClick={() => setSelectedRiskLevel('all')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            selectedRiskLevel === 'all'
              ? 'bg-indigo-500 text-white'
              : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
          }`}
        >
          All At-Risk ({classSummary.highRiskCount + classSummary.mediumRiskCount})
        </button>
        <button
          onClick={() => setSelectedRiskLevel('high')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            selectedRiskLevel === 'high'
              ? 'bg-red-500 text-white'
              : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
          }`}
        >
          High Risk ({classSummary.highRiskCount})
        </button>
        <button
          onClick={() => setSelectedRiskLevel('medium')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            selectedRiskLevel === 'medium'
              ? 'bg-amber-500 text-white'
              : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
          }`}
        >
          Medium Risk ({classSummary.mediumRiskCount})
        </button>
      </div>

      {/* Student List */}
      <div className="space-y-3">
        {filteredStudents.length === 0 ? (
          <div className="bg-white rounded-xl p-8 text-center border border-slate-200">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-emerald-100 flex items-center justify-center">
              <svg className="w-8 h-8 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-slate-600">No at-risk students in this category!</p>
            <p className="text-slate-500 text-sm mt-1">All students are performing well.</p>
          </div>
        ) : (
          filteredStudents.map((assessment) => (
            <StudentRiskCard
              key={assessment.studentId}
              assessment={assessment}
              isExpanded={expandedStudents.has(assessment.studentId)}
              onToggle={() => toggleStudent(assessment.studentId)}
            />
          ))
        )}
      </div>

      {/* Footer */}
      <div className="text-center text-slate-500 text-sm">
        <p>Last updated: {new Date(classSummary.lastUpdated).toLocaleString()}</p>
      </div>
    </div>
  );
};

export default AtRiskDashboard;
