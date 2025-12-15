'use client';

import { useEffect, useState } from "react";
import Card from "@/components/ui/Card";
import StatCard from "@/components/ui/StatCard";
import Button from "@/components/ui/Button";
import RadarChart from "@/components/charts/RadarChart";
import LineChart from "@/components/charts/LineChart";
import DonutChart from "@/components/charts/DonutChart";
import GaugeChart from "@/components/charts/GaugeChart";
import ProgressRing from "@/components/charts/ProgressRing";
import MultiLineChart from "@/components/charts/MultiLineChart";
import MetricCard from "@/components/charts/MetricCard";
import RankingTable from "@/components/charts/RankingTable";
import HeatMapChart from "@/components/charts/HeatMapChart";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { getObservationsByObserver } from "@/lib/observationUtils";
import { formatDate } from "@/lib/utils";
import type { ClassroomObservation } from "@/types";

export default function ObserverDashboard() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [observations, setObservations] = useState<ClassroomObservation[]>([]);
  const [allObservations, setAllObservations] = useState<ClassroomObservation[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    drafts: 0,
    avgScore: 0,
  });
  const [radarData, setRadarData] = useState<any[]>([]);
  const [lineChartData, setLineChartData] = useState<any[]>([]);
  const [statusData, setStatusData] = useState<any[]>([]);
  const [indicatorStats, setIndicatorStats] = useState<any[]>([]);
  const [teacherRanking, setTeacherRanking] = useState<any[]>([]);
  const [indicatorTrends, setIndicatorTrends] = useState<any[]>([]);
  const [teacherHeatmap, setTeacherHeatmap] = useState<{ data: any[]; xLabels: string[]; yLabels: string[] }>({ data: [], xLabels: [], yLabels: [] });
  const [monthlyComparison, setMonthlyComparison] = useState<any>(null);
  const [indicatorAnalysis, setIndicatorAnalysis] = useState<any[]>([]);

  useEffect(() => {
    if (!user || isLoading) return;

    const obs = getObservationsByObserver(user.id);
    setAllObservations(obs);
    setObservations(obs.slice(0, 5)); // Recent 5

    const completed = obs.filter(o => o.status === 'completed');
    const drafts = obs.filter(o => o.status === 'draft');
    const avgScore = completed.length > 0
      ? completed.reduce((sum, o) => sum + o.overallScore, 0) / completed.length
      : 0;

    setStats({
      total: obs.length,
      completed: completed.length,
      drafts: drafts.length,
      avgScore: Math.round(avgScore),
    });

    // Calculate indicator averages for radar chart
    if (completed.length > 0) {
      const indicatorTotals: Record<string, { total: number; count: number }> = {};

      completed.forEach(observation => {
        observation.indicators.forEach(indicator => {
          if (!indicatorTotals[indicator.name]) {
            indicatorTotals[indicator.name] = { total: 0, count: 0 };
          }
          indicatorTotals[indicator.name].total += (indicator.score / indicator.maxScore) * 100;
          indicatorTotals[indicator.name].count += 1;
        });
      });

      const radarChartData = Object.entries(indicatorTotals).map(([name, data]) => ({
        subject: name.length > 15 ? name.substring(0, 15) + '...' : name,
        fullName: name,
        score: Math.round(data.total / data.count),
        fullMark: 100
      }));

      setRadarData(radarChartData);

      // Indicator stats for cards
      const indicatorStatsData = Object.entries(indicatorTotals).map(([name, data]) => ({
        name,
        average: Math.round(data.total / data.count),
        observations: data.count
      }));
      setIndicatorStats(indicatorStatsData);
    }

    // Transform for line chart (score trends over time)
    const sortedCompleted = [...completed].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    const lineData = sortedCompleted.slice(-10).map((obs, index) => ({
      name: `Obs ${index + 1}`,
      value: obs.overallScore
    }));
    setLineChartData(lineData);

    // Status distribution for donut
    const statusDistribution = [
      { name: 'Completed', value: completed.length, color: '#10b981' },
      { name: 'Draft', value: drafts.length, color: '#f59e0b' }
    ].filter(item => item.value > 0);
    setStatusData(statusDistribution);

    // Teacher ranking
    const teacherScores: Record<string, { name: string; scores: number[]; grades: string[] }> = {};
    completed.forEach(observation => {
      if (!teacherScores[observation.teacherId]) {
        teacherScores[observation.teacherId] = {
          name: observation.teacherName,
          scores: [],
          grades: []
        };
      }
      teacherScores[observation.teacherId].scores.push(observation.overallScore);
      if (!teacherScores[observation.teacherId].grades.includes(`Grade ${observation.classGrade}`)) {
        teacherScores[observation.teacherId].grades.push(`Grade ${observation.classGrade}`);
      }
    });

    const ranking = Object.entries(teacherScores)
      .map(([id, data]) => ({
        name: data.name,
        value: Math.round(data.scores.reduce((a, b) => a + b, 0) / data.scores.length),
        subtitle: `${data.scores.length} observations · ${data.grades.join(', ')}`,
        totalAssessments: data.scores.length
      }))
      .sort((a, b) => b.value - a.value)
      .map((item, index) => ({ ...item, rank: index + 1 }));
    setTeacherRanking(ranking);

    // Indicator-level detailed analysis
    if (completed.length > 0) {
      const indicatorDetails: Record<string, {
        total: number;
        count: number;
        scores: number[];
        byTeacher: Record<string, number[]>;
      }> = {};

      completed.forEach(observation => {
        observation.indicators.forEach(indicator => {
          if (!indicatorDetails[indicator.name]) {
            indicatorDetails[indicator.name] = {
              total: 0,
              count: 0,
              scores: [],
              byTeacher: {}
            };
          }
          const percentage = (indicator.score / indicator.maxScore) * 100;
          indicatorDetails[indicator.name].total += percentage;
          indicatorDetails[indicator.name].count += 1;
          indicatorDetails[indicator.name].scores.push(percentage);

          if (!indicatorDetails[indicator.name].byTeacher[observation.teacherName]) {
            indicatorDetails[indicator.name].byTeacher[observation.teacherName] = [];
          }
          indicatorDetails[indicator.name].byTeacher[observation.teacherName].push(percentage);
        });
      });

      const analysisData = Object.entries(indicatorDetails).map(([name, data]) => {
        const avg = Math.round(data.total / data.count);
        const sorted = [...data.scores].sort((a, b) => a - b);
        const median = sorted[Math.floor(sorted.length / 2)];
        const highest = Math.max(...data.scores);
        const lowest = Math.min(...data.scores);

        // Find best/worst teachers for this indicator
        const teacherAvgs = Object.entries(data.byTeacher).map(([teacher, scores]) => ({
          teacher,
          avg: Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
        })).sort((a, b) => b.avg - a.avg);

        return {
          name,
          average: avg,
          median: Math.round(median),
          highest: Math.round(highest),
          lowest: Math.round(lowest),
          observations: data.count,
          trend: avg >= 80 ? 'excellent' : avg >= 60 ? 'good' : 'needs-improvement',
          bestTeacher: teacherAvgs[0],
          needsImprovement: teacherAvgs.filter(t => t.avg < 60)
        };
      });
      setIndicatorAnalysis(analysisData);

      // Teacher x Indicator heatmap
      const teachers = Object.keys(teacherScores);
      const indicators = Object.keys(indicatorDetails);

      if (teachers.length > 0 && indicators.length > 0) {
        const heatmapData: any[] = [];
        teachers.forEach(teacherId => {
          const teacherName = teacherScores[teacherId].name;
          indicators.forEach(indicatorName => {
            const scores = indicatorDetails[indicatorName].byTeacher[teacherName] || [];
            const avg = scores.length > 0
              ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
              : 0;
            heatmapData.push({
              x: indicatorName.length > 12 ? indicatorName.substring(0, 12) + '...' : indicatorName,
              y: teacherName,
              value: avg
            });
          });
        });

        setTeacherHeatmap({
          data: heatmapData,
          xLabels: indicators.map(i => i.length > 12 ? i.substring(0, 12) + '...' : i),
          yLabels: Object.values(teacherScores).map(t => t.name)
        });
      }
    }

    // Monthly comparison
    const now = new Date();
    const thisMonth = completed.filter(o => {
      const date = new Date(o.date);
      return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
    });
    const lastMonth = completed.filter(o => {
      const date = new Date(o.date);
      const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      return date.getMonth() === lastMonthDate.getMonth() && date.getFullYear() === lastMonthDate.getFullYear();
    });

    const thisMonthAvg = thisMonth.length > 0
      ? Math.round(thisMonth.reduce((sum, o) => sum + o.overallScore, 0) / thisMonth.length)
      : 0;
    const lastMonthAvg = lastMonth.length > 0
      ? Math.round(lastMonth.reduce((sum, o) => sum + o.overallScore, 0) / lastMonth.length)
      : 0;

    setMonthlyComparison({
      thisMonth: {
        count: thisMonth.length,
        avgScore: thisMonthAvg
      },
      lastMonth: {
        count: lastMonth.length,
        avgScore: lastMonthAvg
      },
      change: thisMonthAvg - lastMonthAvg,
      countChange: thisMonth.length - lastMonth.length
    });

  }, [user, isLoading]);

  if (isLoading || !user) {
    return <div className="min-h-[50vh] grid place-content-center text-slate-600">Loading...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Hero Section */}
      <Card className="bg-gradient-to-br from-purple-100 via-white to-blue-100 border-2 border-purple-200 shadow-lg animate-fade-in relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-200/30 rounded-full blur-3xl"></div>
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
          <div className="space-y-4">
            <p className="text-xs font-bold uppercase tracking-wider text-purple-600 animate-slide-in-left">Observer Dashboard</p>
            <h1 className="text-4xl md:text-5xl font-bold text-slate-800 animate-slide-in-left animate-delay-100">
              Welcome, {user.name}
            </h1>
            <p className="text-lg text-slate-600 animate-slide-in-left animate-delay-200">Track and manage classroom observations</p>
            <div className="flex flex-wrap gap-3">
              <Button onClick={() => router.push('/dashboard/observer/observations/create')}>
                New Observation
              </Button>
              <Button variant="secondary" onClick={() => router.push('/dashboard/observer/observations')}>
                View All
              </Button>
            </div>
          </div>
          <div className="flex-shrink-0">
            <GaugeChart
              value={stats.avgScore}
              title="Average Score"
              size={180}
            />
          </div>
        </div>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard
          title="Total Observations"
          value={stats.total}
          accent="blue"
          icon="📋"
          subtitle="All time"
        />
        <StatCard
          title="Completed"
          value={stats.completed}
          accent="emerald"
          icon="✅"
          subtitle="Finalized"
        />
        <StatCard
          title="Drafts"
          value={stats.drafts}
          accent="amber"
          icon="📝"
          subtitle="In progress"
        />
        <StatCard
          title="Avg Score"
          value={`${stats.avgScore}%`}
          accent="indigo"
          icon="⭐"
          subtitle="Completed observations"
        />
      </div>

      {/* Monthly Comparison */}
      {monthlyComparison && (
        <Card>
          <div className="mb-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Comparison</p>
            <h3 className="text-lg font-bold text-slate-800">This Month vs Last Month</h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <MetricCard
              title="Avg Score"
              value={`${monthlyComparison.thisMonth.avgScore}%`}
              change={monthlyComparison.change}
              trend={monthlyComparison.change > 0 ? 'up' : monthlyComparison.change < 0 ? 'down' : 'neutral'}
              comparison={{ label: 'Last month', value: `${monthlyComparison.lastMonth.avgScore}%`, type: 'vs-previous' }}
              color={monthlyComparison.thisMonth.avgScore >= 70 ? 'emerald' : 'amber'}
              size="sm"
            />
            <MetricCard
              title="Observations"
              value={monthlyComparison.thisMonth.count}
              change={monthlyComparison.countChange}
              trend={monthlyComparison.countChange > 0 ? 'up' : monthlyComparison.countChange < 0 ? 'down' : 'neutral'}
              comparison={{ label: 'Last month', value: monthlyComparison.lastMonth.count, type: 'vs-previous' }}
              color="indigo"
              size="sm"
            />
            <MetricCard
              title="Teachers"
              value={teacherRanking.length}
              subtitle="Observed"
              icon="👩‍🏫"
              color="blue"
              size="sm"
            />
            <MetricCard
              title="Indicators"
              value={indicatorAnalysis.length}
              subtitle="Tracked"
              icon="📊"
              color="purple"
              size="sm"
            />
          </div>
        </Card>
      )}

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Indicator Radar */}
        <Card>
          <div className="mb-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Analysis</p>
            <h3 className="text-lg font-bold text-slate-800">Indicator Performance</h3>
            <p className="text-sm text-slate-500">Average scores across all indicators</p>
          </div>
          {radarData.length > 0 ? (
            <RadarChart data={radarData} height={280} color="#6366f1" />
          ) : (
            <div className="h-[280px] flex items-center justify-center text-slate-400">
              <div className="text-center">
                <p className="text-lg font-medium">No data available</p>
                <p className="text-sm">Complete observations to see indicator analysis</p>
              </div>
            </div>
          )}
        </Card>

        {/* Score Trends */}
        <Card>
          <div className="mb-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Trends</p>
            <h3 className="text-lg font-bold text-slate-800">Score Over Time</h3>
            <p className="text-sm text-slate-500">Performance trends from recent observations</p>
          </div>
          <LineChart data={lineChartData} />
        </Card>
      </div>

      {/* Indicator Stats & Status Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Indicator Breakdown */}
        <Card className="lg:col-span-2">
          <div className="mb-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Breakdown</p>
            <h3 className="text-lg font-bold text-slate-800">Indicator Details</h3>
          </div>
          {indicatorStats.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {indicatorStats.map((indicator, index) => (
                <div
                  key={index}
                  className="p-4 bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl border border-slate-200"
                >
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold text-slate-800 text-sm">{indicator.name}</h4>
                    <span className="text-xs text-slate-500">{indicator.observations} obs</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <ProgressRing
                      value={indicator.average}
                      size={60}
                      color={indicator.average >= 80 ? '#10b981' : indicator.average >= 60 ? '#f59e0b' : '#ef4444'}
                    />
                    <div>
                      <p className="text-2xl font-bold text-slate-800">{indicator.average}%</p>
                      <p className="text-xs text-slate-500">Average score</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="h-40 flex items-center justify-center text-slate-400">
              <p>Complete observations to see indicator breakdown</p>
            </div>
          )}
        </Card>

        {/* Status Distribution */}
        <Card>
          <div className="mb-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Status</p>
            <h3 className="text-lg font-bold text-slate-800">Observation Status</h3>
          </div>
          {statusData.length > 0 ? (
            <DonutChart
              data={statusData}
              centerValue={stats.total}
              centerLabel="Total"
              height={200}
            />
          ) : (
            <div className="h-[200px] flex items-center justify-center text-slate-400">
              <p>No observations yet</p>
            </div>
          )}
        </Card>
      </div>

      {/* Teacher Rankings */}
      {teacherRanking.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <RankingTable
              data={teacherRanking}
              title="Teacher Performance Ranking"
              valueLabel="Avg Score"
              maxItems={6}
              highlightTop={3}
            />
          </Card>

          {/* Teacher x Indicator Heatmap */}
          {teacherHeatmap.data.length > 0 && (
            <Card>
              <div className="mb-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Matrix</p>
                <h3 className="text-lg font-bold text-slate-800">Teacher × Indicator Performance</h3>
                <p className="text-sm text-slate-500">Identify strengths and areas for development</p>
              </div>
              <HeatMapChart
                data={teacherHeatmap.data}
                xLabels={teacherHeatmap.xLabels}
                yLabels={teacherHeatmap.yLabels}
                showValues={true}
              />
            </Card>
          )}
        </div>
      )}

      {/* Detailed Indicator Analysis */}
      {indicatorAnalysis.length > 0 && (
        <Card>
          <div className="mb-6">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Deep Analysis</p>
            <h3 className="text-lg font-bold text-slate-800">Indicator Performance Details</h3>
          </div>
          <div className="space-y-4">
            {indicatorAnalysis.map((indicator, index) => (
              <div
                key={index}
                className={`p-4 rounded-xl border-2 ${
                  indicator.trend === 'excellent' ? 'bg-emerald-50 border-emerald-200' :
                  indicator.trend === 'good' ? 'bg-amber-50 border-amber-200' :
                  'bg-red-50 border-red-200'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="font-bold text-slate-800">{indicator.name}</h4>
                    <p className="text-xs text-slate-500">{indicator.observations} observations</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                    indicator.trend === 'excellent' ? 'bg-emerald-100 text-emerald-700' :
                    indicator.trend === 'good' ? 'bg-amber-100 text-amber-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {indicator.trend === 'excellent' ? 'Excellent' :
                     indicator.trend === 'good' ? 'Good' : 'Needs Improvement'}
                  </span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-3">
                  <div className="bg-white rounded-lg p-3 text-center">
                    <p className="text-2xl font-bold text-slate-800">{indicator.average}%</p>
                    <p className="text-xs text-slate-500">Average</p>
                  </div>
                  <div className="bg-white rounded-lg p-3 text-center">
                    <p className="text-2xl font-bold text-slate-800">{indicator.median}%</p>
                    <p className="text-xs text-slate-500">Median</p>
                  </div>
                  <div className="bg-white rounded-lg p-3 text-center">
                    <p className="text-2xl font-bold text-emerald-600">{indicator.highest}%</p>
                    <p className="text-xs text-slate-500">Highest</p>
                  </div>
                  <div className="bg-white rounded-lg p-3 text-center">
                    <p className="text-2xl font-bold text-red-500">{indicator.lowest}%</p>
                    <p className="text-xs text-slate-500">Lowest</p>
                  </div>
                  <div className="bg-white rounded-lg p-3 text-center">
                    <p className="text-2xl font-bold text-indigo-600">{indicator.highest - indicator.lowest}%</p>
                    <p className="text-xs text-slate-500">Range</p>
                  </div>
                </div>

                {/* Progress bar showing average */}
                <div className="mb-3">
                  <div className="h-2 bg-white rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        indicator.trend === 'excellent' ? 'bg-emerald-500' :
                        indicator.trend === 'good' ? 'bg-amber-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${indicator.average}%` }}
                    />
                  </div>
                </div>

                <div className="flex flex-wrap gap-4 text-xs">
                  {indicator.bestTeacher && (
                    <div className="flex items-center gap-2">
                      <span className="text-slate-500">Top performer:</span>
                      <span className="font-bold text-emerald-600">
                        {indicator.bestTeacher.teacher} ({indicator.bestTeacher.avg}%)
                      </span>
                    </div>
                  )}
                  {indicator.needsImprovement.length > 0 && (
                    <div className="flex items-center gap-2">
                      <span className="text-slate-500">Needs support:</span>
                      <span className="font-bold text-red-500">
                        {indicator.needsImprovement.map((t: any) => t.teacher).join(', ')}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Quick Actions */}
      <Card>
        <h2 className="text-xl font-bold text-slate-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button
            onClick={() => router.push('/dashboard/observer/observations/create')}
            variant="primary"
            className="w-full py-4"
          >
            <span className="text-lg mr-2">➕</span> New Observation
          </Button>
          <Button
            onClick={() => router.push('/dashboard/observer/observations')}
            variant="secondary"
            className="w-full py-4"
          >
            <span className="text-lg mr-2">📋</span> My Observations
          </Button>
          <Button
            onClick={() => {
              const drafts = allObservations.find(o => o.status === 'draft');
              if (drafts) {
                router.push(`/dashboard/observer/observations/${drafts.id}`);
              } else {
                router.push('/dashboard/observer/observations');
              }
            }}
            variant="outline"
            className="w-full py-4"
          >
            <span className="text-lg mr-2">📝</span> Continue Draft
          </Button>
        </div>
      </Card>

      {/* Recent Observations */}
      <Card>
        <div className="flex justify-between items-center mb-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Recent</p>
            <h2 className="text-xl font-bold text-slate-900">Recent Observations</h2>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push('/dashboard/observer/observations')}
          >
            View All
          </Button>
        </div>
        {observations.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📋</div>
            <p className="text-gray-500 mb-4">No observations yet. Start your first observation!</p>
            <Button
              onClick={() => router.push('/dashboard/observer/observations/create')}
              variant="primary"
            >
              Create New Observation
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {observations.map((obs) => (
              <div
                key={obs.id}
                className="p-4 rounded-xl border border-slate-200 hover:border-indigo-300 hover:shadow-md transition cursor-pointer"
                onClick={() => router.push(`/dashboard/observer/observations/${obs.id}`)}
              >
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 text-white grid place-content-center font-semibold text-lg">
                      {obs.teacherName.slice(0, 1)}
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900 mb-1">{obs.teacherName}</h3>
                      <p className="text-sm text-gray-600">
                        Grade {obs.classGrade} • {obs.subject}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">{formatDate(obs.date)}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-2xl font-bold mb-1 ${
                      obs.status === 'completed' ? 'text-indigo-600' : 'text-gray-400'
                    }`}>
                      {obs.status === 'completed' ? `${obs.overallScore}%` : 'Draft'}
                    </div>
                    <span className={`text-xs px-3 py-1 rounded-full font-medium ${
                      obs.status === 'completed'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {obs.status}
                    </span>
                  </div>
                </div>

                {/* Indicator Preview */}
                {obs.status === 'completed' && obs.indicators.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-slate-100">
                    <p className="text-xs font-medium text-slate-500 mb-2">Indicators</p>
                    <div className="flex flex-wrap gap-2">
                      {obs.indicators.slice(0, 3).map((indicator, idx) => (
                        <span
                          key={idx}
                          className={`text-xs px-2 py-1 rounded-full ${
                            (indicator.score / indicator.maxScore) >= 0.8
                              ? 'bg-emerald-100 text-emerald-700'
                              : (indicator.score / indicator.maxScore) >= 0.6
                                ? 'bg-amber-100 text-amber-700'
                                : 'bg-red-100 text-red-700'
                          }`}
                        >
                          {indicator.name.substring(0, 20)}: {Math.round((indicator.score / indicator.maxScore) * 100)}%
                        </span>
                      ))}
                      {obs.indicators.length > 3 && (
                        <span className="text-xs text-slate-400">
                          +{obs.indicators.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
