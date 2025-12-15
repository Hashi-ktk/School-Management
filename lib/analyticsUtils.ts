import type { AssessmentResult, Student, Assessment } from "@/types";

/**
 * Generate score distribution data for histogram
 */
export function generateScoreDistribution(
  results: AssessmentResult[]
): Array<{ range: string; count: number; percentage: number }> {
  const ranges = [
    '0-9%', '10-19%', '20-29%', '30-39%', '40-49%',
    '50-59%', '60-69%', '70-79%', '80-89%', '90-100%'
  ];

  const distribution = ranges.map((range, index) => {
    const min = index * 10;
    const max = index === 9 ? 100 : (index + 1) * 10 - 1;
    const count = results.filter(r =>
      r.percentage >= min && r.percentage <= max
    ).length;

    return {
      range,
      count,
      percentage: results.length > 0 ? (count / results.length) * 100 : 0
    };
  });

  return distribution;
}

/**
 * Generate student ranking data
 */
export function generateStudentRanking(
  results: AssessmentResult[],
  previousResults?: AssessmentResult[]
): Array<{
  rank: number;
  name: string;
  value: number;
  change?: number;
  trend?: 'up' | 'down' | 'neutral';
  subtitle?: string;
  totalAssessments: number;
}> {
  // Group by student
  const studentScores: Record<string, {
    name: string;
    scores: number[];
    subjects: string[];
  }> = {};

  results.forEach(r => {
    if (!studentScores[r.studentId]) {
      studentScores[r.studentId] = { name: r.studentName, scores: [], subjects: [] };
    }
    studentScores[r.studentId].scores.push(r.percentage);
    if (!studentScores[r.studentId].subjects.includes(r.subject)) {
      studentScores[r.studentId].subjects.push(r.subject);
    }
  });

  // Calculate previous averages if available
  const prevAverages: Record<string, number> = {};
  if (previousResults) {
    previousResults.forEach(r => {
      if (!prevAverages[r.studentId]) {
        prevAverages[r.studentId] = r.percentage;
      } else {
        prevAverages[r.studentId] = (prevAverages[r.studentId] + r.percentage) / 2;
      }
    });
  }

  // Create ranking
  const ranking = Object.entries(studentScores)
    .map(([studentId, data]) => {
      const avg = Math.round(data.scores.reduce((a, b) => a + b, 0) / data.scores.length);
      const prevAvg = prevAverages[studentId];
      const change = prevAvg ? Math.round(avg - prevAvg) : undefined;

      return {
        studentId,
        name: data.name,
        value: avg,
        change,
        trend: change !== undefined
          ? (change > 0 ? 'up' : change < 0 ? 'down' : 'neutral') as 'up' | 'down' | 'neutral'
          : undefined,
        subtitle: `${data.scores.length} assessments · ${data.subjects.join(', ')}`,
        totalAssessments: data.scores.length
      };
    })
    .sort((a, b) => b.value - a.value)
    .map((item, index) => ({ ...item, rank: index + 1 }));

  return ranking;
}

/**
 * Generate subject x grade heatmap data
 */
export function generateSubjectGradeHeatmap(
  results: AssessmentResult[]
): {
  data: Array<{ x: string; y: string; value: number }>;
  xLabels: string[];
  yLabels: string[];
} {
  const subjects = ['Mathematics', 'English', 'Urdu'];
  const grades = ['Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5'];

  const data: Array<{ x: string; y: string; value: number }> = [];

  subjects.forEach(subject => {
    grades.forEach(grade => {
      const gradeNum = parseInt(grade.replace('Grade ', ''));
      const relevant = results.filter(
        r => r.subject === subject && r.grade === gradeNum
      );
      const avg = relevant.length > 0
        ? Math.round(relevant.reduce((sum, r) => sum + r.percentage, 0) / relevant.length)
        : 0;

      data.push({ x: grade, y: subject, value: avg });
    });
  });

  return { data, xLabels: grades, yLabels: subjects };
}

/**
 * Generate question type performance breakdown
 */
