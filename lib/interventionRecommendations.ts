/**
 * Personalized Intervention Recommendations
 * Automatically generates specific, actionable recommendations for teachers
 * based on student performance data
 */

import { aiConfig, InterventionPriority, InterventionCategory } from './aiConfig';
import { calculatePerformanceTier, calculateTrend } from './teacherAnalytics';
import { getResultsByStudent, getStudentById, getAllResults } from './utils';
import type { AssessmentResult, PerformanceTier } from '@/types';

// ============================================================================
// Types
// ============================================================================

export interface StudentContext {
  studentId: string;
  studentName: string;
  grade: number;
  performanceTier: PerformanceTier;
  trend: 'improving' | 'stable' | 'declining';
  averageScore: number;
  weakSubjects: SubjectPerformance[];
  strongSubjects: SubjectPerformance[];
  questionTypePerformance: QuestionTypePerformance[];
  recentScores: number[];
  totalAssessments: number;
  daysSinceLastAssessment: number;
}

export interface SubjectPerformance {
  subject: string;
  averageScore: number;
  assessmentCount: number;
  trend: 'improving' | 'stable' | 'declining';
  weakAreas?: string[];
}

export interface QuestionTypePerformance {
  type: 'multiple-choice' | 'true-false' | 'short-answer';
  correctRate: number;
  totalQuestions: number;
}

export interface Activity {
  name: string;
  description: string;
  duration: string;
  materials?: string[];
  frequency?: string;
}

export interface Resource {
  name: string;
  type: 'worksheet' | 'video' | 'game' | 'book' | 'online' | 'manipulative';
  description: string;
  url?: string;
}

export interface Checkpoint {
  milestone: string;
  timeframe: string;
  indicator: string;
}

export interface Intervention {
  id: string;
  title: string;
  description: string;
  category: InterventionCategory;
  targetArea: string;
  priority: InterventionPriority;
  activities: Activity[];
  resources: Resource[];
  checkpoints: Checkpoint[];
  estimatedDuration: string;
  rationale: string;
}

export interface InterventionPlan {
  studentId: string;
  studentName: string;
  generatedAt: string;
  context: StudentContext;
  overallPriority: InterventionPriority;
  summary: string;
  interventions: Intervention[];
  quickWins: Intervention[];
  weeklyFocus: WeeklyFocus[];
}

export interface WeeklyFocus {
  week: number;
  focus: string;
  activities: string[];
  goal: string;
}

// ============================================================================
// Intervention Templates
// ============================================================================

