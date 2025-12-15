'use client';

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import StatCard from "@/components/ui/StatCard";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import LineChart from "@/components/charts/LineChart";
import BarChart from "@/components/charts/BarChart";
import DonutChart from "@/components/charts/DonutChart";
import ProgressRing from "@/components/charts/ProgressRing";
import MultiLineChart from "@/components/charts/MultiLineChart";
import RankingTable from "@/components/charts/RankingTable";
import DistributionChart from "@/components/charts/DistributionChart";
import HeatMapChart from "@/components/charts/HeatMapChart";
import MetricCard from "@/components/charts/MetricCard";
import { useAuth } from "@/hooks/useAuth";
import { getStats, getResults, formatDate } from "@/lib/utils";
import { getAtRiskStudents, getPerformanceDistribution } from "@/lib/teacherAnalytics";
import { generateTaskReminders } from "@/lib/notifications";
import {
  transformToLineChartData,
  transformToBarChartData,
  transformToPerformanceTierData,
  calculateImprovementTrend
} from "@/lib/filterUtils";
import {
  generateStudentRanking,
  generateScoreDistribution,
  generateSubjectGradeHeatmap,
  generateWeeklyTrend,
  generateAtRiskDetails,
  generateComparisonMetrics,
  generateSparklineData
} from "@/lib/analyticsUtils";
import AtRiskAlert from "@/components/teacher/AtRiskAlert";
import PerformanceDistributionChart from "@/components/teacher/PerformanceDistributionChart";
import TaskReminders from "@/components/teacher/TaskReminders";
import type { DashboardStats, AssessmentResult, StudentAnalytics, PerformanceDistribution, TaskReminder } from "@/types";

