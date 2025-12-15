'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import StatCard from '@/components/ui/StatCard';
import LineChart from '@/components/charts/LineChart';
import RadarChart from '@/components/charts/RadarChart';
import ProgressRing from '@/components/charts/ProgressRing';
import ActivityCalendar from '@/components/charts/ActivityCalendar';
import MultiLineChart from '@/components/charts/MultiLineChart';
import MetricCard from '@/components/charts/MetricCard';
import ComparisonBarChart from '@/components/charts/ComparisonBarChart';
import { useAuth } from '@/hooks/useAuth';
import { getAvailableAssessments, getAssessmentAttempt, getAllResults, formatDate } from '@/lib/utils';
import {
  transformToLineChartData,
  transformToRadarChartData,
  transformToActivityCalendarData,
  calculateStudentAchievements,
  calculateImprovementTrend,
  type Achievement
} from '@/lib/filterUtils';
import StudentAIInsights from '@/components/ai/StudentAIInsights';
import {
  generateWeeklyTrend,
  generateSubjectComparison,
  calculateSubjectInsights,
  generateSparklineData
} from '@/lib/analyticsUtils';
import type { Assessment, AssessmentResult } from '@/types';

export default function StudentDashboard() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [recentResults, setRecentResults] = useState<AssessmentResult[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [stats, setStats] = useState({
    available: 0,
    completed: 0,
    averageScore: 0,
    bestScore: 0,
    streak: 0,
  });
  const [lineChartData, setLineChartData] = useState<any[]>([]);
  const [radarChartData, setRadarChartData] = useState<any[]>([]);
  const [activityData, setActivityData] = useState<any[]>([]);
  const [improvementTrend, setImprovementTrend] = useState<{ trend: string; percentage: number }>({ trend: 'stable', percentage: 0 });
  const [weeklyTrendData, setWeeklyTrendData] = useState<any[]>([]);
  const [subjectComparison, setSubjectComparison] = useState<any[]>([]);
  const [subjectInsights, setSubjectInsights] = useState<Record<string, any>>({});
  const [classAverage, setClassAverage] = useState(0);
  const [sparklines, setSparklines] = useState<Record<string, number[]>>({});

  useEffect(() => {
    if (!user || !user.grade) return;

    const loadData = () => {
      // Load available assessments
      const available = getAvailableAssessments(user.id, user.grade!);

      // Calculate stats
      const allResults = getAllResults();
      const studentResults = allResults.filter((r) => r.studentId === user.id && r.status === 'completed');
      const avgScore = studentResults.length > 0
        ? studentResults.reduce((sum, r) => sum + r.percentage, 0) / studentResults.length
        : 0;
      const bestScore = studentResults.length > 0
        ? Math.max(...studentResults.map(r => r.percentage))
        : 0;

      // Calculate streak
      let streak = 0;
      const sortedResults = [...studentResults].sort(
        (a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime()
      );
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      for (let i = 0; i < 30; i++) {
        const checkDate = new Date(today);
        checkDate.setDate(checkDate.getDate() - i);
        const dateStr = checkDate.toISOString().split('T')[0];
        const hasActivity = sortedResults.some(
          r => r.completedAt.split('T')[0] === dateStr
        );
        if (hasActivity) {
          streak++;
        } else if (i > 0) {
          break;
        }
      }

      // Transform data for charts
      const lineData = transformToLineChartData(allResults, user.id);
      const radarData = transformToRadarChartData(allResults, user.id);
      const activityCalendarData = transformToActivityCalendarData(allResults, user.id, 12);
      const achievementsList = calculateStudentAchievements(allResults, user.id);
      const trend = calculateImprovementTrend(allResults, user.id);

      // Calculate class average for comparison
      const classResults = allResults.filter(r => r.grade === user.grade && r.status === 'completed');
      const classAvg = classResults.length > 0
        ? Math.round(classResults.reduce((sum, r) => sum + r.percentage, 0) / classResults.length)
        : 0;

      // Generate weekly trend data with subject breakdown
      const weeklyData = generateWeeklyTrend(studentResults, 8);

      // Generate subject comparison (student vs class)
      const studentSubjectData = generateSubjectComparison(studentResults);
      const classSubjectData = generateSubjectComparison(classResults);
      const comparisonData = studentSubjectData.map((s, i) => ({
        name: s.name,
        current: s.current,
        previous: classSubjectData[i]?.current || 0,
        benchmark: 70
      }));

      // Calculate subject insights
      const insights: Record<string, any> = {};
      ['Mathematics', 'English', 'Urdu'].forEach(subject => {
        insights[subject] = calculateSubjectInsights(studentResults, subject);
      });

      // Generate sparklines for metrics
      const sparks = {
        average: generateSparklineData(studentResults, 'average', 7),
        count: generateSparklineData(studentResults, 'count', 7),
        passRate: generateSparklineData(studentResults, 'passRate', 7)
      };

      // Get recent results (last 5)
      const recent = sortedResults.slice(0, 5);

      setAssessments(available);
      setRecentResults(recent);
      setAchievements(achievementsList);
      setLineChartData(lineData);
      setRadarChartData(radarData);
      setActivityData(activityCalendarData);
      setImprovementTrend(trend);
      setWeeklyTrendData(weeklyData);
      setSubjectComparison(comparisonData);
      setSubjectInsights(insights);
      setClassAverage(classAvg);
      setSparklines(sparks);
      setStats({
        available: available.length,
        completed: studentResults.length,
        averageScore: Math.round(avgScore),
        bestScore,
        streak,
      });
    };

    loadData();
  }, [user]);

  const handleStartAssessment = (assessmentId: string) => {
    router.push(`/dashboard/student/assessment/${assessmentId}`);
  };

  const hasInProgressAttempt = (assessmentId: string): boolean => {
    if (!user) return false;
    const attempt = getAssessmentAttempt(user.id, assessmentId);
    return attempt !== null;
  };

  const getTrendIcon = () => {
    if (improvementTrend.trend === 'improving') return '📈';
    if (improvementTrend.trend === 'declining') return '📉';
    return '➡️';
  };

  const getTrendColor = () => {
    if (improvementTrend.trend === 'improving') return 'text-emerald-600';
    if (improvementTrend.trend === 'declining') return 'text-red-500';
    return 'text-slate-500';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-3">
          <div className="h-12 w-12 mx-auto rounded-full border-4 border-purple-300 border-t-purple-600 animate-spin" />
          <p className="text-sm font-bold text-slate-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const earnedAchievements = achievements.filter(a => a.earned);
  const inProgressAchievements = achievements.filter(a => !a.earned && (a.progress || 0) > 0);

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header with Welcome and Quick Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="bg-gradient-to-br from-purple-100 via-white to-blue-100 border-2 border-purple-200">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold text-purple-600 animate-slide-in-left">
                  Welcome back, {user.name}!
                </h1>
                <p className="text-lg text-slate-600 animate-slide-in-left animate-delay-100">
                  Grade {user.grade} • Ready to learn today?
                </p>
                {stats.streak > 0 && (
                  <div className="inline-flex items-center gap-2 bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-sm font-bold">
                    🔥 {stats.streak} day streak!
                  </div>
                )}
                <div className={`inline-flex items-center gap-2 ml-2 ${getTrendColor()} text-sm font-medium`}>
                  {getTrendIcon()} {improvementTrend.trend === 'stable' ? 'Steady progress' :
                    improvementTrend.trend === 'improving' ? `Up ${improvementTrend.percentage}%` :
                    `Down ${improvementTrend.percentage}%`}
                </div>
              </div>
              <div className="flex-shrink-0">
                <ProgressRing
                  value={stats.averageScore}
                  size={100}
                  color="auto"
                  label="Average"
                />
              </div>
            </div>
          </Card>
        </div>

        {/* Level/XP Card */}
        <Card className="bg-gradient-to-br from-purple-100 via-white to-indigo-100 border-2 border-purple-200">
          <div className="text-center space-y-3">
            <div className="text-4xl">🎮</div>
            <div>
              <p className="text-xs uppercase tracking-wider text-slate-500 font-bold">Your Level</p>
              <p className="text-4xl font-bold text-purple-600">
                Level {Math.floor(stats.completed / 3) + 1}
              </p>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-purple-500 to-indigo-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${((stats.completed % 3) / 3) * 100}%` }}
              />
            </div>
            <p className="text-xs text-slate-500">
              {3 - (stats.completed % 3)} more assessments to level up!
            </p>
          </div>
        </Card>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="animate-scale-in animate-delay-100">
          <StatCard
            title="Available"
            value={stats.available}
            icon="📝"
            accent="blue"
            subtitle="Assessments to take"
          />
        </div>
        <div className="animate-scale-in animate-delay-200">
          <StatCard
            title="Completed"
            value={stats.completed}
            icon="✓"
            accent="emerald"
            subtitle="Assessments done"
          />
        </div>
        <div className="animate-scale-in animate-delay-300">
          <StatCard
            title="Average Score"
            value={`${stats.averageScore}%`}
            icon="📊"
            accent="indigo"
            subtitle="Overall performance"
          />
        </div>
        <div className="animate-scale-in animate-delay-400">
          <StatCard
            title="Best Score"
            value={`${stats.bestScore}%`}
            icon="⭐"
            accent="amber"
            subtitle="Personal record"
          />
        </div>
      </div>

      {/* AI Learning Insights */}
      <StudentAIInsights
        results={recentResults.length > 0 ? recentResults : []}
        studentName={user.name}
      />

      {/* Comparison with Class Section */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Comparison</p>
            <h3 className="text-lg font-bold text-slate-800">You vs Class Average</h3>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-indigo-500" />
              <span className="text-slate-600">Your Score</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-slate-300" />
              <span className="text-slate-600">Class Avg</span>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <ComparisonBarChart
              data={subjectComparison}
              height={250}
              currentLabel="Your Score"
              previousLabel="Class Average"
              benchmarkLabel="Target (70%)"
              benchmarkValue={70}
            />
          </div>
          <div className="space-y-4">
            <MetricCard
              title="Your Average"
              value={`${stats.averageScore}%`}
              icon="📊"
              trend={stats.averageScore >= classAverage ? 'up' : 'down'}
              change={stats.averageScore - classAverage}
              comparison={{
                label: 'vs Class Average',
                value: `${classAverage}%`,
                type: 'vs-average'
              }}
              sparkline={sparklines.average}
              color={stats.averageScore >= 70 ? 'emerald' : stats.averageScore >= 50 ? 'amber' : 'red'}
            />
            <MetricCard
              title="Ranking"
              value={stats.averageScore >= classAverage ? 'Above Avg' : 'Below Avg'}
              icon={stats.averageScore >= classAverage ? '🏆' : '📈'}
              subtitle={`${Math.abs(stats.averageScore - classAverage)}% ${stats.averageScore >= classAverage ? 'above' : 'below'} class`}
              color={stats.averageScore >= classAverage ? 'emerald' : 'amber'}
            />
          </div>
        </div>
      </Card>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Progress Over Time */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Performance</p>
              <h3 className="text-lg font-bold text-slate-800">Your Progress</h3>
            </div>
            <Button variant="ghost" size="sm" onClick={() => router.push('/dashboard/student/results')}>
              View All
            </Button>
          </div>
          <LineChart data={lineChartData} />
        </Card>

        {/* Subject Skills Radar */}
        <Card>
          <div className="mb-4">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Skills</p>
            <h3 className="text-lg font-bold text-slate-800">Subject Strengths</h3>
          </div>
          <RadarChart data={radarChartData} height={280} />
        </Card>
      </div>

      {/* Weekly Trend with Subject Breakdown */}
      <Card>
        <div className="mb-4">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Trends</p>
          <h3 className="text-lg font-bold text-slate-800">Weekly Performance by Subject</h3>
        </div>
        <MultiLineChart
          data={weeklyTrendData.map(w => ({
            name: w.week,
            Mathematics: w.subjects.Mathematics,
            English: w.subjects.English,
            Urdu: w.subjects.Urdu,
            Average: w.average
          }))}
          lines={[
            { dataKey: 'Mathematics', name: 'Mathematics', color: '#6366f1' },
            { dataKey: 'English', name: 'English', color: '#10b981' },
            { dataKey: 'Urdu', name: 'Urdu', color: '#f59e0b' },
            { dataKey: 'Average', name: 'Overall Avg', color: '#64748b', strokeDasharray: '5 5' }
          ]}
          height={280}
          showTarget={true}
          targetValue={70}
          targetLabel="Target"
        />
      </Card>

      {/* Subject Insights - Detailed Breakdown */}
      <Card>
        <div className="mb-6">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Analysis</p>
          <h3 className="text-lg font-bold text-slate-800">Subject Deep Dive</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {['Mathematics', 'English', 'Urdu'].map(subject => {
            const insight = subjectInsights[subject] || {};
            const icon = subject === 'Mathematics' ? '🔢' : subject === 'English' ? '📖' : '📝';
            const color = insight.average >= 80 ? 'emerald' : insight.average >= 60 ? 'amber' : 'red';
            const trendIcon = insight.trend === 'improving' ? '📈' : insight.trend === 'declining' ? '📉' : '➡️';

            return (
              <div key={subject} className={`p-4 rounded-xl border-2 ${
                color === 'emerald' ? 'bg-emerald-50 border-emerald-200' :
                color === 'amber' ? 'bg-amber-50 border-amber-200' :
                'bg-red-50 border-red-200'
              }`}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{icon}</span>
                    <h4 className="font-bold text-slate-800">{subject}</h4>
                  </div>
                  <span className="text-lg">{trendIcon}</span>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-slate-500">Average</span>
                    <span className={`text-xl font-bold ${
                      color === 'emerald' ? 'text-emerald-600' :
                      color === 'amber' ? 'text-amber-600' : 'text-red-600'
                    }`}>
                      {insight.average || 0}%
                    </span>
                  </div>

                  <div className="h-2 bg-white rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        color === 'emerald' ? 'bg-emerald-500' :
                        color === 'amber' ? 'bg-amber-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${insight.average || 0}%` }}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-white rounded-lg p-2 text-center">
                      <p className="font-bold text-slate-700">{insight.highestScore || 0}%</p>
                      <p className="text-slate-500">Best</p>
                    </div>
                    <div className="bg-white rounded-lg p-2 text-center">
                      <p className="font-bold text-slate-700">{insight.totalAttempts || 0}</p>
                      <p className="text-slate-500">Attempts</p>
                    </div>
                  </div>

                  <div className="text-xs">
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full ${
                      insight.passRate >= 70 ? 'bg-emerald-100 text-emerald-700' :
                      insight.passRate >= 50 ? 'bg-amber-100 text-amber-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {insight.passRate || 0}% pass rate
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Study Recommendations */}
      <Card className="bg-gradient-to-br from-indigo-50 via-white to-purple-50 border-2 border-indigo-100">
        <div className="flex items-start gap-4">
          <div className="text-4xl">💡</div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-slate-800 mb-2">Study Recommendations</h3>
            <div className="space-y-3">
              {Object.entries(subjectInsights)
                .filter(([_, insight]: [string, any]) => insight.average < 70)
                .slice(0, 2)
                .map(([subject, insight]: [string, any]) => (
                  <div key={subject} className="flex items-center gap-3 p-3 bg-white rounded-xl border border-slate-200">
                    <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 text-lg">
                      {subject === 'Mathematics' ? '🔢' : subject === 'English' ? '📖' : '📝'}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-800">Focus on {subject}</p>
                      <p className="text-sm text-slate-500">
                        Your score is {70 - (insight.average || 0)}% below target. Practice more to improve!
                      </p>
                    </div>
                  </div>
                ))}
              {Object.values(subjectInsights).every((insight: any) => insight.average >= 70) && (
                <div className="flex items-center gap-3 p-3 bg-emerald-50 rounded-xl border border-emerald-200">
                  <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 text-lg">
                    🌟
                  </div>
                  <div>
                    <p className="font-semibold text-emerald-700">Great job!</p>
                    <p className="text-sm text-emerald-600">
                      You're meeting targets in all subjects. Keep up the excellent work!
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* Achievements Section */}
      <Card>
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Gamification</p>
            <h3 className="text-xl font-bold text-slate-800">Your Achievements</h3>
          </div>
          <div className="text-sm text-slate-500">
            {earnedAchievements.length} / {achievements.length} earned
          </div>
        </div>

        {/* Earned Achievements */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {earnedAchievements.map(achievement => (
            <div
              key={achievement.id}
              className="bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-200 rounded-xl p-4 text-center transform hover:scale-105 transition-transform"
            >
              <div className="text-3xl mb-2">{achievement.icon}</div>
              <p className="font-bold text-slate-800 text-sm">{achievement.name}</p>
              <p className="text-xs text-slate-500">{achievement.description}</p>
            </div>
          ))}
        </div>

        {/* In Progress Achievements */}
        {inProgressAchievements.length > 0 && (
          <>
            <p className="text-sm font-semibold text-slate-600 mb-3">In Progress</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {inProgressAchievements.slice(0, 4).map(achievement => (
                <div
                  key={achievement.id}
                  className="flex items-center gap-4 bg-slate-50 rounded-xl p-3 border border-slate-200"
                >
                  <div className="text-2xl opacity-50">{achievement.icon}</div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-700 text-sm">{achievement.name}</p>
                    <p className="text-xs text-slate-500 truncate">{achievement.description}</p>
                    <div className="mt-2 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-purple-500 rounded-full transition-all duration-500"
                        style={{ width: `${((achievement.progress || 0) / (achievement.maxProgress || 1)) * 100}%` }}
                      />
                    </div>
                    <p className="text-xs text-slate-400 mt-1">
                      {achievement.progress} / {achievement.maxProgress}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </Card>

      {/* Activity Calendar */}
      <Card>
        <div className="mb-4">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Activity</p>
          <h3 className="text-lg font-bold text-slate-800">Your Learning Activity</h3>
        </div>
        <ActivityCalendar data={activityData} weeks={12} />
      </Card>

      {/* Two Column Layout: Recent Results & Available Assessments */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Results */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">History</p>
              <h3 className="text-lg font-bold text-slate-800">Recent Results</h3>
            </div>
            <Button variant="ghost" size="sm" onClick={() => router.push('/dashboard/student/results')}>
              View All
            </Button>
          </div>

          {recentResults.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              <div className="text-4xl mb-2">📋</div>
              <p>No results yet. Complete an assessment to see your progress!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentResults.map((result) => (
                <div
                  key={result.id}
                  className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100"
                >
                  <div className="flex items-center gap-3">
                    <div className="text-xl">
                      {result.subject === 'Mathematics' ? '🔢' :
                       result.subject === 'English' ? '📖' : '📝'}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-800 text-sm">{result.subject}</p>
                      <p className="text-xs text-slate-500">{formatDate(result.completedAt)}</p>
                    </div>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-sm font-bold ${
                    result.percentage >= 80
                      ? 'bg-emerald-100 text-emerald-700'
                      : result.percentage >= 60
                        ? 'bg-amber-100 text-amber-700'
                        : 'bg-red-100 text-red-700'
                  }`}>
                    {result.percentage}%
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Available Assessments */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Assignments</p>
              <h3 className="text-lg font-bold text-slate-800">Available Assessments</h3>
            </div>
          </div>

          {assessments.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-6xl mb-3">📚</div>
              <h3 className="text-lg font-bold text-slate-800">No assessments available</h3>
              <p className="text-slate-600 text-sm">Check back later for new assessments from your teacher.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {assessments.slice(0, 4).map((assessment) => {
                const inProgress = hasInProgressAttempt(assessment.id);
                return (
                  <div
                    key={assessment.id}
                    className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100 hover:border-purple-300 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="text-xl">
                        {assessment.subject === 'Mathematics' ? '🔢' :
                         assessment.subject === 'English' ? '📖' : '📝'}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-800 text-sm line-clamp-1">{assessment.title}</p>
                        <p className="text-xs text-slate-500">
                          {assessment.questions.length} questions • {assessment.duration} min
                        </p>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant={inProgress ? 'secondary' : 'primary'}
                      onClick={() => handleStartAssessment(assessment.id)}
                    >
                      {inProgress ? 'Resume' : 'Start'}
                    </Button>
                  </div>
                );
              })}

              {assessments.length > 4 && (
                <Button
                  variant="ghost"
                  className="w-full"
                  onClick={() => router.push('/dashboard/student/assessments')}
                >
                  View all {assessments.length} assessments
                </Button>
              )}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