const INTERVENTION_TEMPLATES: Record<InterventionCategory, Intervention[]> = {
  'foundational': [
    {
      id: 'found-1',
      title: 'Foundational Skills Bootcamp',
      description: 'Intensive review of basic concepts to build a solid foundation',
      category: 'foundational',
      targetArea: 'Core concepts',
      priority: 'critical',
      activities: [
        {
          name: 'Daily Basics Review',
          description: 'Start each session with 10 minutes of basic concept review',
          duration: '10 minutes',
          frequency: 'Daily',
        },
        {
          name: 'Hands-on Practice',
          description: 'Use manipulatives and visual aids to reinforce concepts',
          duration: '15-20 minutes',
          materials: ['Counting blocks', 'Number cards', 'Visual charts'],
        },
        {
          name: 'One-on-One Support',
          description: 'Individual attention to address specific gaps',
          duration: '15 minutes',
          frequency: '3 times per week',
        },
      ],
      resources: [
        { name: 'Basic Skills Worksheet Pack', type: 'worksheet', description: 'Structured practice sheets for fundamental skills' },
        { name: 'Visual Learning Cards', type: 'manipulative', description: 'Flashcards with visual representations' },
      ],
      checkpoints: [
        { milestone: 'Basic concept recognition', timeframe: 'Week 1', indicator: 'Can identify and name basic concepts' },
        { milestone: 'Simple application', timeframe: 'Week 2', indicator: 'Can apply concepts in simple problems' },
      ],
      estimatedDuration: '2-3 weeks',
      rationale: 'Student needs foundational support before advancing to grade-level content',
    },
  ],
  'skill-gap': [
    {
      id: 'skill-1',
      title: 'Targeted Skill Development',
      description: 'Focused practice on specific skill gaps identified through assessment',
      category: 'skill-gap',
      targetArea: 'Specific skills',
      priority: 'high',
      activities: [
        {
          name: 'Focused Practice Sessions',
          description: 'Dedicated time for practicing the specific skill',
          duration: '20 minutes',
          frequency: 'Daily',
        },
        {
          name: 'Error Analysis',
          description: 'Review mistakes to understand misconceptions',
          duration: '10 minutes',
          frequency: 'After each practice',
        },
        {
          name: 'Peer Practice',
          description: 'Partner work with a peer who has mastered the skill',
          duration: '15 minutes',
          frequency: '2-3 times per week',
        },
      ],
      resources: [
        { name: 'Skill-Specific Worksheets', type: 'worksheet', description: 'Targeted practice materials' },
        { name: 'Interactive Practice Games', type: 'game', description: 'Engaging games to practice skills' },
      ],
      checkpoints: [
        { milestone: 'Skill recognition', timeframe: 'Week 1', indicator: 'Can identify when to use the skill' },
        { milestone: 'Skill application', timeframe: 'Week 2', indicator: 'Can apply skill correctly 70% of time' },
        { milestone: 'Skill mastery', timeframe: 'Week 3', indicator: 'Can apply skill correctly 90% of time' },
      ],
      estimatedDuration: '2-4 weeks',
      rationale: 'Specific skill gaps are preventing progress in related areas',
    },
  ],
  'question-type': [
    {
      id: 'qtype-mcq',
      title: 'Multiple Choice Strategy Training',
      description: 'Develop strategies for answering multiple choice questions effectively',
      category: 'question-type',
      targetArea: 'Multiple choice questions',
      priority: 'medium',
      activities: [
        {
          name: 'Elimination Strategy Practice',
          description: 'Learn to eliminate wrong answers systematically',
          duration: '15 minutes',
          frequency: '3 times per week',
        },
        {
          name: 'Answer Verification',
          description: 'Practice checking answers by plugging back into questions',
          duration: '10 minutes',
          frequency: 'Daily',
        },
      ],
      resources: [
        { name: 'MCQ Strategy Guide', type: 'worksheet', description: 'Step-by-step guide for MCQ strategies' },
      ],
      checkpoints: [
        { milestone: 'Strategy awareness', timeframe: 'Week 1', indicator: 'Can name 3 MCQ strategies' },
        { milestone: 'Strategy application', timeframe: 'Week 2', indicator: 'Uses strategies consistently' },
      ],
      estimatedDuration: '2 weeks',
      rationale: 'Student struggles specifically with multiple choice format',
    },
    {
      id: 'qtype-short',
      title: 'Written Response Development',
      description: 'Improve ability to construct complete written answers',
      category: 'question-type',
      targetArea: 'Short answer questions',
      priority: 'medium',
      activities: [
        {
          name: 'Answer Structure Practice',
          description: 'Learn to structure answers with beginning, middle, and end',
          duration: '15 minutes',
          frequency: 'Daily',
        },
        {
          name: 'Key Word Identification',
          description: 'Practice identifying what the question is asking',
          duration: '10 minutes',
          frequency: 'Daily',
        },
      ],
      resources: [
        { name: 'Answer Templates', type: 'worksheet', description: 'Templates for structuring written responses' },
      ],
      checkpoints: [
        { milestone: 'Complete answers', timeframe: 'Week 1', indicator: 'Provides complete answers' },
        { milestone: 'Clear communication', timeframe: 'Week 2', indicator: 'Answers are clear and organized' },
      ],
      estimatedDuration: '2-3 weeks',
      rationale: 'Student has difficulty expressing knowledge in written form',
    },
  ],
  'consistency': [
    {
      id: 'consist-1',
      title: 'Building Learning Consistency',
      description: 'Develop consistent study habits and reduce performance variability',
      category: 'consistency',
      targetArea: 'Study habits',
      priority: 'medium',
      activities: [
        {
          name: 'Daily Mini-Practice',
          description: 'Short, consistent daily practice sessions',
          duration: '10-15 minutes',
          frequency: 'Daily',
        },
        {
          name: 'Progress Journaling',
          description: 'Keep a simple log of daily learning',
          duration: '5 minutes',
          frequency: 'Daily',
        },
        {
          name: 'Weekly Review',
          description: 'Review week\'s learning every Friday',
          duration: '20 minutes',
          frequency: 'Weekly',
        },
      ],
      resources: [
        { name: 'Progress Tracker', type: 'worksheet', description: 'Simple chart to track daily practice' },
        { name: 'Study Schedule Template', type: 'worksheet', description: 'Weekly study planner' },
      ],
      checkpoints: [
        { milestone: 'Habit formation', timeframe: 'Week 2', indicator: 'Completes daily practice 80% of days' },
        { milestone: 'Reduced variability', timeframe: 'Week 4', indicator: 'Score variance decreases by 50%' },
      ],
      estimatedDuration: '4 weeks',
      rationale: 'Inconsistent performance suggests need for regular practice habits',
    },
  ],
  'advancement': [
    {
      id: 'advance-1',
      title: 'Enrichment and Extension',
      description: 'Challenge activities for students performing above grade level',
      category: 'advancement',
      targetArea: 'Advanced skills',
      priority: 'low',
      activities: [
        {
          name: 'Challenge Problems',
          description: 'Complex, multi-step problems that extend learning',
          duration: '20-30 minutes',
          frequency: '3 times per week',
        },
        {
          name: 'Peer Teaching',
          description: 'Help classmates understand concepts',
          duration: '15 minutes',
          frequency: '2 times per week',
        },
        {
          name: 'Independent Projects',
          description: 'Self-directed learning on topics of interest',
          duration: '30 minutes',
          frequency: 'Weekly',
        },
      ],
      resources: [
        { name: 'Advanced Problem Set', type: 'worksheet', description: 'Challenging problems beyond grade level' },
        { name: 'Extension Reading', type: 'book', description: 'Advanced topic materials' },
      ],
      checkpoints: [
        { milestone: 'Challenge engagement', timeframe: 'Ongoing', indicator: 'Actively engages with advanced material' },
        { milestone: 'Leadership', timeframe: 'Ongoing', indicator: 'Effectively helps peers' },
      ],
      estimatedDuration: 'Ongoing',
      rationale: 'Student is ready for more challenging material',
    },
  ],
};

