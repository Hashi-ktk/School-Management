/**
 * AI-Assisted Student Grouping
 * Automatically groups students by competency level for TaRL (Teaching at the Right Level)
 */

import { aiConfig, GroupingLevel } from './aiConfig';
import { getResultsByStudent, getStudents, getAllResults } from './utils';
import type { Student, AssessmentResult } from '@/types';

// ============================================================================
// Types
// ============================================================================

export interface StudentGroupingInput {
  studentId: string;
  studentName: string;
  grade: number;
  scores: SubjectScore[];
  averageScore: number;
  recentTrend: 'improving' | 'stable' | 'declining';
}

export interface SubjectScore {
  subject: string;
  slo?: string;
  percentage: number;
  assessmentCount: number;
}

export interface StudentGroup {
  groupName: GroupingLevel;
  groupLevel: number;  // 1 = Beginner, 2 = Developing, 3 = Proficient, 4 = Advanced
  description: string;
  color: string;
  students: StudentGroupingInput[];
  recommendedFocus: string[];
  suggestedActivities: string[];
  teachingStrategies: string[];
}

export interface GroupingResult {
  subject: string;
  grade: number;
  totalStudents: number;
  groups: StudentGroup[];
  generatedAt: string;
  groupingMethod: 'competency' | 'tarl' | 'mixed-ability';
}

// ============================================================================
// Constants - Activity and Strategy Templates
// ============================================================================

const GROUP_TEMPLATES: Record<GroupingLevel, {
  description: string;
  color: string;
  focusAreas: string[];
  activities: string[];
  strategies: string[];
}> = {
  'Beginner': {
    description: 'Students who need foundational support and scaffolded learning',
    color: '#ef4444', // red
    focusAreas: [
      'Basic concept understanding',
      'Foundational skills building',
      'Vocabulary development',
      'Step-by-step guided practice',
    ],
    activities: [
      'Hands-on manipulatives and visual aids',
      'One-on-one or small group instruction',
      'Repetitive practice with immediate feedback',
      'Simple, concrete examples',
      'Peer tutoring with advanced students',
    ],
    strategies: [
      'Use visual representations and diagrams',
      'Break tasks into smaller steps',
      'Provide sentence starters and templates',
      'Allow extra time for processing',
      'Use frequent check-ins and formative assessment',
    ],
  },
  'Developing': {
    description: 'Students who are building skills and need guided practice',
    color: '#f59e0b', // amber
    focusAreas: [
      'Strengthening core concepts',
      'Building procedural fluency',
      'Connecting ideas across topics',
      'Developing problem-solving strategies',
    ],
    activities: [
      'Guided practice with gradual release',
      'Partner work and peer discussions',
      'Error analysis activities',
      'Scaffolded word problems',
      'Interactive games and activities',
    ],
    strategies: [
      'Model thinking processes aloud',
      'Use graphic organizers',
      'Provide worked examples',
      'Encourage self-checking strategies',
      'Connect new learning to prior knowledge',
    ],
  },
  'Proficient': {
    description: 'Students who have solid understanding and can work independently',
    color: '#10b981', // emerald
    focusAreas: [
      'Deepening conceptual understanding',
      'Applying skills to new contexts',
      'Developing reasoning skills',
      'Building mathematical/linguistic communication',
    ],
    activities: [
      'Independent problem solving',
      'Real-world application tasks',
      'Collaborative projects',
      'Teaching concepts to peers',
      'Self-directed learning activities',
    ],
    strategies: [
      'Provide open-ended questions',
      'Encourage multiple solution strategies',
      'Assign leadership roles in group work',
      'Introduce complexity gradually',
      'Foster metacognitive reflection',
    ],
  },
  'Advanced': {
    description: 'Students who excel and need enrichment and challenge',
    color: '#6366f1', // indigo
    focusAreas: [
      'Extension and enrichment',
      'Critical thinking challenges',
      'Cross-curricular connections',
      'Creative problem solving',
    ],
    activities: [
      'Challenge problems and puzzles',
      'Independent research projects',
      'Peer mentoring opportunities',
      'Competition preparation',
      'Advanced topic exploration',
    ],
    strategies: [
      'Compact curriculum to allow acceleration',
      'Assign complex, multi-step problems',
      'Encourage creative approaches',
      'Provide leadership opportunities',
      'Connect with external resources and experts',
    ],
  },
};