export function generateQuestionTypePerformance(
  results: AssessmentResult[]
): Array<{
  type: string;
  icon: string;
  correctRate: number;
  totalQuestions: number;
  avgTimeSpent?: number;
}> {
  const typeStats: Record<string, { correct: number; total: number }> = {
    'multiple-choice': { correct: 0, total: 0 },
    'true-false': { correct: 0, total: 0 },
    'short-answer': { correct: 0, total: 0 }
  };

  results.forEach(result => {
    result.answers.forEach(answer => {
      // We don't have question type in answers, so we'll estimate based on answer patterns
      // This would need to be enhanced with actual question data in production
      typeStats['multiple-choice'].total++;
      if (answer.isCorrect) typeStats['multiple-choice'].correct++;
    });
  });

  return [
    {
      type: 'Multiple Choice',
      icon: '📝',
      correctRate: typeStats['multiple-choice'].total > 0
        ? Math.round((typeStats['multiple-choice'].correct / typeStats['multiple-choice'].total) * 100)
        : 0,
      totalQuestions: typeStats['multiple-choice'].total
    },
    {
      type: 'True/False',
      icon: '✓✗',
      correctRate: typeStats['true-false'].total > 0
        ? Math.round((typeStats['true-false'].correct / typeStats['true-false'].total) * 100)
        : 0,
      totalQuestions: typeStats['true-false'].total
    },
    {
      type: 'Short Answer',
      icon: '✏️',
      correctRate: typeStats['short-answer'].total > 0
        ? Math.round((typeStats['short-answer'].correct / typeStats['short-answer'].total) * 100)
        : 0,
      totalQuestions: typeStats['short-answer'].total
    }
  ];
}

/**
 * Generate weekly performance trend data
 */
export function generateWeeklyTrend(
  results: AssessmentResult[],
  weeks: number = 8
): Array<{
  week: string;
  average: number;
  count: number;
  subjects: { Mathematics: number; English: number; Urdu: number };
}> {
  const weeklyData: Array<{
    week: string;
    startDate: Date;
    endDate: Date;
    scores: number[];
    subjectScores: { Mathematics: number[]; English: number[]; Urdu: number[] };
  }> = [];

  // Generate last N weeks
  const today = new Date();
  for (let i = weeks - 1; i >= 0; i--) {
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - (i + 1) * 7);
    weekStart.setHours(0, 0, 0, 0);

    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    weekEnd.setHours(23, 59, 59, 999);

    const weekLabel = `Week ${weeks - i}`;

    weeklyData.push({
      week: weekLabel,
      startDate: weekStart,
      endDate: weekEnd,
      scores: [],
      subjectScores: { Mathematics: [], English: [], Urdu: [] }
    });
  }

  // Populate with results
  results.forEach(result => {
    const resultDate = new Date(result.completedAt);
    weeklyData.forEach(week => {
      if (resultDate >= week.startDate && resultDate <= week.endDate) {
        week.scores.push(result.percentage);
        if (result.subject === 'Mathematics' || result.subject === 'English' || result.subject === 'Urdu') {
          week.subjectScores[result.subject as keyof typeof week.subjectScores].push(result.percentage);
        }
      }
    });
  });

  return weeklyData.map(week => ({
    week: week.week,
    average: week.scores.length > 0
      ? Math.round(week.scores.reduce((a, b) => a + b, 0) / week.scores.length)
      : 0,
    count: week.scores.length,
    subjects: {
      Mathematics: week.subjectScores.Mathematics.length > 0
        ? Math.round(week.subjectScores.Mathematics.reduce((a, b) => a + b, 0) / week.subjectScores.Mathematics.length)
        : 0,
      English: week.subjectScores.English.length > 0
        ? Math.round(week.subjectScores.English.reduce((a, b) => a + b, 0) / week.subjectScores.English.length)
        : 0,
      Urdu: week.subjectScores.Urdu.length > 0
        ? Math.round(week.subjectScores.Urdu.reduce((a, b) => a + b, 0) / week.subjectScores.Urdu.length)
        : 0
    }
  }));
}

/**
 * Generate comparison metrics (current vs previous period)
 */
export function generateComparisonMetrics(
  currentResults: AssessmentResult[],
  previousResults: AssessmentResult[]
): {
  averageScore: { current: number; previous: number; change: number };
  completionRate: { current: number; previous: number; change: number };
  totalAssessments: { current: number; previous: number; change: number };
  passRate: { current: number; previous: number; change: number };
} {
  const calcAvg = (results: AssessmentResult[]) =>
    results.length > 0
      ? Math.round(results.reduce((sum, r) => sum + r.percentage, 0) / results.length)
      : 0;

  const calcPassRate = (results: AssessmentResult[]) =>
    results.length > 0
      ? Math.round((results.filter(r => r.percentage >= 60).length / results.length) * 100)
      : 0;

  const currentAvg = calcAvg(currentResults);
  const previousAvg = calcAvg(previousResults);

  const currentPassRate = calcPassRate(currentResults);
  const previousPassRate = calcPassRate(previousResults);

  return {
    averageScore: {
      current: currentAvg,
      previous: previousAvg,
      change: currentAvg - previousAvg
    },
    completionRate: {
      current: currentResults.filter(r => r.status === 'completed').length,
      previous: previousResults.filter(r => r.status === 'completed').length,
      change: currentResults.filter(r => r.status === 'completed').length -
              previousResults.filter(r => r.status === 'completed').length
    },
    totalAssessments: {
      current: currentResults.length,
      previous: previousResults.length,
      change: currentResults.length - previousResults.length
    },
    passRate: {
      current: currentPassRate,
      previous: previousPassRate,
      change: currentPassRate - previousPassRate
    }
  };
}

