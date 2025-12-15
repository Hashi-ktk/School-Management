import type { Student, Assessment, AssessmentResult } from "@/types";

export type DateRange = '7d' | '30d' | '90d' | 'all';

export interface StudentFilters {
  search: string;
  grade: string; // 'all' | '1' | '2' | '3' | '4' | '5'
  subject: string; // 'all' | 'Mathematics' | 'English' | 'Urdu'
  performance: string; // 'all' | 'high' | 'medium' | 'low'
}

export interface AssessmentFilters {
  search: string;
  subject: string; // 'all' | 'Mathematics' | 'English' | 'Urdu'
  grade: string; // 'all' | '1' | '2' | '3' | '4' | '5'
}

/**
 * Filter students based on search, grade, subject, and performance criteria
 */
export function filterStudents(
  students: Student[],
  filters: StudentFilters,
  getAverageScore: (studentId: string) => number
): Student[] {
  return students.filter(student => {
    // Search filter (case-insensitive name match)
    if (filters.search) {
      const searchLower = filters.search.toLowerCase().trim();
      if (!student.name.toLowerCase().includes(searchLower)) {
        return false;
      }
    }

    // Grade filter
    if (filters.grade !== 'all') {
      if (student.grade !== parseInt(filters.grade)) {
        return false;
      }
    }

    // Subject filter (student must have the subject in their subjects array)
    if (filters.subject !== 'all') {
      if (!student.subjects.includes(filters.subject)) {
        return false;
      }
    }

    // Performance filter (based on average score)
    if (filters.performance !== 'all') {
      const avgScore = getAverageScore(student.id);
      if (filters.performance === 'high' && avgScore < 80) return false;
      if (filters.performance === 'medium' && (avgScore < 60 || avgScore >= 80)) return false;
      if (filters.performance === 'low' && avgScore >= 60) return false;
    }

    return true;
  });
}

/**
 * Filter assessments based on search, subject, and grade criteria
 */
export function filterAssessments(
  assessments: Assessment[],
  filters: AssessmentFilters
): Assessment[] {
  return assessments.filter(assessment => {
    // Search filter (case-insensitive title match)
    if (filters.search) {
      const searchLower = filters.search.toLowerCase().trim();
      if (!assessment.title.toLowerCase().includes(searchLower)) {
        return false;
      }
    }

    // Subject filter
    if (filters.subject !== 'all') {
      if (assessment.subject !== filters.subject) {
        return false;
      }
    }

    // Grade filter
    if (filters.grade !== 'all') {
      if (assessment.grade !== parseInt(filters.grade)) {
        return false;
      }
    }

    return true;
  });
}

/**
 * Get the date boundary for a given date range
 */
export function getDateBoundary(range: DateRange): Date | null {
  if (range === 'all') return null;

  const now = new Date();
  const days: Record<Exclude<DateRange, 'all'>, number> = {
    '7d': 7,
    '30d': 30,
    '90d': 90
  };

  const boundary = new Date(now);
  boundary.setDate(boundary.getDate() - days[range]);
  boundary.setHours(0, 0, 0, 0); // Start of day

  return boundary;
}

/**
 * Filter assessment results by date range
 */
export function filterResultsByDateRange(
  results: AssessmentResult[],
  range: DateRange
): AssessmentResult[] {
  if (range === 'all') return results;

  const boundary = getDateBoundary(range);
  if (!boundary) return results;

  return results.filter(result => {
    const completedDate = new Date(result.completedAt);
    return completedDate >= boundary;
  });
}

/**
 * Transform results to line chart data (performance trends over time)
 */
