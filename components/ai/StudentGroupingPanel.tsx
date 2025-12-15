'use client';

import React, { useState, useMemo } from 'react';
import {
  groupStudentsForTaRL,
  generateMixedAbilityGroups,
  getGroupingSummary,
  type StudentGroup,
  type GroupingResult,
  type StudentGroupingInput,
} from '@/lib/studentGrouping';

interface StudentGroupingPanelProps {
  teacherId: string;
  subject?: string;
  grade?: number;
}

const GroupCard: React.FC<{
  group: StudentGroup;
  isExpanded: boolean;
  onToggle: () => void;
}> = ({ group, isExpanded, onToggle }) => {
  return (
    <div
      className="rounded-xl overflow-hidden transition-all duration-300 bg-white border border-slate-200 shadow-sm"
      style={{ borderLeft: `4px solid ${group.color}` }}
    >
      {/* Header */}
      <button
        onClick={onToggle}
        className="w-full bg-slate-50 hover:bg-slate-100 p-4 flex items-center justify-between transition-colors"
      >
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold"
            style={{ backgroundColor: group.color }}
          >
            {group.students.length}
          </div>
          <div className="text-left">
            <h3 className="text-slate-800 font-semibold">{group.groupName}</h3>
            <p className="text-slate-500 text-sm">{group.description}</p>
          </div>
        </div>
        <svg
          className={`w-5 h-5 text-slate-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="bg-white p-4 space-y-4 border-t border-slate-100">
          {/* Students List */}
          <div>
            <h4 className="text-slate-500 text-sm font-medium mb-2">Students ({group.students.length})</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {group.students.map((student) => (
                <div
                  key={student.studentId}
                  className="bg-slate-50 rounded-lg p-3 flex items-center justify-between border border-slate-100"
                >
                  <span className="text-slate-800 text-sm">{student.studentName}</span>
                  <span
                    className="text-sm font-medium px-2 py-1 rounded"
                    style={{
                      backgroundColor: `${group.color}20`,
                      color: group.color,
                    }}
                  >
                    {student.averageScore}%
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Recommended Focus */}
          <div>
            <h4 className="text-slate-500 text-sm font-medium mb-2">Recommended Focus Areas</h4>
            <ul className="space-y-1">
              {group.recommendedFocus.slice(0, 4).map((focus, idx) => (
                <li key={idx} className="text-slate-600 text-sm flex items-start gap-2">
                  <span style={{ color: group.color }}>•</span>
                  {focus}
                </li>
              ))}
            </ul>
          </div>

          {/* Suggested Activities */}
          <div>
            <h4 className="text-slate-500 text-sm font-medium mb-2">Suggested Activities</h4>
            <div className="flex flex-wrap gap-2">
              {group.suggestedActivities.slice(0, 4).map((activity, idx) => (
                <span
                  key={idx}
                  className="text-xs px-3 py-1 rounded-full bg-slate-100 text-slate-600 border border-slate-200"
                >
                  {activity}
                </span>
              ))}
            </div>
          </div>

          {/* Teaching Strategies */}
          {group.teachingStrategies && group.teachingStrategies.length > 0 && (
            <div>
              <h4 className="text-slate-500 text-sm font-medium mb-2">Teaching Strategies</h4>
              <ul className="space-y-1">
                {group.teachingStrategies.slice(0, 3).map((strategy, idx) => (
                  <li key={idx} className="text-slate-600 text-sm flex items-start gap-2">
                    <span className="text-emerald-600">→</span>
                    {strategy}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export const StudentGroupingPanel: React.FC<StudentGroupingPanelProps> = ({
  teacherId,
  subject,
  grade,
}) => {
  const [selectedSubject, setSelectedSubject] = useState<string | undefined>(subject);
  const [groupingMethod, setGroupingMethod] = useState<'tarl' | 'mixed'>('tarl');
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set(['Beginner', 'Needs Support']));

  // Generate grouping
  const groupingResult = useMemo(() => {
    return groupStudentsForTaRL(teacherId, selectedSubject, grade);
  }, [teacherId, selectedSubject, grade]);

  // Generate summary
  const summary = useMemo(() => {
    return getGroupingSummary(groupingResult.groups);
  }, [groupingResult.groups]);

  const toggleGroup = (groupName: string) => {
    const newExpanded = new Set(expandedGroups);
    if (newExpanded.has(groupName)) {
      newExpanded.delete(groupName);
    } else {
      newExpanded.add(groupName);
    }
    setExpandedGroups(newExpanded);
  };

  const subjects = ['Mathematics', 'English', 'Urdu'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">AI Student Grouping</h2>
          <p className="text-slate-600 text-sm">
            Automatically group students by competency for TaRL instruction
          </p>
        </div>

        <div className="flex gap-3">
          {/* Subject Filter */}
          <select
            value={selectedSubject || ''}
            onChange={(e) => setSelectedSubject(e.target.value || undefined)}
            className="bg-white text-slate-800 rounded-lg px-4 py-2 text-sm border border-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
          >
            <option value="">All Subjects</option>
            {subjects.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>

          {/* Grouping Method */}
          <select
            value={groupingMethod}
            onChange={(e) => setGroupingMethod(e.target.value as 'tarl' | 'mixed')}
            className="bg-white text-slate-800 rounded-lg px-4 py-2 text-sm border border-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
          >
            <option value="tarl">TaRL Grouping</option>
            <option value="mixed">Mixed Ability</option>
          </select>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
          <p className="text-slate-500 text-sm">Total Students</p>
          <p className="text-2xl font-bold text-slate-800">{summary.totalStudents}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
          <p className="text-slate-500 text-sm">Groups Created</p>
          <p className="text-2xl font-bold text-slate-800">{groupingResult.groups.length}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
          <p className="text-slate-500 text-sm">Class Average</p>
          <p className="text-2xl font-bold text-emerald-600">{summary.averageScore}%</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
          <p className="text-slate-500 text-sm">Needs Attention</p>
          <p className="text-2xl font-bold text-red-500">{summary.needsAttention}</p>
        </div>
      </div>

      {/* Distribution Bar */}
      <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
        <h3 className="text-slate-800 font-medium mb-3">Distribution</h3>
        <div className="flex h-4 rounded-full overflow-hidden bg-slate-100">
          {summary.distribution.map((dist) => (
            <div
              key={dist.level}
              className="h-full transition-all"
              style={{
                width: `${dist.percentage}%`,
                backgroundColor: groupingResult.groups.find(g => g.groupName === dist.level)?.color || '#666',
              }}
              title={`${dist.level}: ${dist.count} students (${dist.percentage}%)`}
            />
          ))}
        </div>
        <div className="flex flex-wrap gap-4 mt-3">
          {summary.distribution.map((dist) => (
            <div key={dist.level} className="flex items-center gap-2 text-sm">
              <div
                className="w-3 h-3 rounded-full"
                style={{
                  backgroundColor: groupingResult.groups.find(g => g.groupName === dist.level)?.color || '#666',
                }}
              />
              <span className="text-slate-600">
                {dist.level}: {dist.count} ({dist.percentage}%)
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Groups */}
      <div className="space-y-3">
        <h3 className="text-slate-800 font-medium">Student Groups</h3>
        {groupingResult.groups.length === 0 ? (
          <div className="bg-white rounded-xl p-8 text-center border border-slate-200">
            <p className="text-slate-500">No students to group. Complete some assessments first.</p>
          </div>
        ) : (
          groupingResult.groups.map((group) => (
            <GroupCard
              key={group.groupName}
              group={group}
              isExpanded={expandedGroups.has(group.groupName)}
              onToggle={() => toggleGroup(group.groupName)}
            />
          ))
        )}
      </div>

      {/* Footer Info */}
      <div className="text-center text-slate-500 text-sm">
        <p>
          Generated on {new Date(groupingResult.generatedAt).toLocaleString()} |
          Method: {groupingResult.groupingMethod.toUpperCase()}
        </p>
      </div>
    </div>
  );
};

export default StudentGroupingPanel;
