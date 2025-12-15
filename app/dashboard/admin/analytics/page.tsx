'use client';

import { useEffect, useState } from "react";
import Card from "@/components/ui/Card";
import StatCard from "@/components/ui/StatCard";
import Button from "@/components/ui/Button";
import DateRangePicker from "@/components/ui/DateRangePicker";
import LineChart from "@/components/charts/LineChart";
import BarChart from "@/components/charts/BarChart";
import DonutChart from "@/components/charts/DonutChart";
import AreaChart from "@/components/charts/AreaChart";
import RadarChart from "@/components/charts/RadarChart";
import ProgressRing from "@/components/charts/ProgressRing";
import GaugeChart from "@/components/charts/GaugeChart";
import MultiLineChart from "@/components/charts/MultiLineChart";
import RankingTable from "@/components/charts/RankingTable";
import DistributionChart from "@/components/charts/DistributionChart";
import HeatMapChart from "@/components/charts/HeatMapChart";
import MetricCard from "@/components/charts/MetricCard";
import { useAuth } from "@/hooks/useAuth";
import { getStats, getResults } from "@/lib/utils";
import {
  filterResultsByDateRange,
  transformToLineChartData,
  transformToBarChartData,
  transformToPerformanceTierData,
  transformToAreaChartData,
  transformToRadarChartData,
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
  calculateSubjectInsights,
  generateTimePatternAnalysis
} from "@/lib/analyticsUtils";
import { prepareAnalyticsCSVData } from "@/lib/exportUtils";
import { CSVLink } from "react-csv";
import type { DashboardStats } from "@/types";

type SubjectStat = { average: number; count: number; passed: number };