export function transformToLineChartData(
  results: AssessmentResult[],
  studentId?: string
): Array<{ name: string; value: number; date: Date }> {
  // Filter by student if provided
  let filteredResults = studentId
    ? results.filter(r => r.studentId === studentId)
    : results;

  // Sort by completion date
  filteredResults = [...filteredResults].sort((a, b) =>
    new Date(a.completedAt).getTime() - new Date(b.completedAt).getTime()
  );

  // Take last 10 results for trend analysis
  const recentResults = filteredResults.slice(-10);

  // Transform to chart data
  return recentResults.map((result, index) => ({
    name: `Assessment ${index + 1}`,
    value: result.percentage,
    date: new Date(result.completedAt)
  }));
}

/**
 * Transform results to bar chart data (subject comparison)
 */
export function transformToBarChartData(
  results: AssessmentResult[]
): Array<{ subject: string; average: number; count: number; color: string }> {
  const subjects = ['Mathematics', 'English', 'Urdu'];
  const colors: Record<string, string> = {
    'Mathematics': '#3b82f6', // Blue
    'English': '#06b6d4', // Cyan
    'Urdu': '#10b981' // Emerald
  };

  return subjects.map(subject => {
    const subjectResults = results.filter(r => r.subject === subject);

    if (!subjectResults.length) {
      return {
        subject,
        average: 0,
        count: 0,
        color: colors[subject] || '#94a3b8'
      };
    }

    const total = subjectResults.reduce((sum, r) => sum + r.percentage, 0);
    const average = Math.round(total / subjectResults.length);

    return {
      subject,
      average,
      count: subjectResults.length,
      color: colors[subject] || '#94a3b8'
    };
  });
}

/**
 * Transform results to donut chart data (completion/performance distribution)
 */
export function transformToDonutChartData(
  results: AssessmentResult[]
): Array<{ name: string; value: number; color: string }> {
  const completed = results.filter(r => r.status === 'completed').length;
  const inProgress = results.filter(r => r.status === 'in-progress').length;
  const total = results.length;

  if (total === 0) return [];

  return [
    {
      name: 'Completed',
      value: Math.round((completed / total) * 100),
      color: '#10b981' // Emerald
    },
    {
      name: 'In Progress',
      value: Math.round((inProgress / total) * 100),
      color: '#f59e0b' // Amber
    }
  ].filter(item => item.value > 0);
}

/**
 * Transform results to performance tier distribution for donut chart
 */
export function transformToPerformanceTierData(
  results: AssessmentResult[]
): Array<{ name: string; value: number; color: string; count: number }> {
  const completed = results.filter(r => r.status === 'completed');
  const total = completed.length;

  if (total === 0) return [];

  const proficient = completed.filter(r => r.percentage >= 80).length;
  const developing = completed.filter(r => r.percentage >= 60 && r.percentage < 80).length;
  const needsSupport = completed.filter(r => r.percentage < 60).length;

  return [
    {
      name: 'Proficient (80%+)',
      value: Math.round((proficient / total) * 100),
      color: '#10b981', // Emerald
      count: proficient
    },
    {
      name: 'Developing (60-79%)',
      value: Math.round((developing / total) * 100),
      color: '#f59e0b', // Amber
      count: developing
    },
    {
      name: 'Needs Support (<60%)',
      value: Math.round((needsSupport / total) * 100),
      color: '#ef4444', // Red
      count: needsSupport
    }
  ].filter(item => item.count > 0);
}

/**
 * Transform results to radar chart data (subject skills)
 */
export function transformToRadarChartData(
  results: AssessmentResult[],
  studentId?: string
): Array<{ subject: string; score: number; fullMark: number }> {
  const subjects = ['Mathematics', 'English', 'Urdu'];

  // Filter by student if provided
  const filteredResults = studentId
    ? results.filter(r => r.studentId === studentId && r.status === 'completed')
    : results.filter(r => r.status === 'completed');

  return subjects.map(subject => {
    const subjectResults = filteredResults.filter(r => r.subject === subject);

    if (!subjectResults.length) {
      return { subject, score: 0, fullMark: 100 };
    }

    const average = Math.round(
      subjectResults.reduce((sum, r) => sum + r.percentage, 0) / subjectResults.length
    );

    return { subject, score: average, fullMark: 100 };
  });
}