const SUBJECT_SPECIFIC_INTERVENTIONS: Record<string, Partial<Record<InterventionCategory, Intervention>>> = {
  'Mathematics': {
    'foundational': {
      id: 'math-found',
      title: 'Math Foundations Builder',
      description: 'Build strong number sense and basic math operations',
      category: 'foundational',
      targetArea: 'Number sense and operations',
      priority: 'critical',
      activities: [
        { name: 'Number Talks', description: 'Daily mental math discussions', duration: '10 minutes', frequency: 'Daily' },
        { name: 'Manipulative Practice', description: 'Use blocks and counters for operations', duration: '15 minutes', frequency: 'Daily' },
        { name: 'Fact Fluency Games', description: 'Fun games to build automaticity', duration: '10 minutes', frequency: 'Daily' },
      ],
      resources: [
        { name: 'Base Ten Blocks', type: 'manipulative', description: 'For place value and operations' },
        { name: 'Math Fact Cards', type: 'manipulative', description: 'Flashcards for basic facts' },
      ],
      checkpoints: [
        { milestone: 'Number recognition', timeframe: 'Week 1', indicator: 'Recognizes numbers to 100' },
        { milestone: 'Basic operations', timeframe: 'Week 3', indicator: 'Completes basic operations correctly' },
      ],
      estimatedDuration: '3-4 weeks',
      rationale: 'Strong number sense is essential for all math learning',
    },
    'skill-gap': {
      id: 'math-skill',
      title: 'Math Skill Gap Closer',
      description: 'Targeted practice for specific math skills',
      category: 'skill-gap',
      targetArea: 'Specific math skills',
      priority: 'high',
      activities: [
        { name: 'Worked Examples', description: 'Study step-by-step solutions', duration: '10 minutes', frequency: 'Daily' },
        { name: 'Guided Practice', description: 'Practice with scaffolded support', duration: '15 minutes', frequency: 'Daily' },
        { name: 'Problem Solving', description: 'Apply skills to word problems', duration: '15 minutes', frequency: '3 times per week' },
      ],
      resources: [
        { name: 'Skill Practice Sheets', type: 'worksheet', description: 'Focused practice on specific skills' },
      ],
      checkpoints: [
        { milestone: 'Procedure understanding', timeframe: 'Week 1', indicator: 'Can explain the procedure' },
        { milestone: 'Accurate application', timeframe: 'Week 2', indicator: '80% accuracy on skill' },
      ],
      estimatedDuration: '2-3 weeks',
      rationale: 'Filling specific skill gaps enables progress',
    },
  },
  'English': {
    'foundational': {
      id: 'eng-found',
      title: 'Reading Foundations',
      description: 'Build phonemic awareness and basic reading skills',
      category: 'foundational',
      targetArea: 'Reading fundamentals',
      priority: 'critical',
      activities: [
        { name: 'Phonics Practice', description: 'Daily letter-sound practice', duration: '10 minutes', frequency: 'Daily' },
        { name: 'Sight Word Review', description: 'Practice high-frequency words', duration: '10 minutes', frequency: 'Daily' },
        { name: 'Guided Reading', description: 'Read with support at appropriate level', duration: '15 minutes', frequency: 'Daily' },
      ],
      resources: [
        { name: 'Decodable Readers', type: 'book', description: 'Books for practicing phonics' },
        { name: 'Sight Word Cards', type: 'manipulative', description: 'Flashcards for sight words' },
      ],
      checkpoints: [
        { milestone: 'Letter sounds', timeframe: 'Week 2', indicator: 'Knows all letter sounds' },
        { milestone: 'Word decoding', timeframe: 'Week 4', indicator: 'Decodes CVC words' },
      ],
      estimatedDuration: '4-6 weeks',
      rationale: 'Strong phonics foundation is essential for reading',
    },
  },
  'Urdu': {
    'foundational': {
      id: 'urdu-found',
      title: 'Urdu Reading Foundations',
      description: 'Build Urdu letter recognition and basic reading skills',
      category: 'foundational',
      targetArea: 'Urdu literacy fundamentals',
      priority: 'critical',
      activities: [
        { name: 'Letter Practice', description: 'Daily Urdu letter writing and recognition', duration: '10 minutes', frequency: 'Daily' },
        { name: 'Word Building', description: 'Form words from letters', duration: '10 minutes', frequency: 'Daily' },
        { name: 'Read Aloud', description: 'Practice reading Urdu texts aloud', duration: '15 minutes', frequency: 'Daily' },
      ],
      resources: [
        { name: 'Urdu Letter Cards', type: 'manipulative', description: 'Cards for letter practice' },
        { name: 'Simple Urdu Readers', type: 'book', description: 'Easy Urdu reading books' },
      ],
      checkpoints: [
        { milestone: 'Letter recognition', timeframe: 'Week 2', indicator: 'Recognizes all Urdu letters' },
        { milestone: 'Simple word reading', timeframe: 'Week 4', indicator: 'Reads simple 2-3 letter words' },
      ],
      estimatedDuration: '4-6 weeks',
      rationale: 'Strong letter foundation is essential for Urdu literacy',
    },
  },
};

