import type { Student } from "@/types";

export interface SubjectStat {
  average: number;
  count: number;
  passed: number;
}

/**
 * Prepare student data for CSV export
 * Returns array of objects with headers: Name, Grade, Average Score, Subjects
 */
export function prepareStudentCSVData(
  students: Student[],
  getAverageScore: (studentId: string) => number
): Array<{
  Name: string;
  Grade: number;
  'Average Score': string;
  Subjects: string;
}> {
  return students.map(student => ({
    Name: student.name,
    Grade: student.grade,
    'Average Score': `${getAverageScore(student.id)}%`,
    Subjects: student.subjects.join(', ')
  }));
}

/**
 * Prepare analytics data for CSV export
 * Returns array of objects with headers: Subject, Average Score, Total Attempts, Pass Rate
 */
export function prepareAnalyticsCSVData(
  subjectStats: Record<string, SubjectStat>
): Array<{
  Subject: string;
  'Average Score': string;
  'Total Attempts': number;
  'Pass Rate': string;
}> {
  return Object.entries(subjectStats).map(([subject, stats]) => ({
    Subject: subject,
    'Average Score': `${stats.average}%`,
    'Total Attempts': stats.count,
    'Pass Rate': `${Math.round((stats.passed / stats.count) * 100)}%`
  }));
}