export default function TeacherDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentResults, setRecentResults] = useState<AssessmentResult[]>([]);
  const [atRiskStudents, setAtRiskStudents] = useState<StudentAnalytics[]>([]);
  const [distribution, setDistribution] = useState<PerformanceDistribution[]>([]);
  const [tasks, setTasks] = useState<TaskReminder[]>([]);
  const [lineChartData, setLineChartData] = useState<any[]>([]);
  const [barChartData, setBarChartData] = useState<any[]>([]);
  const [tierData, setTierData] = useState<any[]>([]);
  const [improvementTrend, setImprovementTrend] = useState<{ trend: string; percentage: number }>({ trend: 'stable', percentage: 0 });
  const [studentRanking, setStudentRanking] = useState<any[]>([]);
  const [scoreDistribution, setScoreDistribution] = useState<any[]>([]);
  const [heatmapData, setHeatmapData] = useState<{ data: any[]; xLabels: string[]; yLabels: string[] }>({ data: [], xLabels: [], yLabels: [] });
  const [weeklyTrendData, setWeeklyTrendData] = useState<any[]>([]);
  const [atRiskDetails, setAtRiskDetails] = useState<any[]>([]);
  const [comparisonMetrics, setComparisonMetrics] = useState<any>(null);
  const [sparklines, setSparklines] = useState<Record<string, number[]>>({});
  const { user, isLoading, role } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading || !user || role !== "teacher") return;

    const allResults = getResults();
    setStats(getStats());
    setRecentResults(allResults.slice(0, 6));
    setAtRiskStudents(getAtRiskStudents(user.id));
    setDistribution(getPerformanceDistribution(user.id));
    setTasks(generateTaskReminders(user.id));

    // Transform data for charts
    const lineData = transformToLineChartData(allResults);
    const barData = transformToBarChartData(allResults);
    const tierChartData = transformToPerformanceTierData(allResults);
    const trend = calculateImprovementTrend(allResults);

    // Generate granular analytics
    const ranking = generateStudentRanking(allResults);
    const distribution = generateScoreDistribution(allResults);
    const heatmap = generateSubjectGradeHeatmap(allResults);
    const weeklyData = generateWeeklyTrend(allResults, 8);
    const atRiskData = generateAtRiskDetails(allResults);

    // Generate comparison metrics (current week vs previous week)
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

    const currentWeekResults = allResults.filter(r => new Date(r.completedAt) >= weekAgo);
    const previousWeekResults = allResults.filter(r => {
      const date = new Date(r.completedAt);
      return date >= twoWeeksAgo && date < weekAgo;
    });
    const comparison = generateComparisonMetrics(currentWeekResults, previousWeekResults);

    // Generate sparklines
    const sparks = {
      average: generateSparklineData(allResults, 'average', 7),
      count: generateSparklineData(allResults, 'count', 7),
      passRate: generateSparklineData(allResults, 'passRate', 7)
    };

    setLineChartData(lineData);
    setBarChartData(barData);
    setTierData(tierChartData);
    setImprovementTrend(trend);
    setStudentRanking(ranking);
    setScoreDistribution(distribution);
    setHeatmapData(heatmap);
    setWeeklyTrendData(weeklyData);
    setAtRiskDetails(atRiskData);
    setComparisonMetrics(comparison);
    setSparklines(sparks);
  }, [isLoading, user, role]);

  if (isLoading || !user || role !== "teacher" || !stats) {
    return (
      <div className="min-h-[60vh] grid place-content-center text-slate-600">Loading your dashboard…</div>
    );
  }

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

  return (
    <div className="max-w-7xl mx-auto space-y-10 px-4 md:px-0 py-4">
      {/* Hero Section */}
      <Card className="bg-gradient-to-br from-purple-100 via-white to-orange-100 border-2 border-purple-200 shadow-lg animate-fade-in relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
          <div className="space-y-4 max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-wider text-purple-600 animate-slide-in-left">Teacher dashboard</p>
            <h1 className="text-4xl md:text-5xl font-bold leading-tight text-slate-800 animate-slide-in-left animate-delay-100">
              Welcome back. Your class overview at a glance.
            </h1>
            <p className="text-lg text-slate-600 animate-slide-in-left animate-delay-200">Monitor progress, completion, and the latest results with a clean, friendly layout built for focus.</p>
            <div className="flex items-center gap-4 flex-wrap">
              <div className={`inline-flex items-center gap-2 ${getTrendColor()} text-sm font-medium bg-white/50 px-3 py-1 rounded-full`}>
                {getTrendIcon()} Class {improvementTrend.trend === 'stable' ? 'performance steady' :
                  improvementTrend.trend === 'improving' ? `up ${improvementTrend.percentage}%` :
                  `down ${improvementTrend.percentage}%`}
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button size="lg" onClick={() => router.push("/dashboard/teacher/assessments")}>
                Create assessment
              </Button>
              <Button
                variant="secondary"
                size="lg"
                onClick={() => router.push("/dashboard/teacher/students")}
              >
                View students
              </Button>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 w-full lg:w-auto lg:min-w-[340px]">
             <div className="rounded-2xl bg-white border-2 border-purple-200 p-4 shadow-md">
               <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Class average</p>
              <p className="text-4xl font-bold text-purple-600">{stats.averageScore}%</p>
               <p className="text-sm text-slate-600">Recent assessments</p>
            </div>
            <div className="rounded-2xl bg-white border-2 border-emerald-200 p-4 shadow-md">
               <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Completion</p>
              <p className="text-4xl font-bold text-emerald-600">{stats.completionRate}%</p>
               <p className="text-sm text-slate-600">Finished attempts</p>
            </div>
          </div>
        </div>
      </Card>

      {atRiskStudents.length > 0 && <AtRiskAlert students={atRiskStudents} />}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <div className="animate-scale-in animate-delay-100">
          <StatCard
            title="Total Students"
            value={stats.totalStudents}
            subtitle="Active in your classes"
            accent="indigo"
            icon="👥"
          />
        </div>
        <div className="animate-scale-in animate-delay-200">
          <StatCard
            title="Assessments"
            value={stats.totalAssessments}
            subtitle="Ready to assign"
            accent="blue"
            icon="📝"
          />
        </div>
        <div className="animate-scale-in animate-delay-300">
          <StatCard
            title="Average Score"
            value={`${stats.averageScore}%`}
            subtitle="Last 30 days"
            accent="emerald"
            icon="📈"
          />
        </div>
        <div className="animate-scale-in animate-delay-400">
          <StatCard
            title="Completion Rate"
            value={`${stats.completionRate}%`}
            subtitle="All time"
            accent="amber"
            icon="✅"
          />
        </div>
      </div>

      {/* Weekly Comparison Metrics */}
      {comparisonMetrics && (
        <Card>
          <div className="mb-4">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Week over Week</p>
            <h3 className="text-lg font-bold text-slate-800">This Week vs Last Week</h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <MetricCard
              title="Avg Score"
              value={`${comparisonMetrics.averageScore.current}%`}
              change={comparisonMetrics.averageScore.change}
              trend={comparisonMetrics.averageScore.change > 0 ? 'up' : comparisonMetrics.averageScore.change < 0 ? 'down' : 'neutral'}
              comparison={{ label: 'Last week', value: `${comparisonMetrics.averageScore.previous}%`, type: 'vs-previous' }}
              sparkline={sparklines.average}
              color={comparisonMetrics.averageScore.current >= 70 ? 'emerald' : 'amber'}
              size="sm"
            />
            <MetricCard
              title="Pass Rate"
              value={`${comparisonMetrics.passRate.current}%`}
              change={comparisonMetrics.passRate.change}
              trend={comparisonMetrics.passRate.change > 0 ? 'up' : comparisonMetrics.passRate.change < 0 ? 'down' : 'neutral'}
              comparison={{ label: 'Last week', value: `${comparisonMetrics.passRate.previous}%`, type: 'vs-previous' }}
              sparkline={sparklines.passRate}
              color={comparisonMetrics.passRate.current >= 70 ? 'emerald' : 'amber'}
              size="sm"
            />
            <MetricCard
              title="Completed"
              value={comparisonMetrics.totalAssessments.current}
              change={comparisonMetrics.totalAssessments.change}
              trend={comparisonMetrics.totalAssessments.change > 0 ? 'up' : comparisonMetrics.totalAssessments.change < 0 ? 'down' : 'neutral'}
              comparison={{ label: 'Last week', value: comparisonMetrics.totalAssessments.previous, type: 'vs-previous' }}
              sparkline={sparklines.count}
              color="indigo"
              size="sm"
            />
            <MetricCard
              title="At-Risk"
              value={atRiskDetails.filter(s => s.riskLevel === 'high').length}
              subtitle={`${atRiskDetails.filter(s => s.riskLevel === 'medium').length} medium risk`}
              icon="⚠️"
              color={atRiskDetails.filter(s => s.riskLevel === 'high').length > 0 ? 'red' : 'emerald'}
              size="sm"
            />
          </div>
        </Card>
      )}

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Performance Trends */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Trends</p>
              <h3 className="text-lg font-bold text-slate-800">Class Performance Over Time</h3>
            </div>
          </div>
          <LineChart data={lineChartData} />
        </Card>

        {/* Subject Comparison */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Comparison</p>
              <h3 className="text-lg font-bold text-slate-800">Subject Performance</h3>
            </div>
          </div>
          <BarChart data={barChartData} />
        </Card>
      </div>

      {/* Weekly Trend with Subject Breakdown */}
      <Card>
        <div className="mb-4">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Deep Dive</p>
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
            { dataKey: 'Average', name: 'Class Avg', color: '#64748b', strokeDasharray: '5 5' }
          ]}
          height={280}
          showTarget={true}
          targetValue={70}
          targetLabel="Target"
        />
      </Card>

      {/* Student Ranking & Score Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <RankingTable
            data={studentRanking}
            title="Student Rankings"
            valueLabel="Average"
            maxItems={8}
            highlightTop={3}
          />
        </Card>

        <Card>
          <div className="mb-4">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Distribution</p>
            <h3 className="text-lg font-bold text-slate-800">Score Distribution</h3>
          </div>
          <DistributionChart
            data={scoreDistribution}
            height={280}
            averageValue={stats?.averageScore}
          />
        </Card>
      </div>

      {/* Subject x Grade Heatmap */}
      <Card>
        <div className="mb-4">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Performance Matrix</p>
          <h3 className="text-lg font-bold text-slate-800">Subject Performance by Grade</h3>
          <p className="text-sm text-slate-500">Identify which subjects need attention in each grade</p>
        </div>
        <HeatMapChart
          data={heatmapData.data}
          xLabels={heatmapData.xLabels}
          yLabels={heatmapData.yLabels}
          showValues={true}
        />
      </Card>

      {/* Detailed At-Risk Students */}
      {atRiskDetails.length > 0 && (
        <Card>
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Intervention Needed</p>
              <h3 className="text-lg font-bold text-slate-800">Students Requiring Attention</h3>
            </div>
            <Button variant="ghost" size="sm" onClick={() => router.push("/dashboard/teacher/students")}>
              View All Students
            </Button>
          </div>
          <div className="space-y-3">
            {atRiskDetails.slice(0, 5).map((student, index) => (
              <div
                key={index}
                className={`p-4 rounded-xl border-2 ${
                  student.riskLevel === 'high'
                    ? 'bg-red-50 border-red-200'
                    : 'bg-amber-50 border-amber-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${
                      student.riskLevel === 'high' ? 'bg-red-500' : 'bg-amber-500'
                    }`}>
                      {student.studentName.charAt(0)}
                    </div>
                    <div>
                      <p className="font-bold text-slate-800">{student.studentName}</p>
                      <p className="text-xs text-slate-500">
                        {student.assessmentCount} assessments · {student.recentTrend === 'declining' ? '📉 Declining' : student.recentTrend === 'improving' ? '📈 Improving' : '➡️ Steady'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-2xl font-bold ${
                      student.averageScore < 40 ? 'text-red-600' : 'text-amber-600'
                    }`}>
                      {student.averageScore}%
                    </p>
                    <p className="text-xs text-slate-500">avg score</p>
                  </div>
                </div>
                {student.weakSubjects.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-slate-200">
                    <p className="text-xs text-slate-500 mb-2">Weak subjects:</p>
                    <div className="flex flex-wrap gap-2">
                      {student.weakSubjects.map((subject: string, i: number) => (
                        <span key={i} className="px-2 py-1 bg-white rounded-full text-xs font-medium text-slate-600 border border-slate-200">
                          {subject}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Performance Distribution & Goal Setting */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Performance Tier Distribution */}
        <Card>
          <div className="mb-4">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Distribution</p>
            <h3 className="text-lg font-bold text-slate-800">Student Performance Tiers</h3>
          </div>
          <DonutChart
            data={tierData}
            centerValue={stats.totalStudents}
            centerLabel="Students"
            height={220}
          />
        </Card>

        {/* Class Goals */}
        <Card>
          <div className="mb-4">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Goals</p>
            <h3 className="text-lg font-bold text-slate-800">Class Targets</h3>
          </div>
          <div className="space-y-6">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-slate-600">Average Score Goal</span>
                <span className="font-bold text-slate-800">{stats.averageScore}% / 80%</span>
              </div>
              <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    stats.averageScore >= 80 ? 'bg-emerald-500' : 'bg-purple-500'
                  }`}
                  style={{ width: `${Math.min((stats.averageScore / 80) * 100, 100)}%` }}
                />
              </div>
              {stats.averageScore >= 80 && (
                <p className="text-xs text-emerald-600 mt-1 font-medium">Goal achieved! 🎉</p>
              )}
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-slate-600">Completion Rate Goal</span>
                <span className="font-bold text-slate-800">{stats.completionRate}% / 90%</span>
              </div>
              <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    stats.completionRate >= 90 ? 'bg-emerald-500' : 'bg-blue-500'
                  }`}
                  style={{ width: `${Math.min((stats.completionRate / 90) * 100, 100)}%` }}
                />
              </div>
              {stats.completionRate >= 90 && (
                <p className="text-xs text-emerald-600 mt-1 font-medium">Goal achieved! 🎉</p>
              )}
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-slate-600">At-Risk Students</span>
                <span className="font-bold text-slate-800">{atRiskStudents.length} students</span>
              </div>
              <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    atRiskStudents.length === 0 ? 'bg-emerald-500' : 'bg-amber-500'
                  }`}
                  style={{ width: `${Math.max(100 - (atRiskStudents.length * 20), 0)}%` }}
                />
              </div>
              {atRiskStudents.length === 0 && (
                <p className="text-xs text-emerald-600 mt-1 font-medium">No at-risk students! 🎉</p>
              )}
            </div>
          </div>
        </Card>

        {/* Quick Stats Grid */}
        <Card>
          <div className="mb-4">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Quick Stats</p>
            <h3 className="text-lg font-bold text-slate-800">At a Glance</h3>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-xl p-4 text-center">
              <ProgressRing value={stats.averageScore} size={70} color="#6366f1" />
              <p className="text-xs text-slate-600 mt-2">Avg Score</p>
            </div>
            <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl p-4 text-center">
              <ProgressRing value={stats.completionRate} size={70} color="#10b981" />
              <p className="text-xs text-slate-600 mt-2">Completion</p>
            </div>
            <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-amber-600">{atRiskStudents.length}</div>
              <p className="text-xs text-slate-600 mt-1">At Risk</p>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-purple-600">{tasks.length}</div>
              <p className="text-xs text-slate-600 mt-1">Pending Tasks</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-[1.6fr_1fr] gap-8">
        <Card>
          <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Latest</p>
              <h3 className="text-xl font-bold text-slate-800">Recent results</h3>
              <p className="text-sm text-slate-600">Student performance highlights</p>
            </div>
            <Button variant="ghost" size="sm" onClick={() => router.push("/dashboard/teacher/results")}>
              View all
            </Button>
          </div>

          <div className="divide-y divide-gray-100">
            {recentResults.map((result) => (
              <div
                key={result.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-4"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <div className="h-11 w-11 rounded-full bg-gradient-to-br from-purple-500 to-orange-400 text-white grid place-content-center font-semibold shadow-md">
                    {result.studentName.slice(0, 1)}
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-slate-800 truncate">{result.studentName}</p>
                     <p className="text-sm text-slate-600 truncate">
                      {result.subject} · Grade {result.grade}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold ${
                      result.percentage >= 80
                        ? "bg-emerald-100 text-emerald-700 border-2 border-emerald-300"
                        : result.percentage >= 60
                          ? "bg-yellow-100 text-yellow-700 border-2 border-yellow-300"
                          : "bg-red-100 text-red-700 border-2 border-red-300"
                    }`}
                  >
                    {result.percentage}%
                  </span>
                  <span className="text-sm text-slate-600">{formatDate(result.completedAt)}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <div className="space-y-6">
          <Card>
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Quick actions</p>
                <h3 className="text-lg font-bold text-slate-800">Move fast</h3>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <ActionButton
                label="Create assessment"
                description="Build a new quiz"
                icon="📝"
                onClick={() => router.push("/dashboard/teacher/assessments")}
              />
              <ActionButton
                label="Assign quickly"
                description="Reuse an assessment"
                icon="🚀"
                onClick={() => router.push("/dashboard/teacher/assessments")}
              />
              <ActionButton
                label="View students"
                description="Roster and grades"
                icon="👥"
                onClick={() => router.push("/dashboard/teacher/students")}
              />
              <ActionButton
                label="All results"
                description="Analytics & exports"
                icon="📊"
                onClick={() => router.push("/dashboard/teacher/results")}
              />
            </div>
          </Card>

          <TaskReminders tasks={tasks} />

          <PerformanceDistributionChart
            distribution={distribution}
            totalStudents={stats.totalStudents}
          />
        </div>
      </div>
    </div>
  );
}

function ActionButton({
  label,
  description,
  icon,
  onClick,
}: {
  label: string;
  description: string;
  icon: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="group w-full rounded-2xl border-2 border-gray-200 bg-white p-4 text-left shadow-sm transition hover:-translate-y-1 hover:shadow-md hover:border-purple-300"
    >
      <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-purple-100 text-lg shadow-sm">
        {icon}
      </div>
      <p className="font-bold text-slate-800">{label}</p>
      <p className="text-xs text-slate-600">{description}</p>
    </button>
  );
}