// ============================================================================
// Core Functions
// ============================================================================

/**
 * Build student context from assessment data
 */
export function buildStudentContext(studentId: string): StudentContext | null {
  const student = getStudentById(studentId);
  if (!student) return null;

  const results = getResultsByStudent(studentId);
  if (results.length === 0) return null;

  // Calculate overall metrics
  const scores = results.map(r => r.percentage);
  const averageScore = Math.round(scores.reduce((sum, s) => sum + s, 0) / scores.length);
  const performanceTier = calculatePerformanceTier(averageScore);
  const trend = calculateTrend(scores);

  // Calculate subject performance
  const subjectMap = new Map<string, { scores: number[]; results: AssessmentResult[] }>();
  results.forEach(r => {
    const existing = subjectMap.get(r.subject) || { scores: [], results: [] };
    existing.scores.push(r.percentage);
    existing.results.push(r);
    subjectMap.set(r.subject, existing);
  });

  const subjectPerformances: SubjectPerformance[] = Array.from(subjectMap.entries()).map(([subject, data]) => ({
    subject,
    averageScore: Math.round(data.scores.reduce((sum, s) => sum + s, 0) / data.scores.length),
    assessmentCount: data.scores.length,
    trend: calculateTrend(data.scores),
  }));

  const weakSubjects = subjectPerformances.filter(s => s.averageScore < 60);
  const strongSubjects = subjectPerformances.filter(s => s.averageScore >= 80);

  // Calculate question type performance
  const questionTypeMap = new Map<string, { correct: number; total: number }>();
  results.forEach(r => {
    r.answers.forEach(a => {
      // We'd need the question type here - for now, use a placeholder
      const type = 'multiple-choice'; // Default
      const existing = questionTypeMap.get(type) || { correct: 0, total: 0 };
      existing.total++;
      if (a.isCorrect) existing.correct++;
      questionTypeMap.set(type, existing);
    });
  });

  const questionTypePerformance: QuestionTypePerformance[] = Array.from(questionTypeMap.entries()).map(([type, data]) => ({
    type: type as QuestionTypePerformance['type'],
    correctRate: data.total > 0 ? Math.round((data.correct / data.total) * 100) : 0,
    totalQuestions: data.total,
  }));

  // Calculate days since last assessment
  const lastResult = results[results.length - 1];
  const daysSince = Math.floor(
    (Date.now() - new Date(lastResult.completedAt).getTime()) / (1000 * 60 * 60 * 24)
  );

  return {
    studentId,
    studentName: student.name,
    grade: student.grade,
    performanceTier,
    trend,
    averageScore,
    weakSubjects,
    strongSubjects,
    questionTypePerformance,
    recentScores: scores.slice(-5),
    totalAssessments: results.length,
    daysSinceLastAssessment: daysSince,
  };
}