/**
 * Generate subject comparison with previous period
 */
export function generateSubjectComparison(
  currentResults: AssessmentResult[],
  previousResults?: AssessmentResult[]
): Array<{
  name: string;
  current: number;
  previous?: number;
  benchmark: number;
}> {
  const subjects = ['Mathematics', 'English', 'Urdu'];

  return subjects.map(subject => {
    const current = currentResults.filter(r => r.subject === subject);
    const previous = previousResults?.filter(r => r.subject === subject);

    const currentAvg = current.length > 0
      ? Math.round(current.reduce((sum, r) => sum + r.percentage, 0) / current.length)
      : 0;

    const previousAvg = previous && previous.length > 0
      ? Math.round(previous.reduce((sum, r) => sum + r.percentage, 0) / previous.length)
      : undefined;

    return {
      name: subject,
      current: currentAvg,
      previous: previousAvg,
      benchmark: 70 // Target score
    };
  });
}

/**
 * Generate at-risk student details
 */
export function generateAtRiskDetails(
  results: AssessmentResult[]
): Array<{
  studentId: string;
  studentName: string;
  averageScore: number;
  recentTrend: 'declining' | 'stable' | 'improving';
  lastAssessmentDate: string;
  weakSubjects: string[];
  assessmentCount: number;
  riskLevel: 'high' | 'medium' | 'low';
}> {
  // Group by student
  const studentData: Record<string, AssessmentResult[]> = {};
  results.forEach(r => {
    if (!studentData[r.studentId]) studentData[r.studentId] = [];
    studentData[r.studentId].push(r);
  });

  return Object.entries(studentData)
    .map(([studentId, studentResults]) => {
      const sorted = [...studentResults].sort(
        (a, b) => new Date(a.completedAt).getTime() - new Date(b.completedAt).getTime()
      );

      const avg = Math.round(
        studentResults.reduce((sum, r) => sum + r.percentage, 0) / studentResults.length
      );

      // Calculate trend
      let trend: 'declining' | 'stable' | 'improving' = 'stable';
      if (sorted.length >= 2) {
        const recent = sorted.slice(-3);
        const earlier = sorted.slice(0, Math.max(1, sorted.length - 3));
        const recentAvg = recent.reduce((sum, r) => sum + r.percentage, 0) / recent.length;
        const earlierAvg = earlier.reduce((sum, r) => sum + r.percentage, 0) / earlier.length;

        if (recentAvg - earlierAvg > 5) trend = 'improving';
        else if (recentAvg - earlierAvg < -5) trend = 'declining';
      }

      // Find weak subjects
      const subjectScores: Record<string, number[]> = {};
      studentResults.forEach(r => {
        if (!subjectScores[r.subject]) subjectScores[r.subject] = [];
        subjectScores[r.subject].push(r.percentage);
      });

      const weakSubjects = Object.entries(subjectScores)
        .filter(([_, scores]) => {
          const subjectAvg = scores.reduce((a, b) => a + b, 0) / scores.length;
          return subjectAvg < 60;
        })
        .map(([subject]) => subject);

      // Determine risk level
      let riskLevel: 'high' | 'medium' | 'low' = 'low';
      if (avg < 40 || (avg < 60 && trend === 'declining')) riskLevel = 'high';
      else if (avg < 60 || (avg < 70 && trend === 'declining')) riskLevel = 'medium';

      return {
        studentId,
        studentName: studentResults[0].studentName,
        averageScore: avg,
        recentTrend: trend,
        lastAssessmentDate: sorted[sorted.length - 1].completedAt,
        weakSubjects,
        assessmentCount: studentResults.length,
        riskLevel
      };
    })
    .filter(s => s.averageScore < 60 || s.riskLevel !== 'low')
    .sort((a, b) => a.averageScore - b.averageScore);
}

/**
 * Generate performance breakdown by time of day/week
 */
export function generateTimePatternAnalysis(
  results: AssessmentResult[]
): {
  byDayOfWeek: Array<{ day: string; average: number; count: number }>;
  byHour: Array<{ hour: string; average: number; count: number }>;
} {
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const dayData: Record<number, number[]> = {};
  const hourData: Record<number, number[]> = {};

  results.forEach(result => {
    const date = new Date(result.completedAt);
    const day = date.getDay();
    const hour = date.getHours();

    if (!dayData[day]) dayData[day] = [];
    dayData[day].push(result.percentage);

    if (!hourData[hour]) hourData[hour] = [];
    hourData[hour].push(result.percentage);
  });

  const byDayOfWeek = dayNames.map((day, index) => ({
    day,
    average: dayData[index]?.length > 0
      ? Math.round(dayData[index].reduce((a, b) => a + b, 0) / dayData[index].length)
      : 0,
    count: dayData[index]?.length || 0
  }));

  const byHour = Array.from({ length: 24 }, (_, i) => ({
    hour: `${i.toString().padStart(2, '0')}:00`,
    average: hourData[i]?.length > 0
      ? Math.round(hourData[i].reduce((a, b) => a + b, 0) / hourData[i].length)
      : 0,
    count: hourData[i]?.length || 0
  }));

  return { byDayOfWeek, byHour };
}