/**
 * Transform results to activity calendar data
 */
export function transformToActivityCalendarData(
  results: AssessmentResult[],
  studentId?: string,
  weeks: number = 12
): Array<{ date: string; count: number; level: 0 | 1 | 2 | 3 | 4 }> {
  // Filter by student if provided
  const filteredResults = studentId
    ? results.filter(r => r.studentId === studentId)
    : results;

  // Get date range
  const today = new Date();
  const startDate = new Date(today);
  startDate.setDate(startDate.getDate() - (weeks * 7));

  // Group by date
  const activityByDate: Record<string, number> = {};

  filteredResults.forEach(result => {
    const date = new Date(result.completedAt).toISOString().split('T')[0];
    activityByDate[date] = (activityByDate[date] || 0) + 1;
  });

  // Calculate level based on activity count
  const counts = Object.values(activityByDate);
  const maxCount = Math.max(...counts, 1);

  const getLevel = (count: number): 0 | 1 | 2 | 3 | 4 => {
    if (count === 0) return 0;
    const ratio = count / maxCount;
    if (ratio >= 0.75) return 4;
    if (ratio >= 0.5) return 3;
    if (ratio >= 0.25) return 2;
    return 1;
  };

  // Generate activity data
  return Object.entries(activityByDate).map(([date, count]) => ({
    date,
    count,
    level: getLevel(count)
  }));
}

/**
 * Transform results to area chart data (stacked subject performance over time)
 */
export function transformToAreaChartData(
  results: AssessmentResult[]
): Array<Record<string, any>> {
  // Group by month
  const monthlyData: Record<string, Record<string, number[]>> = {};

  results.forEach(result => {
    const date = new Date(result.completedAt);
    const monthKey = `${date.toLocaleString('default', { month: 'short' })} ${date.getFullYear()}`;

    if (!monthlyData[monthKey]) {
      monthlyData[monthKey] = {
        Mathematics: [],
        English: [],
        Urdu: []
      };
    }

    if (monthlyData[monthKey][result.subject]) {
      monthlyData[monthKey][result.subject].push(result.percentage);
    }
  });

  // Calculate averages per month
  return Object.entries(monthlyData)
    .map(([month, subjects]) => ({
      name: month,
      Mathematics: subjects.Mathematics.length
        ? Math.round(subjects.Mathematics.reduce((a, b) => a + b, 0) / subjects.Mathematics.length)
        : 0,
      English: subjects.English.length
        ? Math.round(subjects.English.reduce((a, b) => a + b, 0) / subjects.English.length)
        : 0,
      Urdu: subjects.Urdu.length
        ? Math.round(subjects.Urdu.reduce((a, b) => a + b, 0) / subjects.Urdu.length)
        : 0,
    }))
    .slice(-6); // Last 6 months
}

/**
 * Calculate student achievements/badges based on performance
 */
export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  earned: boolean;
  earnedDate?: string;
  progress?: number;
  maxProgress?: number;
}