const SUBJECT_SPECIFIC_FOCUS: Record<string, Record<GroupingLevel, string[]>> = {
  'Mathematics': {
    'Beginner': ['Number recognition and counting', 'Basic operations with manipulatives', 'Pattern recognition'],
    'Developing': ['Place value understanding', 'Multi-digit operations', 'Basic word problems'],
    'Proficient': ['Problem-solving strategies', 'Mathematical reasoning', 'Multi-step problems'],
    'Advanced': ['Complex word problems', 'Mathematical proofs', 'Competition mathematics'],
  },
  'English': {
    'Beginner': ['Letter recognition and phonics', 'Basic sight words', 'Simple sentence reading'],
    'Developing': ['Reading fluency practice', 'Vocabulary building', 'Comprehension strategies'],
    'Proficient': ['Inferential comprehension', 'Writing composition', 'Grammar application'],
    'Advanced': ['Critical analysis', 'Creative writing', 'Advanced vocabulary'],
  },
  'Urdu': {
    'Beginner': ['Letter recognition (Urdu alphabet)', 'Basic word reading', 'Simple phrases'],
    'Developing': ['Reading fluency', 'Basic composition', 'Grammar fundamentals'],
    'Proficient': ['Comprehension skills', 'Essay writing', 'Poetry appreciation'],
    'Advanced': ['Literary analysis', 'Creative composition', 'Advanced grammar'],
  },
};

// ============================================================================
// Core Functions
// ============================================================================

/**
 * Determine grouping level based on average score
 */
export function determineGroupingLevel(averageScore: number): GroupingLevel {
  const { thresholds } = aiConfig.grouping;

  if (averageScore <= thresholds.beginner) return 'Beginner';
  if (averageScore <= thresholds.developing) return 'Developing';
  if (averageScore <= thresholds.proficient) return 'Proficient';
  return 'Advanced';
}

/**
 * Get numeric level for a grouping level (for sorting)
 */
function getGroupLevelNumber(level: GroupingLevel): number {
  const levels: Record<GroupingLevel, number> = {
    'Beginner': 1,
    'Developing': 2,
    'Proficient': 3,
    'Advanced': 4,
  };
  return levels[level];
}

/**
 * Prepare student data for grouping
 */
export function prepareStudentForGrouping(
  student: Student,
  results: AssessmentResult[]
): StudentGroupingInput | null {
  const studentResults = results.filter(r => r.studentId === student.id);

  if (studentResults.length === 0) return null;

  // Calculate scores by subject
  const subjectMap = new Map<string, { total: number; count: number }>();

  studentResults.forEach(result => {
    const existing = subjectMap.get(result.subject) || { total: 0, count: 0 };
    subjectMap.set(result.subject, {
      total: existing.total + result.percentage,
      count: existing.count + 1,
    });
  });

  const scores: SubjectScore[] = Array.from(subjectMap.entries()).map(([subject, data]) => ({
    subject,
    percentage: Math.round(data.total / data.count),
    assessmentCount: data.count,
  }));

  // Calculate overall average
  const averageScore = Math.round(
    studentResults.reduce((sum, r) => sum + r.percentage, 0) / studentResults.length
  );

  // Calculate trend from last 3 assessments
  const recentResults = studentResults.slice(-3);
  let recentTrend: 'improving' | 'stable' | 'declining' = 'stable';

  if (recentResults.length >= 2) {
    const first = recentResults[0].percentage;
    const last = recentResults[recentResults.length - 1].percentage;
    const diff = last - first;

    if (diff >= 5) recentTrend = 'improving';
    else if (diff <= -5) recentTrend = 'declining';
  }

  return {
    studentId: student.id,
    studentName: student.name,
    grade: student.grade,
    scores,
    averageScore,
    recentTrend,
  };
}

/**
 * Group students by competency level (TaRL grouping)
 */
export function groupStudentsByCompetency(
  students: StudentGroupingInput[],
  subject?: string
): StudentGroup[] {
  // Filter by subject if specified
  const filteredStudents = subject
    ? students.map(s => ({
        ...s,
        averageScore: s.scores.find(sc => sc.subject === subject)?.percentage ?? s.averageScore,
      }))
    : students;

  // Group students by level
  const groupMap = new Map<GroupingLevel, StudentGroupingInput[]>();

  filteredStudents.forEach(student => {
    const level = determineGroupingLevel(student.averageScore);
    const existing = groupMap.get(level) || [];
    groupMap.set(level, [...existing, student]);
  });

  // Build group objects
  const groups: StudentGroup[] = (['Beginner', 'Developing', 'Proficient', 'Advanced'] as GroupingLevel[])
    .map(level => {
      const template = GROUP_TEMPLATES[level];
      const subjectFocus = subject && SUBJECT_SPECIFIC_FOCUS[subject]
        ? SUBJECT_SPECIFIC_FOCUS[subject][level]
        : template.focusAreas;

      return {
        groupName: level,
        groupLevel: getGroupLevelNumber(level),
        description: template.description,
        color: template.color,
        students: groupMap.get(level) || [],
        recommendedFocus: subjectFocus,
        suggestedActivities: template.activities,
        teachingStrategies: template.strategies,
      };
    })
    .filter(group => group.students.length > 0); // Only return non-empty groups

  return groups;
}

/**
 * Group students for TaRL instruction (main entry point)
 */
