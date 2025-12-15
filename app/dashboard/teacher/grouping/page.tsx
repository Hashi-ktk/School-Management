'use client';

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { getGroupedStudents } from "@/lib/teacherAnalytics";
import { exportGroupingReport } from "@/lib/exportPDF";
import type { StudentAnalytics, PerformanceTier } from "@/types";

export default function GroupingPage() {
  const { user, isLoading } = useAuth();
  const [groups, setGroups] = useState<Record<PerformanceTier, StudentAnalytics[]> | null>(null);

  useEffect(() => {
    if (isLoading || !user) return;
    setGroups(getGroupedStudents(user.id));
  }, [isLoading, user]);

  if (isLoading || !user || !groups) {
    return <div className="min-h-[50vh] grid place-content-center text-slate-600">Loading...</div>;
  }

  const tierConfig: Record<PerformanceTier, { color: string; bgColor: string; icon: string; description: string }> = {
    'Proficient': {
      color: '#10b981',
      bgColor: 'from-emerald-100 to-emerald-50',
      icon: '🌟',
      description: 'Students excelling with 80%+ average. Focus on enrichment and advanced challenges.',
    },
    'Developing': {
      color: '#f59e0b',
      bgColor: 'from-amber-100 to-amber-50',
      icon: '📈',
      description: 'Students progressing well with 60-79% average. Continue current support strategies.',
    },
    'Needs Support': {
      color: '#ef4444',
      bgColor: 'from-rose-100 to-rose-50',
      icon: '🎯',
      description: 'Students struggling with <60% average. Provide additional support and interventions.',
    },
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 px-4 md:px-0 py-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Grouping</p>
          <h1 className="text-3xl font-bold text-slate-800">
            Learning Groups
          </h1>
          <p className="text-slate-600">Automatically grouped students by performance level for targeted instruction.</p>
        </div>
        <Button
          variant="outline"
          size="md"
          onClick={exportGroupingReport}
        >
          📥 Export PDF
        </Button>
      </div>

      <div id="grouping-report" className="space-y-6">
        {(['Proficient', 'Developing', 'Needs Support'] as PerformanceTier[]).map(tier => {
          const students = groups[tier];
          const config = tierConfig[tier];

          return (
            <Card key={tier} className={`border-2 bg-gradient-to-br ${config.bgColor}`} style={{ borderColor: `${config.color}40` }}>
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex items-center gap-4">
                  <div
                    className="h-14 w-14 rounded-xl grid place-content-center text-3xl ring-2"
                    style={{ backgroundColor: `${config.color}20`, borderColor: `${config.color}60` }}
                  >
                    {config.icon}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-slate-800">{tier}</h2>
                    <p className="text-sm text-slate-600">{students.length} student{students.length !== 1 ? 's' : ''}</p>
                  </div>
                </div>
                <span
                  className="px-4 py-2 rounded-full text-lg font-bold"
                  style={{ backgroundColor: `${config.color}20`, color: config.color }}
                >
                  {students.length}
                </span>
              </div>

              <p className="text-sm text-slate-600 mb-4 p-3 rounded-lg bg-white border border-slate-200">
                💡 <strong>Recommendation:</strong> {config.description}
              </p>

              {students.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {students.map(student => (
                    <div
                      key={student.studentId}
                      className="flex items-center gap-3 p-3 rounded-lg bg-white border border-slate-200 hover:border-slate-300 transition"
                    >
                      <div
                        className="h-10 w-10 rounded-full grid place-content-center text-white font-bold ring-2"
                        style={{
                          background: `linear-gradient(135deg, ${config.color}, ${config.color}cc)`,
                          borderColor: `${config.color}60`
                        }}
                      >
                        {student.studentName.slice(0, 1)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-slate-800 text-sm truncate">{student.studentName}</p>
                        <p className="text-xs text-slate-500">{student.totalAssessments} assessments</p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold" style={{ color: config.color }}>
                          {student.averageScore}%
                        </p>
                        <p className="text-[10px] text-slate-500">
                          {student.trend === 'improving' ? '📈' : student.trend === 'declining' ? '📉' : '➡️'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-slate-500 py-8">No students in this group</p>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