/**
 * Analyze student needs and determine intervention priorities
 */
export function analyzeStudentNeeds(context: StudentContext): {
  primaryNeeds: InterventionCategory[];
  urgency: InterventionPriority;
  focusAreas: string[];
} {
  const primaryNeeds: InterventionCategory[] = [];
  const focusAreas: string[] = [];
  let urgency: InterventionPriority = 'low';

  // Check for foundational needs
  if (context.averageScore < 40 || context.performanceTier === 'Needs Support') {
    primaryNeeds.push('foundational');
    focusAreas.push('Basic concept understanding');
    urgency = 'critical';
  }

  // Check for specific skill gaps
  if (context.weakSubjects.length > 0) {
    primaryNeeds.push('skill-gap');
    context.weakSubjects.forEach(s => {
      focusAreas.push(`${s.subject} skills improvement`);
    });
    if (urgency !== 'critical') urgency = 'high';
  }

  // Check for question type struggles
  const weakQuestionTypes = context.questionTypePerformance.filter(qt => qt.correctRate < 60);
  if (weakQuestionTypes.length > 0) {
    primaryNeeds.push('question-type');
    weakQuestionTypes.forEach(qt => {
      focusAreas.push(`${qt.type} question strategies`);
    });
    if (urgency === 'low') urgency = 'medium';
  }

  // Check for consistency issues
  if (context.recentScores.length >= 3) {
    const variance = calculateScoreVariance(context.recentScores);
    if (variance > 20) {
      primaryNeeds.push('consistency');
      focusAreas.push('Building consistent study habits');
    }
  }

  // Check for advancement needs
  if (context.averageScore >= 90 && context.performanceTier === 'Proficient') {
    primaryNeeds.push('advancement');
    focusAreas.push('Enrichment and challenge activities');
  }

  // Default if no specific needs identified
  if (primaryNeeds.length === 0) {
    primaryNeeds.push('skill-gap');
    focusAreas.push('General skill reinforcement');
  }

  return { primaryNeeds, urgency, focusAreas };
}

/**
 * Generate interventions based on student needs
 */
export function generateInterventions(context: StudentContext): Intervention[] {
  const { primaryNeeds } = analyzeStudentNeeds(context);
  const interventions: Intervention[] = [];

  primaryNeeds.forEach(need => {
    // Try to get subject-specific intervention first
    const weakestSubject = context.weakSubjects[0]?.subject;
    if (weakestSubject && SUBJECT_SPECIFIC_INTERVENTIONS[weakestSubject]?.[need]) {
      interventions.push({
        ...SUBJECT_SPECIFIC_INTERVENTIONS[weakestSubject][need]!,
        id: `${SUBJECT_SPECIFIC_INTERVENTIONS[weakestSubject][need]!.id}-${Date.now()}`,
      });
    } else {
      // Fall back to generic intervention
      const templates = INTERVENTION_TEMPLATES[need];
      if (templates && templates.length > 0) {
        interventions.push({
          ...templates[0],
          id: `${templates[0].id}-${Date.now()}`,
        });
      }
    }
  });

  return interventions;
}