export function calculateStudentAchievements(
  results: AssessmentResult[],
  studentId: string
): Achievement[] {
  const studentResults = results.filter(r => r.studentId === studentId && r.status === 'completed');
  const perfectScores = studentResults.filter(r => r.percentage === 100).length;
  const highScores = studentResults.filter(r => r.percentage >= 90).length;
  const totalCompleted = studentResults.length;

  // Calculate streak
  const sortedResults = [...studentResults].sort(
    (a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime()
  );
  let streak = 0;
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

  // Calculate subject mastery
  const subjectScores: Record<string, number[]> = {};
  studentResults.forEach(r => {
    if (!subjectScores[r.subject]) subjectScores[r.subject] = [];
    subjectScores[r.subject].push(r.percentage);
  });

  const masteredSubjects = Object.entries(subjectScores).filter(([_, scores]) => {
    const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
    return scores.length >= 3 && avg >= 85;
  }).length;

  return [
    {
      id: 'first-assessment',
      name: 'First Steps',
      description: 'Complete your first assessment',
      icon: '🎯',
      earned: totalCompleted >= 1,
      earnedDate: studentResults[0]?.completedAt,
      progress: Math.min(totalCompleted, 1),
      maxProgress: 1
    },
    {
      id: 'perfect-score',
      name: 'Perfect Score',
      description: 'Score 100% on any assessment',
      icon: '⭐',
      earned: perfectScores >= 1,
      progress: perfectScores,
      maxProgress: 1
    },
    {
      id: 'high-achiever',
      name: 'High Achiever',
      description: 'Score 90%+ on 5 assessments',
      icon: '🏆',
      earned: highScores >= 5,
      progress: Math.min(highScores, 5),
      maxProgress: 5
    },
    {
      id: 'consistency',
      name: 'Consistency King',
      description: 'Complete assessments for 7 days in a row',
      icon: '🔥',
      earned: streak >= 7,
      progress: Math.min(streak, 7),
      maxProgress: 7
    },
    {
      id: 'subject-master',
      name: 'Subject Master',
      description: 'Master a subject with 85%+ average (min 3 assessments)',
      icon: '📚',
      earned: masteredSubjects >= 1,
      progress: masteredSubjects,
      maxProgress: 1
    },
    {
      id: 'all-rounder',
      name: 'All-Rounder',
      description: 'Complete at least 3 assessments in each subject',
      icon: '🌟',
      earned: Object.values(subjectScores).every(scores => scores.length >= 3),
      progress: Object.values(subjectScores).filter(scores => scores.length >= 3).length,
      maxProgress: 3
    },
    {
      id: 'dedicated-learner',
      name: 'Dedicated Learner',
      description: 'Complete 10 assessments',
      icon: '📖',
      earned: totalCompleted >= 10,
      progress: Math.min(totalCompleted, 10),
      maxProgress: 10
    },
    {
      id: 'improvement',
      name: 'Rising Star',
      description: 'Improve your score by 20% from your first assessment',
      icon: '📈',
      earned: studentResults.length >= 2 &&
        (studentResults[studentResults.length - 1]?.percentage || 0) -
        (studentResults[0]?.percentage || 0) >= 20,
      progress: studentResults.length >= 2
        ? Math.max(0, (studentResults[studentResults.length - 1]?.percentage || 0) - (studentResults[0]?.percentage || 0))
        : 0,
      maxProgress: 20
    }
  ];
}

/**
 * Calculate improvement trend
 */
export function calculateImprovementTrend(
  results: AssessmentResult[],
  studentId?: string
): { trend: 'improving' | 'stable' | 'declining'; percentage: number } {
  const filteredResults = studentId
    ? results.filter(r => r.studentId === studentId && r.status === 'completed')
    : results.filter(r => r.status === 'completed');

  if (filteredResults.length < 2) {
    return { trend: 'stable', percentage: 0 };
  }

  // Sort by date
  const sorted = [...filteredResults].sort(
    (a, b) => new Date(a.completedAt).getTime() - new Date(b.completedAt).getTime()
  );

  // Compare first half vs second half averages
  const midPoint = Math.floor(sorted.length / 2);
  const firstHalf = sorted.slice(0, midPoint);
  const secondHalf = sorted.slice(midPoint);

  const firstAvg = firstHalf.reduce((sum, r) => sum + r.percentage, 0) / firstHalf.length;
  const secondAvg = secondHalf.reduce((sum, r) => sum + r.percentage, 0) / secondHalf.length;

  const diff = secondAvg - firstAvg;

  if (diff >= 5) return { trend: 'improving', percentage: Math.round(diff) };
  if (diff <= -5) return { trend: 'declining', percentage: Math.round(Math.abs(diff)) };
  return { trend: 'stable', percentage: 0 };
}