export function groupStudentsForTaRL(
  teacherId: string,
  subject?: string,
  grade?: number
): GroupingResult {
  // Get all students for teacher
  let students = getStudents().filter(s => s.teacherId === teacherId);

  // Filter by grade if specified
  if (grade !== undefined) {
    students = students.filter(s => s.grade === grade);
  }

  // Get all results
  const allResults = getAllResults();

  // Filter results by subject if specified
  const results = subject
    ? allResults.filter(r => r.subject === subject)
    : allResults;

  // Prepare students for grouping
  const preparedStudents = students
    .map(s => prepareStudentForGrouping(s, results))
    .filter((s): s is StudentGroupingInput => s !== null);

  // Generate groups
  const groups = groupStudentsByCompetency(preparedStudents, subject);

  return {
    subject: subject || 'All Subjects',
    grade: grade || 0,
    totalStudents: preparedStudents.length,
    groups,
    generatedAt: new Date().toISOString(),
    groupingMethod: 'tarl',
  };
}

/**
 * Generate mixed-ability groups (for collaborative learning)
 */
export function generateMixedAbilityGroups(
  students: StudentGroupingInput[],
  groupSize: number = 4
): StudentGroup[] {
  const { minGroupSize, maxGroupSize } = aiConfig.grouping;

  // Validate group size
  const targetSize = Math.min(Math.max(groupSize, minGroupSize), maxGroupSize);

  // Sort students by score
  const sorted = [...students].sort((a, b) => b.averageScore - a.averageScore);

  // Distribute students into mixed groups using serpentine method
  const numGroups = Math.ceil(sorted.length / targetSize);
  const groups: StudentGroupingInput[][] = Array.from({ length: numGroups }, () => []);

  sorted.forEach((student, index) => {
    const round = Math.floor(index / numGroups);
    const groupIndex = round % 2 === 0
      ? index % numGroups
      : numGroups - 1 - (index % numGroups);
    groups[groupIndex].push(student);
  });

  // Convert to StudentGroup format
  return groups.map((groupStudents, index) => {
    const avgScore = groupStudents.reduce((sum, s) => sum + s.averageScore, 0) / groupStudents.length;
    const level = determineGroupingLevel(avgScore);

    return {
      groupName: `Mixed Group ${index + 1}` as GroupingLevel,
      groupLevel: index + 1,
      description: `Mixed-ability group for collaborative learning (Avg: ${Math.round(avgScore)}%)`,
      color: GROUP_TEMPLATES[level].color,
      students: groupStudents,
      recommendedFocus: [
        'Peer learning and support',
        'Collaborative problem solving',
        'Group discussions',
      ],
      suggestedActivities: [
        'Think-pair-share activities',
        'Jigsaw learning',
        'Group projects',
        'Peer tutoring',
      ],
      teachingStrategies: [
        'Assign roles within groups',
        'Ensure all voices are heard',
        'Facilitate rather than direct',
      ],
    };
  });
}

/**
 * Suggest regrouping based on new assessment data
 */
export function suggestRegrouping(
  currentGroups: StudentGroup[],
  newResults: AssessmentResult[]
): {
  shouldRegroup: boolean;
  reason: string;
  movedStudents: { studentId: string; from: GroupingLevel; to: GroupingLevel }[];
} {
  const movedStudents: { studentId: string; from: GroupingLevel; to: GroupingLevel }[] = [];

  // Check each student in current groups
  currentGroups.forEach(group => {
    group.students.forEach(student => {
      // Find new results for this student
      const studentNewResults = newResults.filter(r => r.studentId === student.studentId);

      if (studentNewResults.length > 0) {
        // Calculate new average including recent results
        const newAverage = Math.round(
          (student.averageScore * student.scores.length +
           studentNewResults.reduce((sum, r) => sum + r.percentage, 0)) /
          (student.scores.length + studentNewResults.length)
        );

        const newLevel = determineGroupingLevel(newAverage);

        if (newLevel !== group.groupName) {
          movedStudents.push({
            studentId: student.studentId,
            from: group.groupName,
            to: newLevel,
          });
        }
      }
    });
  });

  const shouldRegroup = movedStudents.length > 0;
  const reason = shouldRegroup
    ? `${movedStudents.length} student(s) have changed performance levels based on recent assessments`
    : 'All students remain in appropriate groups';

  return { shouldRegroup, reason, movedStudents };
}

/**
 * Get grouping summary statistics
 */
export function getGroupingSummary(groups: StudentGroup[]): {
  totalStudents: number;
  distribution: { level: GroupingLevel; count: number; percentage: number }[];
  averageScore: number;
  needsAttention: number;
} {
  const totalStudents = groups.reduce((sum, g) => sum + g.students.length, 0);

  const distribution = groups.map(g => ({
    level: g.groupName,
    count: g.students.length,
    percentage: totalStudents > 0 ? Math.round((g.students.length / totalStudents) * 100) : 0,
  }));

  const allStudents = groups.flatMap(g => g.students);
  const averageScore = allStudents.length > 0
    ? Math.round(allStudents.reduce((sum, s) => sum + s.averageScore, 0) / allStudents.length)
    : 0;

  const needsAttention = groups
    .filter(g => g.groupName === 'Beginner' || g.groupName === 'Developing')
    .reduce((sum, g) => sum + g.students.length, 0);

  return { totalStudents, distribution, averageScore, needsAttention };
}
