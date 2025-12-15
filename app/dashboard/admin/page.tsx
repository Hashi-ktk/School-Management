'use client';

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import StatCard from "@/components/ui/StatCard";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import DateRangePicker from "@/components/ui/DateRangePicker";
import LineChart from "@/components/charts/LineChart";
import BarChart from "@/components/charts/BarChart";
import DonutChart from "@/components/charts/DonutChart";
import AreaChart from "@/components/charts/AreaChart";
import ProgressRing from "@/components/charts/ProgressRing";
import MultiLineChart from "@/components/charts/MultiLineChart";
import RankingTable from "@/components/charts/RankingTable";
import HeatMapChart from "@/components/charts/HeatMapChart";
import MetricCard from "@/components/charts/MetricCard";
import DistributionChart from "@/components/charts/DistributionChart";
import { useAuth } from "@/hooks/useAuth";
import { getStats, getResults, formatDate } from "@/lib/utils";
import {
  filterResultsByDateRange,
  transformToLineChartData,
  transformToBarChartData,
  transformToPerformanceTierData,
  transformToAreaChartData,
  calculateImprovementTrend,
  type DateRange
} from "@/lib/filterUtils";
import {
  generateStudentRanking,
  generateScoreDistribution,
  generateSubjectGradeHeatmap,
  generateWeeklyTrend,
  generateComparisonMetrics,
  generateSparklineData,
  calculateSubjectInsights
} from "@/lib/analyticsUtils";
import type { DashboardStats, AssessmentResult } from "@/types";