/**
 * Prioritize interventions based on impact and urgency
 */
export function prioritizeInterventions(interventions: Intervention[]): Intervention[] {
  const priorityOrder: Record<InterventionPriority, number> = {
    'critical': 0,
    'high': 1,
    'medium': 2,
    'low': 3,
  };

  return [...interventions].sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
}

/**
 * Create complete intervention plan for a student
 */
export function createInterventionPlan(studentId: string): InterventionPlan | null {
  const context = buildStudentContext(studentId);
  if (!context) return null;

  const { urgency, focusAreas } = analyzeStudentNeeds(context);
  const interventions = generateInterventions(context);
  const prioritized = prioritizeInterventions(interventions);

  // Limit to max recommendations
  const limited = prioritized.slice(0, aiConfig.interventions.maxRecommendations);

  // Identify quick wins (low effort, medium impact)
  const quickWins = limited.filter(i => i.priority === 'medium' || i.priority === 'low');

  // Generate weekly focus plan
  const weeklyFocus = generateWeeklyFocus(limited, focusAreas);

  // Generate summary
  const summary = generatePlanSummary(context, limited);

  return {
    studentId,
    studentName: context.studentName,
    generatedAt: new Date().toISOString(),
    context,
    overallPriority: urgency,
    summary,
    interventions: limited,
    quickWins,
    weeklyFocus,
  };
}

/**
 * Generate weekly focus schedule from interventions
 */
function generateWeeklyFocus(interventions: Intervention[], focusAreas: string[]): WeeklyFocus[] {
  const weeks: WeeklyFocus[] = [];

  for (let week = 1; week <= 4; week++) {
    const intervention = interventions[Math.min(week - 1, interventions.length - 1)];

    weeks.push({
      week,
      focus: focusAreas[Math.min(week - 1, focusAreas.length - 1)] || intervention?.targetArea || 'General practice',
      activities: intervention?.activities.slice(0, 3).map(a => a.name) || ['Daily practice', 'Review sessions'],
      goal: intervention?.checkpoints[0]?.indicator || 'Improve understanding',
    });
  }

  return weeks;
}

/**
 * Generate plan summary text
 */
function generatePlanSummary(context: StudentContext, interventions: Intervention[]): string {
  const parts: string[] = [];

  parts.push(`${context.studentName} is currently performing at the "${context.performanceTier}" level`);
  parts.push(`with an average score of ${context.averageScore}%`);

  if (context.trend === 'improving') {
    parts.push('and showing improvement');
  } else if (context.trend === 'declining') {
    parts.push('but showing a declining trend');
  }

  parts.push('.');

  if (context.weakSubjects.length > 0) {
    parts.push(` Focus areas include: ${context.weakSubjects.map(s => s.subject).join(', ')}.`);
  }

  parts.push(` This plan includes ${interventions.length} targeted interventions.`);

  return parts.join('');
}

/**
 * Calculate variance of scores
 */
function calculateScoreVariance(scores: number[]): number {
  if (scores.length < 2) return 0;

  const mean = scores.reduce((sum, s) => sum + s, 0) / scores.length;
  const squaredDiffs = scores.map(s => Math.pow(s - mean, 2));
  return Math.sqrt(squaredDiffs.reduce((sum, d) => sum + d, 0) / scores.length);
}

/**
 * Get intervention plans for all at-risk students
 */
export function getAtRiskInterventionPlans(teacherId: string): InterventionPlan[] {
  const allResults = getAllResults();
  const studentIds = [...new Set(allResults.map(r => r.studentId))];

  const plans: InterventionPlan[] = [];

  studentIds.forEach(studentId => {
    const context = buildStudentContext(studentId);
    if (context && (context.performanceTier === 'Needs Support' || context.averageScore < 60)) {
      const plan = createInterventionPlan(studentId);
      if (plan) plans.push(plan);
    }
  });

  // Sort by urgency
  return plans.sort((a, b) => {
    const priorityOrder: Record<InterventionPriority, number> = {
      'critical': 0,
      'high': 1,
      'medium': 2,
      'low': 3,
    };
    return priorityOrder[a.overallPriority] - priorityOrder[b.overallPriority];
  });
}
