'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import Card from '@/components/ui/Card';
import LineChart from '@/components/charts/LineChart';
import RadarChart from '@/components/charts/RadarChart';
import ProgressRing from '@/components/charts/ProgressRing';
import { getAllResults } from '@/lib/utils';
import { transformToLineChartData, transformToRadarChartData } from '@/lib/filterUtils';
import type { AssessmentResult } from '@/types';

export default function StudentProgressPage() {
  const { user, isLoading } = useAuth();
  const [results, setResults] = useState<AssessmentResult[]>([]);
  const [lineChartData, setLineChartData] = useState<any[]>([]);
  const [radarChartData, setRadarChartData] = useState<any[]>([]);
  const [subjectProgress, setSubjectProgress] = useState<Record<string, any>>({});
  const [overallStats, setOverallStats] = useState({
    totalAssessments: 0,
    averageScore: 0,
    improvement: 0,
    bestSubject: '',
    focusSubject: '',
  });

  useEffect(() => {
    if (!user) return;

    const allResults = getAllResults()
      .filter(r => r.studentId === user.id && r.status === 'completed')
      .sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime());

    setResults(allResults);

    // Generate chart data
    const lineData = transformToLineChartData(getAllResults(), user.id);
    const radarData = transformToRadarChartData(getAllResults(), user.id);
    setLineChartData(lineData);
    setRadarChartData(radarData);

    // Calculate subject progress
    const subjects: Record<string, { scores: number[]; dates: string[] }> = {};
    allResults.forEach(r => {
      if (!subjects[r.subject]) {
        subjects[r.subject] = { scores: [], dates: [] };
      }
      subjects[r.subject].scores.push(r.percentage);
      subjects[r.subject].dates.push(r.completedAt);
    });

    const progress: Record<string, any> = {};
    let bestScore = 0;
    let bestSubject = '';
    let lowestScore = 100;
    let focusSubject = '';

    Object.entries(subjects).forEach(([subject, data]) => {
      const avg = data.scores.reduce((a, b) => a + b, 0) / data.scores.length;
      const recent = data.scores.slice(0, 3);
      const older = data.scores.slice(3, 6);
      const recentAvg = recent.length > 0 ? recent.reduce((a, b) => a + b, 0) / recent.length : avg;
      const olderAvg = older.length > 0 ? older.reduce((a, b) => a + b, 0) / older.length : avg;
      const trend = recentAvg - olderAvg;

      progress[subject] = {
        average: Math.round(avg),
        trend: trend > 5 ? 'improving' : trend < -5 ? 'declining' : 'stable',
        trendValue: Math.round(trend),
        totalAttempts: data.scores.length,
        highest: Math.max(...data.scores),
        lowest: Math.min(...data.scores),
      };

      if (avg > bestScore) {
        bestScore = avg;
        bestSubject = subject;
      }
      if (avg < lowestScore) {
        lowestScore = avg;
        focusSubject = subject;
      }
    });

    setSubjectProgress(progress);

    // Calculate overall stats
    const totalAvg = allResults.length > 0
      ? allResults.reduce((sum, r) => sum + r.percentage, 0) / allResults.length
      : 0;

    const recentResults = allResults.slice(0, 5);
    const olderResults = allResults.slice(5, 10);
    const recentAvg = recentResults.length > 0
      ? recentResults.reduce((sum, r) => sum + r.percentage, 0) / recentResults.length
      : 0;
    const olderAvg = olderResults.length > 0
      ? olderResults.reduce((sum, r) => sum + r.percentage, 0) / olderResults.length
      : recentAvg;

    setOverallStats({
      totalAssessments: allResults.length,
      averageScore: Math.round(totalAvg),
      improvement: Math.round(recentAvg - olderAvg),
      bestSubject,
      focusSubject: focusSubject !== bestSubject ? focusSubject : '',
    });
  }, [user]);

  if (isLoading || !user) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="h-12 w-12 rounded-full border-4 border-purple-200 border-t-purple-500 animate-spin" />
      </div>
    );
  }

  const getIcon = (subject: string) => {
    switch (subject) {
      case 'Mathematics': return '🔢';
      case 'English': return '📖';
      case 'Urdu': return '📝';
      default: return '📚';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving': return '📈';
      case 'declining': return '📉';
      default: return '➡️';
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-slate-800">My Progress</h1>
        <p className="text-lg text-slate-600">Track your learning journey and improvements</p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="text-center">
          <div className="text-3xl mb-2">📊</div>
          <p className="text-3xl font-bold text-slate-800">{overallStats.totalAssessments}</p>
          <p className="text-sm text-slate-500">Assessments Completed</p>
        </Card>
        <Card className="text-center">
          <ProgressRing value={overallStats.averageScore} size={80} color="auto" />
          <p className="text-sm text-slate-500 mt-2">Overall Average</p>
        </Card>
        <Card className={`text-center ${overallStats.improvement > 0 ? 'bg-emerald-50 border-emerald-200' : overallStats.improvement < 0 ? 'bg-red-50 border-red-200' : ''}`}>
          <div className="text-3xl mb-2">{overallStats.improvement > 0 ? '📈' : overallStats.improvement < 0 ? '📉' : '➡️'}</div>
          <p className={`text-3xl font-bold ${overallStats.improvement > 0 ? 'text-emerald-600' : overallStats.improvement < 0 ? 'text-red-600' : 'text-slate-600'}`}>
            {overallStats.improvement > 0 ? '+' : ''}{overallStats.improvement}%
          </p>
          <p className="text-sm text-slate-500">Recent Trend</p>
        </Card>
        <Card className="text-center bg-purple-50 border-purple-200">
          <div className="text-3xl mb-2">⭐</div>
          <p className="text-xl font-bold text-purple-700">{overallStats.bestSubject || 'N/A'}</p>
          <p className="text-sm text-purple-600">Strongest Subject</p>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <h3 className="text-lg font-bold text-slate-800 mb-4">📈 Score History</h3>
          {lineChartData.length > 0 ? (
            <LineChart data={lineChartData} />
          ) : (
            <div className="h-64 flex items-center justify-center text-slate-400">
              Complete assessments to see your progress
            </div>
          )}
        </Card>
        <Card>
          <h3 className="text-lg font-bold text-slate-800 mb-4">🎯 Subject Skills</h3>
          {radarChartData.length > 0 ? (
            <RadarChart data={radarChartData} height={280} />
          ) : (
            <div className="h-64 flex items-center justify-center text-slate-400">
              Complete assessments in different subjects
            </div>
          )}
        </Card>
      </div>

      {/* Subject Progress Cards */}
      <div>
        <h3 className="text-xl font-bold text-slate-800 mb-4">Subject Progress</h3>
        <div className="grid md:grid-cols-3 gap-4">
          {['Mathematics', 'English', 'Urdu'].map(subject => {
            const progress = subjectProgress[subject];
            if (!progress) {
              return (
                <Card key={subject} className="opacity-60">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-3xl">{getIcon(subject)}</span>
                    <h4 className="text-lg font-bold text-slate-700">{subject}</h4>
                  </div>
                  <p className="text-slate-400 text-center py-4">No assessments yet</p>
                </Card>
              );
            }

            const color = progress.average >= 80 ? 'emerald' : progress.average >= 60 ? 'amber' : 'red';

            return (
              <Card key={subject} className={`bg-${color}-50 border-${color}-200`}>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{getIcon(subject)}</span>
                    <h4 className="text-lg font-bold text-slate-700">{subject}</h4>
                  </div>
                  <span className="text-xl">{getTrendIcon(progress.trend)}</span>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600">Average</span>
                    <span className={`text-2xl font-bold text-${color}-600`}>{progress.average}%</span>
                  </div>

                  <div className="h-2 bg-white/50 rounded-full overflow-hidden">
                    <div
                      className={`h-full bg-${color}-500 rounded-full transition-all`}
                      style={{ width: `${progress.average}%` }}
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-center text-xs">
                    <div className="bg-white/60 rounded-lg p-2">
                      <p className="font-bold text-slate-700">{progress.totalAttempts}</p>
                      <p className="text-slate-500">Tests</p>
                    </div>
                    <div className="bg-white/60 rounded-lg p-2">
                      <p className="font-bold text-emerald-600">{progress.highest}%</p>
                      <p className="text-slate-500">Best</p>
                    </div>
                    <div className="bg-white/60 rounded-lg p-2">
                      <p className={`font-bold ${progress.trendValue > 0 ? 'text-emerald-600' : progress.trendValue < 0 ? 'text-red-600' : 'text-slate-600'}`}>
                        {progress.trendValue > 0 ? '+' : ''}{progress.trendValue}%
                      </p>
                      <p className="text-slate-500">Trend</p>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Learning Goals */}
      <Card className="bg-gradient-to-r from-purple-50 to-indigo-50 border-purple-200">
        <div className="flex items-start gap-4">
          <div className="text-4xl">🎯</div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-purple-800 mb-3">Your Learning Goals</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3 bg-white/60 rounded-lg p-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${overallStats.averageScore >= 70 ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                  {overallStats.averageScore >= 70 ? '✓' : '○'}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-slate-700">Reach 70% overall average</p>
                  <p className="text-xs text-slate-500">Current: {overallStats.averageScore}%</p>
                </div>
              </div>
              <div className="flex items-center gap-3 bg-white/60 rounded-lg p-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${overallStats.totalAssessments >= 10 ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                  {overallStats.totalAssessments >= 10 ? '✓' : '○'}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-slate-700">Complete 10 assessments</p>
                  <p className="text-xs text-slate-500">Progress: {overallStats.totalAssessments}/10</p>
                </div>
              </div>
              <div className="flex items-center gap-3 bg-white/60 rounded-lg p-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${overallStats.improvement > 0 ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                  {overallStats.improvement > 0 ? '✓' : '○'}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-slate-700">Show improvement over time</p>
                  <p className="text-xs text-slate-500">{overallStats.improvement > 0 ? 'You\'re improving! Keep it up!' : 'Keep practicing to improve'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