export default function AnalyticsPage() {
  const { user, isLoading } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [subjectStats, setSubjectStats] = useState<Record<string, SubjectStat>>({});
  const [dateRange, setDateRange] = useState<DateRange>('all');
  const [lineChartData, setLineChartData] = useState<any[]>([]);
  const [barChartData, setBarChartData] = useState<any[]>([]);
  const [tierData, setTierData] = useState<any[]>([]);
  const [areaChartData, setAreaChartData] = useState<any[]>([]);
  const [radarData, setRadarData] = useState<any[]>([]);
  const [improvementTrend, setImprovementTrend] = useState<{ trend: string; percentage: number }>({ trend: 'stable', percentage: 0 });
  const [gradeStats, setGradeStats] = useState<any[]>([]);
  const [studentRanking, setStudentRanking] = useState<any[]>([]);
  const [scoreDistribution, setScoreDistribution] = useState<any[]>([]);
  const [heatmapData, setHeatmapData] = useState<{ data: any[]; xLabels: string[]; yLabels: string[] }>({ data: [], xLabels: [], yLabels: [] });
  const [weeklyTrendData, setWeeklyTrendData] = useState<any[]>([]);
  const [comparisonMetrics, setComparisonMetrics] = useState<any>(null);
  const [sparklines, setSparklines] = useState<Record<string, number[]>>({});
  const [subjectInsights, setSubjectInsights] = useState<Record<string, any>>({});
  const [timePatterns, setTimePatterns] = useState<any>(null);

  useEffect(() => {
    if (isLoading || !user) return;
    const s = getStats();
    const allResults = getResults();

    // Filter results by date range
    const filteredResults = filterResultsByDateRange(allResults, dateRange);

    // Compute subject stats with filtered results
    const subjects = ["Mathematics", "English", "Urdu"];
    const computed: Record<string, SubjectStat> = {};
    subjects.forEach((subj) => {
      const subset = filteredResults.filter((r) => r.subject === subj);
      if (!subset.length) return;
      const avg = Math.round(subset.reduce((sum, r) => sum + r.percentage, 0) / subset.length);
      const passed = subset.filter((r) => r.percentage >= 60).length;
      computed[subj] = { average: avg, count: subset.length, passed };
    });

    // Compute grade-level stats
    const grades = [1, 2, 3, 4, 5];
    const gradeData = grades.map(grade => {
      const gradeResults = filteredResults.filter(r => r.grade === grade);
      const avg = gradeResults.length > 0
        ? Math.round(gradeResults.reduce((sum, r) => sum + r.percentage, 0) / gradeResults.length)
        : 0;
      return {
        grade: `Grade ${grade}`,
        average: avg,
        count: gradeResults.length,
        color: ['#6366f1', '#3b82f6', '#06b6d4', '#10b981', '#f59e0b'][grade - 1]
      };
    });

    // Prepare chart data
    const lineData = transformToLineChartData(filteredResults);
    const barData = transformToBarChartData(filteredResults);
    const tierChartData = transformToPerformanceTierData(filteredResults);
    const areaData = transformToAreaChartData(allResults);
    const radarChartData = transformToRadarChartData(filteredResults);
    const trend = calculateImprovementTrend(filteredResults);

    // Generate granular analytics
    const ranking = generateStudentRanking(filteredResults);
    const distribution = generateScoreDistribution(filteredResults);
    const heatmap = generateSubjectGradeHeatmap(filteredResults);
    const weeklyData = generateWeeklyTrend(filteredResults, 8);
    const patterns = generateTimePatternAnalysis(filteredResults);

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
    subjects.forEach(subject => {
      insights[subject] = calculateSubjectInsights(filteredResults, subject);
    });

    setStats(s);
    setSubjectStats(computed);
    setLineChartData(lineData);
    setBarChartData(barData);
    setTierData(tierChartData);
    setAreaChartData(areaData);
    setRadarData(radarChartData);
    setImprovementTrend(trend);
    setGradeStats(gradeData.filter(g => g.count > 0));
    setStudentRanking(ranking);
    setScoreDistribution(distribution);
    setHeatmapData(heatmap);
    setWeeklyTrendData(weeklyData);
    setComparisonMetrics(comparison);
    setSparklines(sparks);
    setSubjectInsights(insights);
    setTimePatterns(patterns);
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
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Analytics</p>
          <h1 className="text-3xl font-bold text-slate-900">Analytics Dashboard</h1>
          <p className="text-slate-600">Comprehensive system analytics and insights.</p>
          <div className={`inline-flex items-center gap-2 mt-2 ${getTrendColor()} text-sm font-medium`}>
            {getTrendIcon()} {improvementTrend.trend === 'stable' ? 'Performance stable' :
              improvementTrend.trend === 'improving' ? `Trending up ${improvementTrend.percentage}%` :
              `Trending down ${improvementTrend.percentage}%`}
          </div>
        </div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <DateRangePicker value={dateRange} onChange={setDateRange} />
          <CSVLink
            data={prepareAnalyticsCSVData(subjectStats)}
            filename={`analytics-${dateRange}-${new Date().toISOString().split('T')[0]}.csv`}
          >
            <Button variant="secondary">📥 Export CSV</Button>
          </CSVLink>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        <StatCard title="Total Students" value={stats.totalStudents} subtitle="Active students" accent="indigo" icon="👥" />
        <StatCard title="Total Assessments" value={stats.totalAssessments} subtitle="Available" accent="blue" icon="📝" />
        <StatCard title="Average Score" value={`${stats.averageScore}%`} subtitle="System-wide" accent="emerald" icon="⭐" />
        <StatCard title="Completion Rate" value={`${stats.completionRate}%`} subtitle="Overall" accent="amber" icon="✅" />
      </div>

      {/* Week over Week Comparison */}
      {comparisonMetrics && (
        <Card>
          <div className="mb-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Period Comparison</p>
            <h3 className="text-lg font-bold text-slate-900">This Week vs Last Week</h3>
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
              title="Unique Students"
              value={studentRanking.length}
              subtitle="Participated"
              icon="👥"
              color="blue"
              size="sm"
            />
          </div>
        </Card>
      )}

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <div className="mb-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Trends</p>
            <h3 className="text-lg font-bold text-slate-900">Performance Over Time</h3>
          </div>
          <LineChart data={lineChartData} />
        </Card>
        <Card>
          <div className="mb-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Comparison</p>
            <h3 className="text-lg font-bold text-slate-900">Subject Performance</h3>
          </div>
          <BarChart data={barChartData} />
        </Card>
      </div>

      {/* Subject Breakdown Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {Object.entries(subjectStats).map(([subject, data]) => (
          <Card key={subject} className="bg-slate-50/60">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={`h-10 w-10 rounded-xl grid place-content-center text-lg ${
                  subject === 'Mathematics' ? 'bg-blue-100 text-blue-600' :
                  subject === 'English' ? 'bg-cyan-100 text-cyan-600' :
                  'bg-emerald-100 text-emerald-600'
                }`}>
                  {subject === 'Mathematics' ? '🔢' : subject === 'English' ? '📖' : '📝'}
                </div>
                <h3 className="text-lg font-bold text-slate-900">{subject}</h3>
              </div>
              <span className="text-xs px-2 py-1 rounded-full bg-white ring-1 ring-slate-200 text-slate-600">
                {data.count} attempts
              </span>
            </div>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-slate-600">Average score</span>
                  <span className="text-2xl font-bold text-slate-900">{data.average}%</span>
                </div>
                <div className="h-2.5 rounded-full bg-slate-200 overflow-hidden">
                  <div
                    className={`h-full ${
                      subject === 'Mathematics' ? 'bg-gradient-to-r from-blue-500 to-indigo-500' :
                      subject === 'English' ? 'bg-gradient-to-r from-cyan-500 to-blue-500' :
                      'bg-gradient-to-r from-emerald-500 to-teal-500'
                    }`}
                    style={{ width: `${data.average}%` }}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-200">
                <div>
                  <p className="text-sm text-slate-600">Total attempts</p>
                  <p className="text-xl font-bold text-slate-800">{data.count}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600">Pass rate</p>
                  <p className="text-xl font-bold text-slate-800">
                    {data.count > 0 ? Math.round((data.passed / data.count) * 100) : 0}%
                  </p>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Second Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Performance Distribution */}
        <Card>
          <div className="mb-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Distribution</p>
            <h3 className="text-lg font-bold text-slate-900">Performance Tiers</h3>
          </div>
          <DonutChart
            data={tierData}
            centerValue={`${stats.averageScore}%`}
            centerLabel="Average"
            height={220}
          />
        </Card>

        {/* Subject Trends Over Time */}
        <Card>
          <div className="mb-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">History</p>
            <h3 className="text-lg font-bold text-slate-900">Subject Trends</h3>
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

        {/* Subject Radar */}
        <Card>
          <div className="mb-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Overview</p>
            <h3 className="text-lg font-bold text-slate-900">Subject Balance</h3>
          </div>
          <RadarChart data={radarData} height={220} color="#8b5cf6" />
        </Card>
      </div>

      {/* Grade Level Analysis */}
      {gradeStats.length > 0 && (
        <Card>
          <div className="mb-6">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Breakdown</p>
            <h3 className="text-lg font-bold text-slate-900">Performance by Grade Level</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {gradeStats.map((grade, index) => (
              <div
                key={index}
                className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl p-4 text-center border border-slate-200"
              >
                <p className="text-sm font-semibold text-slate-600 mb-3">{grade.grade}</p>
                <ProgressRing
                  value={grade.average}
                  size={80}
                  color={grade.average >= 80 ? '#10b981' : grade.average >= 60 ? '#f59e0b' : '#ef4444'}
                />
                <div className="mt-3">
                  <p className="text-xs text-slate-500">{grade.count} assessments</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Weekly Trend with Subject Breakdown */}
      <Card>
        <div className="mb-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Weekly Analysis</p>
          <h3 className="text-lg font-bold text-slate-900">Performance by Subject Over Time</h3>
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
            maxItems={10}
            highlightTop={3}
          />
        </Card>

        <Card>
          <div className="mb-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Distribution</p>
            <h3 className="text-lg font-bold text-slate-900">Score Distribution</h3>
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
          <h3 className="text-lg font-bold text-slate-900">Subject Performance by Grade</h3>
          <p className="text-sm text-slate-500">Identify areas needing attention across grades and subjects</p>
        </div>
        <HeatMapChart
          data={heatmapData.data}
          xLabels={heatmapData.xLabels}
          yLabels={heatmapData.yLabels}
          showValues={true}
        />
      </Card>

      {/* Detailed Subject Insights */}
      <Card>
        <div className="mb-6">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Subject Analysis</p>
          <h3 className="text-lg font-bold text-slate-900">Detailed Subject Performance</h3>
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
                      <p className="font-bold text-slate-700">{insight.median || 0}%</p>
                      <p className="text-slate-500">Median</p>
                    </div>
                    <div className="bg-white rounded-lg p-2 text-center">
                      <p className="font-bold text-emerald-600">{insight.highestScore || 0}%</p>
                      <p className="text-slate-500">Highest</p>
                    </div>
                    <div className="bg-white rounded-lg p-2 text-center">
                      <p className="font-bold text-red-500">{insight.lowestScore || 0}%</p>
                      <p className="text-slate-500">Lowest</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-white rounded-lg p-2 text-center">
                      <p className="font-bold text-slate-700">{insight.passRate || 0}%</p>
                      <p className="text-slate-500">Pass Rate</p>
                    </div>
                    <div className="bg-white rounded-lg p-2 text-center">
                      <p className="font-bold text-slate-700">{insight.uniqueStudents || 0}</p>
                      <p className="text-slate-500">Students</p>
                    </div>
                  </div>

                  {insight.topPerformers?.length > 0 && (
                    <div className="text-xs bg-white rounded-lg p-2">
                      <p className="text-slate-500 mb-1">Top performers:</p>
                      <p className="font-medium text-emerald-600 truncate">
                        {insight.topPerformers.slice(0, 2).map((s: any) => s.name).join(', ')}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Time Pattern Analysis */}
      {timePatterns && timePatterns.byDayOfWeek && (
        <Card>
          <div className="mb-6">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Patterns</p>
            <h3 className="text-lg font-bold text-slate-900">Performance by Day of Week</h3>
            <p className="text-sm text-slate-500">Identify when students perform best</p>
          </div>
          <div className="grid grid-cols-7 gap-2">
            {timePatterns.byDayOfWeek.map((day: any, index: number) => (
              <div
                key={index}
                className={`p-3 rounded-xl text-center ${
                  day.average >= 80 ? 'bg-emerald-100 border border-emerald-200' :
                  day.average >= 60 ? 'bg-amber-100 border border-amber-200' :
                  day.average > 0 ? 'bg-red-100 border border-red-200' :
                  'bg-slate-100 border border-slate-200'
                }`}
              >
                <p className="text-xs font-medium text-slate-500 mb-1">{day.day.substring(0, 3)}</p>
                <p className={`text-lg font-bold ${
                  day.average >= 80 ? 'text-emerald-600' :
                  day.average >= 60 ? 'text-amber-600' :
                  day.average > 0 ? 'text-red-600' :
                  'text-slate-400'
                }`}>
                  {day.average > 0 ? `${day.average}%` : '-'}
                </p>
                <p className="text-xs text-slate-400">{day.count} tests</p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Summary Gauges */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <div className="flex flex-col items-center">
            <GaugeChart
              value={stats.averageScore}
              title="System Average"
              size={180}
              thresholds={{ low: 60, medium: 80 }}
              labels={{ low: 'Needs Attention', medium: 'Good', high: 'Excellent' }}
            />
          </div>
        </Card>
        <Card>
          <div className="flex flex-col items-center">
            <GaugeChart
              value={stats.completionRate}
              title="Completion Rate"
              size={180}
              thresholds={{ low: 70, medium: 90 }}
              labels={{ low: 'Low', medium: 'Moderate', high: 'High' }}
            />
          </div>
        </Card>
        <Card>
          <div className="space-y-4">
            <div className="mb-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Quick Stats</p>
              <h3 className="text-lg font-bold text-slate-900">At a Glance</h3>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                <span className="text-sm text-slate-600">Total Results</span>
                <span className="font-bold text-slate-800">{lineChartData.length}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                <span className="text-sm text-slate-600">Pass Rate (60%+)</span>
                <span className="font-bold text-emerald-600">
                  {Object.values(subjectStats).reduce((sum, s) => sum + s.passed, 0)} passed
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                <span className="text-sm text-slate-600">Trend</span>
                <span className={`font-bold ${getTrendColor()}`}>
                  {improvementTrend.trend.charAt(0).toUpperCase() + improvementTrend.trend.slice(1)}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                <span className="text-sm text-slate-600">Best Subject</span>
                <span className="font-bold text-indigo-600">
                  {Object.entries(subjectStats).sort((a, b) => b[1].average - a[1].average)[0]?.[0] || 'N/A'}
                </span>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