export default function AdminDashboard() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentResults, setRecentResults] = useState<AssessmentResult[]>([]);
  const [dateRange, setDateRange] = useState<DateRange>('all');
  const [lineChartData, setLineChartData] = useState<any[]>([]);
  const [barChartData, setBarChartData] = useState<any[]>([]);
  const [tierData, setTierData] = useState<any[]>([]);
  const [areaChartData, setAreaChartData] = useState<any[]>([]);
  const [improvementTrend, setImprovementTrend] = useState<{ trend: string; percentage: number }>({ trend: 'stable', percentage: 0 });
  const [studentRanking, setStudentRanking] = useState<any[]>([]);
  const [scoreDistribution, setScoreDistribution] = useState<any[]>([]);
  const [heatmapData, setHeatmapData] = useState<{ data: any[]; xLabels: string[]; yLabels: string[] }>({ data: [], xLabels: [], yLabels: [] });
  const [weeklyTrendData, setWeeklyTrendData] = useState<any[]>([]);
  const [comparisonMetrics, setComparisonMetrics] = useState<any>(null);
  const [sparklines, setSparklines] = useState<Record<string, number[]>>({});
  const [subjectInsights, setSubjectInsights] = useState<Record<string, any>>({});

  useEffect(() => {
    if (isLoading || !user) return;
    setStats(getStats());
    const allResults = getResults();
    const filteredResults = filterResultsByDateRange(allResults, dateRange);
    setRecentResults(filteredResults.slice(0, 6));

    // Transform data for charts
    const lineData = transformToLineChartData(filteredResults);
    const barData = transformToBarChartData(filteredResults);
    const tierChartData = transformToPerformanceTierData(filteredResults);
    const areaData = transformToAreaChartData(allResults);
    const trend = calculateImprovementTrend(filteredResults);

    // Generate granular analytics
    const ranking = generateStudentRanking(filteredResults);
    const distribution = generateScoreDistribution(filteredResults);
    const heatmap = generateSubjectGradeHeatmap(filteredResults);
    const weeklyData = generateWeeklyTrend(filteredResults, 8);

    // Generate comparison metrics (current week vs previous week)
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

    const currentWeekResults = filteredResults.filter(r => new Date(r.completedAt) >= weekAgo);
    const previousWeekResults = filteredResults.filter(r => {
      const date = new Date(r.completedAt);
      return date >= twoWeeksAgo && date < weekAgo;
    });
    const comparison = generateComparisonMetrics(currentWeekResults, previousWeekResults);

    // Generate sparklines
    const sparks = {
      average: generateSparklineData(filteredResults, 'average', 7),
      count: generateSparklineData(filteredResults, 'count', 7),
      passRate: generateSparklineData(filteredResults, 'passRate', 7)
    };

    // Calculate subject insights
    const insights: Record<string, any> = {};
    ['Mathematics', 'English', 'Urdu'].forEach(subject => {
      insights[subject] = calculateSubjectInsights(filteredResults, subject);
    });

    setLineChartData(lineData);
    setBarChartData(barData);
    setTierData(tierChartData);
    setAreaChartData(areaData);
    setImprovementTrend(trend);
    setStudentRanking(ranking);
    setScoreDistribution(distribution);
    setHeatmapData(heatmap);
    setWeeklyTrendData(weeklyData);
    setComparisonMetrics(comparison);
    setSparklines(sparks);
    setSubjectInsights(insights);
  }, [isLoading, user, dateRange]);

  if (isLoading || !user || !stats) {
    return <div className="min-h-[50vh] grid place-content-center text-slate-600">Loading…</div>;
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
    <div className="max-w-7xl mx-auto space-y-10">
      {/* Hero Section */}
      <Card className="bg-gradient-to-br from-indigo-100 via-white to-purple-100 border-2 border-indigo-200 shadow-lg animate-fade-in relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
          <div className="space-y-4 max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-wider text-indigo-600 animate-slide-in-left">
              Admin dashboard
            </p>
            <h1 className="text-4xl md:text-5xl font-bold leading-tight text-slate-800 animate-slide-in-left animate-delay-100">
              System-wide insights, beautifully organized.
            </h1>
            <p className="text-lg text-slate-600 animate-slide-in-left animate-delay-200">
              Monitor students, assessments, analytics, and observations with a premium, breathable layout
              designed for clarity.
            </p>
            <div className={`inline-flex items-center gap-2 ${getTrendColor()} text-sm font-medium bg-white/50 px-3 py-1 rounded-full`}>
              {getTrendIcon()} System {improvementTrend.trend === 'stable' ? 'performance steady' :
                improvementTrend.trend === 'improving' ? `trending up ${improvementTrend.percentage}%` :
                `trending down ${improvementTrend.percentage}%`}
            </div>
            <div className="flex flex-wrap gap-3 pt-2">
              <Button onClick={() => router.push("/dashboard/admin/analytics")}>
                View Analytics
              </Button>
              <Button variant="secondary" onClick={() => router.push("/dashboard/admin/students")}>
                Manage Students
              </Button>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 w-full lg:w-auto lg:min-w-[340px]">
            <Highlight label="Students" value={stats.totalStudents} />
            <Highlight label="Assessments" value={stats.totalAssessments} />
          </div>
        </div>
      </Card>

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        <StatCard title="Total Students" value={stats.totalStudents} subtitle="Across all schools" accent="indigo" icon="👥" />
        <StatCard title="Total Assessments" value={stats.totalAssessments} subtitle="Available" accent="blue" icon="📝" />
        <StatCard title="Average Score" value={`${stats.averageScore}%`} subtitle="System-wide" accent="emerald" icon="⭐" />
        <StatCard title="Completion Rate" value={`${stats.completionRate}%`} subtitle="Overall" accent="amber" icon="✅" />
      </div>

      {/* Week over Week Comparison */}
      {comparisonMetrics && (
        <Card>
          <div className="mb-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Comparison</p>
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
              title="Active Students"
              value={stats.totalStudents}
              subtitle="System-wide"
              icon="👥"
              color="blue"
              size="sm"
            />
          </div>
        </Card>
      )}

      {/* Charts Row - Performance & Subject */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Performance Trends */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Trends</p>
              <h3 className="text-lg font-bold text-slate-800">Performance Over Time</h3>
            </div>
          </div>
          <LineChart data={lineChartData} />
        </Card>

        {/* Subject Comparison */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Comparison</p>
              <h3 className="text-lg font-bold text-slate-800">Subject Performance</h3>
            </div>
          </div>
          <BarChart data={barChartData} />
        </Card>
      </div>

      {/* Distribution & Quick Stats Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Performance Tier Distribution */}
        <Card>
          <div className="mb-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Distribution</p>
            <h3 className="text-lg font-bold text-slate-800">Performance Tiers</h3>
          </div>
          <DonutChart
            data={tierData}
            centerValue={stats.totalStudents}
            centerLabel="Students"
            height={220}
          />
        </Card>

        {/* Subject Trends Over Time */}
        <Card>
          <div className="mb-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">History</p>
            <h3 className="text-lg font-bold text-slate-800">Subject Trends</h3>
          </div>
          <AreaChart
            data={areaChartData}
            areas={[
              { dataKey: 'Mathematics', color: '#3b82f6', name: 'Math' },
              { dataKey: 'English', color: '#06b6d4', name: 'English' },
              { dataKey: 'Urdu', color: '#10b981', name: 'Urdu' }
            ]}
            height={220}
            stacked={false}
          />
        </Card>

        {/* Quick Overview Rings */}
        <Card>
          <div className="mb-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Overview</p>
            <h3 className="text-lg font-bold text-slate-800">Key Metrics</h3>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-xl p-4 flex flex-col items-center">
              <ProgressRing value={stats.averageScore} size={70} color="#6366f1" />
              <p className="text-xs text-slate-600 mt-2 font-medium">Avg Score</p>
            </div>
            <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl p-4 flex flex-col items-center">
              <ProgressRing value={stats.completionRate} size={70} color="#10b981" />
              <p className="text-xs text-slate-600 mt-2 font-medium">Completion</p>
            </div>
            <div className="bg-gradient-to-br from-cyan-50 to-cyan-100 rounded-xl p-4 text-center col-span-2">
              <div className="flex justify-around">
                <div>
                  <p className="text-2xl font-bold text-cyan-600">{stats.totalStudents}</p>
                  <p className="text-xs text-slate-600">Students</p>
                </div>
                <div className="w-px bg-slate-200" />
                <div>
                  <p className="text-2xl font-bold text-cyan-600">{stats.totalAssessments}</p>
                  <p className="text-xs text-slate-600">Assessments</p>
                </div>
                <div className="w-px bg-slate-200" />
                <div>
                  <p className="text-2xl font-bold text-cyan-600">{recentResults.length}</p>
                  <p className="text-xs text-slate-600">Results</p>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Weekly Trend with Subject Breakdown */}
      <Card>
        <div className="mb-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Weekly Trends</p>
          <h3 className="text-lg font-bold text-slate-800">Performance by Subject Over Time</h3>
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

      {/* Student Rankings & Score Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <RankingTable
            data={studentRanking}
            title="Top Performing Students"
            valueLabel="Average"
            maxItems={8}
            highlightTop={3}
          />
        </Card>

        <Card>
          <div className="mb-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Distribution</p>
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
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Performance Matrix</p>
          <h3 className="text-lg font-bold text-slate-800">Subject Performance by Grade</h3>
          <p className="text-sm text-slate-500">Identify areas needing attention across grades and subjects</p>
        </div>
        <HeatMapChart
          data={heatmapData.data}
          xLabels={heatmapData.xLabels}
          yLabels={heatmapData.yLabels}
          showValues={true}
        />
      </Card>

      {/* Subject Deep Dive */}
      <Card>
        <div className="mb-6">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Subject Analysis</p>
          <h3 className="text-lg font-bold text-slate-800">Detailed Subject Performance</h3>
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

                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div className="bg-white rounded-lg p-2 text-center">
                      <p className="font-bold text-slate-700">{insight.passRate || 0}%</p>
                      <p className="text-slate-500">Pass Rate</p>
                    </div>
                    <div className="bg-white rounded-lg p-2 text-center">
                      <p className="font-bold text-slate-700">{insight.uniqueStudents || 0}</p>
                      <p className="text-slate-500">Students</p>
                    </div>
                    <div className="bg-white rounded-lg p-2 text-center">
                      <p className="font-bold text-slate-700">{insight.totalAttempts || 0}</p>
                      <p className="text-slate-500">Attempts</p>
                    </div>
                  </div>

                  {insight.needsAttention?.length > 0 && (
                    <div className="text-xs bg-white rounded-lg p-2">
                      <p className="text-slate-500 mb-1">Needs attention:</p>
                      <p className="font-medium text-slate-700 truncate">
                        {insight.needsAttention.slice(0, 2).map((s: any) => s.name).join(', ')}
                        {insight.needsAttention.length > 2 && ` +${insight.needsAttention.length - 2} more`}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <QuickActionCard
          icon="📊"
          title="Analytics"
          description="Deep dive into data"
          onClick={() => router.push('/dashboard/admin/analytics')}
        />
        <QuickActionCard
          icon="👥"
          title="Students"
          description="Manage all students"
          onClick={() => router.push('/dashboard/admin/students')}
        />
        <QuickActionCard
          icon="📝"
          title="Assessments"
          description="View all assessments"
          onClick={() => router.push('/dashboard/admin/assessments')}
        />
        <QuickActionCard
          icon="📋"
          title="Reports"
          description="Generate reports"
          onClick={() => router.push('/dashboard/admin/reports')}
        />
      </div>

      {/* Recent Results */}
      <Card>
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Latest</p>
            <h3 className="text-xl font-bold text-slate-800">Recent assessment results</h3>
            <p className="text-sm text-slate-600">Cross-school activity</p>
          </div>
          <DateRangePicker value={dateRange} onChange={setDateRange} />
        </div>

        <div className="divide-y divide-slate-100">
          {recentResults.map((result) => (
            <div key={result.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-4">
              <div className="flex items-center gap-4">
                <div className="h-11 w-11 rounded-full bg-gradient-to-br from-purple-500 to-orange-400 text-white grid place-content-center font-semibold shadow-md">
                  {result.studentName.slice(0, 1)}
                </div>
                <div>
                  <p className="font-bold text-slate-800">{result.studentName}</p>
                  <p className="text-sm text-slate-600">
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
                        ? "bg-amber-100 text-amber-700 border-2 border-amber-300"
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

        <div className="mt-4 pt-4 border-t border-slate-100">
          <Button variant="ghost" className="w-full" onClick={() => router.push('/dashboard/admin/analytics')}>
            View all results in Analytics
          </Button>
        </div>
      </Card>
    </div>
  );
}

function Highlight({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl bg-white border-2 border-indigo-200 p-4 shadow-md">
      <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">{label}</p>
      <p className="text-4xl font-bold text-indigo-600">
        {value}
      </p>
      <p className="text-sm text-slate-600">System total</p>
    </div>
  );
}

function QuickActionCard({
  icon,
  title,
  description,
  onClick
}: {
  icon: string;
  title: string;
  description: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="w-full rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:-translate-y-1 hover:shadow-md hover:border-indigo-300 group"
    >
      <div className="text-2xl mb-2 group-hover:scale-110 transition-transform">{icon}</div>
      <p className="font-bold text-slate-800">{title}</p>
      <p className="text-xs text-slate-500">{description}</p>
    </button>
  );
}