/**
 * Calculate detailed subject insights
 */
export function calculateSubjectInsights(
  results: AssessmentResult[],
  subject: string
): {
  average: number;
  median: number;
  highestScore: number;
  lowestScore: number;
  passRate: number;
  totalAttempts: number;
  uniqueStudents: number;
  trend: 'improving' | 'stable' | 'declining';
  topPerformers: Array<{ name: string; score: number }>;
  needsAttention: Array<{ name: string; score: number }>;
} {
  const subjectResults = results.filter(r => r.subject === subject);

  if (subjectResults.length === 0) {
    return {
      average: 0,
      median: 0,
      highestScore: 0,
      lowestScore: 0,
      passRate: 0,
      totalAttempts: 0,
      uniqueStudents: 0,
      trend: 'stable',
      topPerformers: [],
      needsAttention: []
    };
  }

  const scores = subjectResults.map(r => r.percentage).sort((a, b) => a - b);
  const average = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
  const median = scores[Math.floor(scores.length / 2)];

  // Calculate trend
  const sorted = [...subjectResults].sort(
    (a, b) => new Date(a.completedAt).getTime() - new Date(b.completedAt).getTime()
  );
  const mid = Math.floor(sorted.length / 2);
  const firstHalf = sorted.slice(0, mid);
  const secondHalf = sorted.slice(mid);

  const firstAvg = firstHalf.length > 0
    ? firstHalf.reduce((sum, r) => sum + r.percentage, 0) / firstHalf.length
    : 0;
  const secondAvg = secondHalf.length > 0
    ? secondHalf.reduce((sum, r) => sum + r.percentage, 0) / secondHalf.length
    : 0;

  let trend: 'improving' | 'stable' | 'declining' = 'stable';
  if (secondAvg - firstAvg > 5) trend = 'improving';
  else if (secondAvg - firstAvg < -5) trend = 'declining';

  // Student-level analysis
  const studentScores: Record<string, { name: string; scores: number[] }> = {};
  subjectResults.forEach(r => {
    if (!studentScores[r.studentId]) {
      studentScores[r.studentId] = { name: r.studentName, scores: [] };
    }
    studentScores[r.studentId].scores.push(r.percentage);
  });

  const studentAverages = Object.values(studentScores).map(s => ({
    name: s.name,
    score: Math.round(s.scores.reduce((a, b) => a + b, 0) / s.scores.length)
  }));

  const topPerformers = studentAverages
    .filter(s => s.score >= 80)
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);

  const needsAttention = studentAverages
    .filter(s => s.score < 60)
    .sort((a, b) => a.score - b.score)
    .slice(0, 5);

  return {
    average,
    median,
    highestScore: Math.max(...scores),
    lowestScore: Math.min(...scores),
    passRate: Math.round((scores.filter(s => s >= 60).length / scores.length) * 100),
    totalAttempts: subjectResults.length,
    uniqueStudents: Object.keys(studentScores).length,
    trend,
    topPerformers,
    needsAttention
  };
}

/**
 * Generate sparkline data for a metric over time
 */
export function generateSparklineData(
  results: AssessmentResult[],
  metric: 'average' | 'count' | 'passRate',
  periods: number = 7
): number[] {
  const today = new Date();
  const data: number[] = [];

  for (let i = periods - 1; i >= 0; i--) {
    const periodStart = new Date(today);
    periodStart.setDate(today.getDate() - (i + 1));
    periodStart.setHours(0, 0, 0, 0);

    const periodEnd = new Date(periodStart);
    periodEnd.setHours(23, 59, 59, 999);

    const periodResults = results.filter(r => {
      const date = new Date(r.completedAt);
      return date >= periodStart && date <= periodEnd;
    });

    let value = 0;
    if (periodResults.length > 0) {
      switch (metric) {
        case 'average':
          value = Math.round(
            periodResults.reduce((sum, r) => sum + r.percentage, 0) / periodResults.length
          );
          break;
        case 'count':
          value = periodResults.length;
          break;
        case 'passRate':
          value = Math.round(
            (periodResults.filter(r => r.percentage >= 60).length / periodResults.length) * 100
          );
          break;
      }
    }

    data.push(value);
  }

  return data;
}
