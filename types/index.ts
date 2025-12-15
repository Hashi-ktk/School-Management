export interface User {
  id: string;
  name: string;
  email: string;
  role: 'teacher' | 'admin' | 'student' | 'observer';
  schoolId?: string;
  grade?: number;
}

export interface Student {
  id: string;
  name: string;
  grade: number;
  schoolId: string;
  teacherId: string;
  subjects: string[];
  avatar?: string;
}

export interface Assessment {
  id: string;
  title: string;
  subject: 'Mathematics' | 'English' | 'Urdu';
  grade: number;
  questions: Question[];
  duration: number; // in minutes
  createdAt: string;
  createdBy: string;
}

export interface Question {
  id: string;
  type: 'multiple-choice' | 'true-false' | 'short-answer';
  question: string;
  options?: string[];
  correctAnswer: string | number;
  points: number;
  hint?: string;
  // Fuzzy matching options (for short-answer questions)
  fuzzyMatchingEnabled?: boolean;
  similarityThreshold?: number;
}

export interface AssessmentResult {
  id: string;
  assessmentId: string;
  studentId: string;
  studentName: string;
  grade: number;
  subject: string;
  score: number;
  totalPoints: number;
  percentage: number;
  completedAt: string;
  answers: Answer[];
  status: 'completed' | 'in-progress';
}

export interface Answer {
  questionId: string;
  answer: string | number;
  isCorrect: boolean;
  points: number;
  // Fuzzy matching metadata (for short-answer questions)
  similarityScore?: number;
  matchingMethod?: 'exact' | 'fuzzy' | 'none';
}

// Scoring result with fuzzy matching metadata
export interface ScoringResult {
  isCorrect: boolean;
  similarityScore?: number;
  matchingMethod: 'exact' | 'fuzzy' | 'none';
}

// Student feedback (template-based personalized feedback)
export interface StudentFeedback {
  id: string;
  resultId: string;
  studentId: string;
  generatedAt: string;
  mainMessage: string;
  encouragement: string;
  nextSteps: string[];
  strengthAreas: string[];
  improvementAreas: string[];
  subjectTip: string;
  performanceTier: string;
}

// Generated feedback interface (used during feedback generation)
export interface GeneratedFeedback {
  mainMessage: string;
  encouragement: string;
  nextSteps: string[];
  strengthAreas: string[];
  improvementAreas: string[];
  subjectTip: string;
  performanceTier: string;
}

export interface ClassroomObservation {
  id: string;
  teacherId: string;
  teacherName: string;
  observerId: string;
  observerName: string;
  schoolId: string;
  classGrade: number;
  subject: string;
  observationType: 'Baseline' | 'Formative' | 'Summative';
  date: string;
  preObservationNotes?: string;
  indicators: ObservationIndicator[];
  overallScore: number;
  feedback: string;
  recommendations?: string[];
  status: 'draft' | 'completed';
  createdAt: string;
  updatedAt: string;
}

export interface ObservationIndicator {
  id: string;
  name: string;
  score: number;
  maxScore: number;
  notes: string;
  timestamp?: string;
}

export interface DashboardStats {
  totalStudents: number;
  totalAssessments: number;
  averageScore: number;
  completionRate: number;
  recentActivity: Activity[];
}

export interface Activity {
  id: string;
  type: 'assessment' | 'observation' | 'login';
  description: string;
  timestamp: string;
  userId: string;
  userName: string;
}

export interface AssessmentAttempt extends AssessmentResult {
  startedAt: string;
  timeRemaining: number; // in seconds
  currentQuestionIndex: number;
  lastSaved: string;
}

// Performance tier for grouping recommendations
export type PerformanceTier = 'Proficient' | 'Developing' | 'Needs Support';

// Student performance analytics
export interface StudentAnalytics {
  studentId: string;
  studentName: string;
  averageScore: number;
  performanceTier: PerformanceTier;
  trend: 'improving' | 'stable' | 'declining';
  isAtRisk: boolean;
  totalAssessments: number;
  recentScores: number[]; // Last 3 assessment scores
  lastAssessmentDate: string;
}

// Notification system
export interface Notification {
  id: string;
  type: 'alert' | 'info' | 'success' | 'reminder';
  category: 'at-risk' | 'new-result' | 'deadline' | 'system';
  title: string;
  message: string;
  studentId?: string;
  studentName?: string;
  timestamp: string;
  read: boolean;
  actionUrl?: string;
}

// Task/Reminder
export interface TaskReminder {
  id: string;
  type: 'incomplete-assessment' | 'review-needed' | 'follow-up';
  title: string;
  description: string;
  studentIds: string[];
  count: number;
  priority: 'high' | 'medium' | 'low';
  dueDate?: string;
  createdAt: string;
}

// Performance distribution for charts
export interface PerformanceDistribution {
  tier: PerformanceTier;
  count: number;
  percentage: number;
  color: string;
  icon: string;
}

// ============================================================================
// AI/ML Feature Types
// ============================================================================

// Grouping Level for TaRL
export type GroupingLevel = 'Beginner' | 'Developing' | 'Proficient' | 'Advanced';

// Risk Level for At-Risk Prediction
export type RiskLevel = 'high' | 'medium' | 'low';

// Competency Level for Adaptive Learning
export type CompetencyLevel =
  | 'Below Basic'
  | 'Basic'
  | 'Developing'
  | 'Proficient'
  | 'Advanced'
  | 'Mastery';

// Intervention Priority
export type InterventionPriority = 'critical' | 'high' | 'medium' | 'low';

// Student Group (for TaRL grouping)
export interface StudentGroup {
  groupName: GroupingLevel;
  groupLevel: number;
  description: string;
  color: string;
  students: {
    studentId: string;
    studentName: string;
    averageScore: number;
  }[];
  recommendedFocus: string[];
  suggestedActivities: string[];
}

// Adaptive Session State
export interface AdaptiveSessionState {
  sessionId: string;
  studentId: string;
  subject: string;
  currentAbility: number;
  questionsAnswered: number;
  correctCount: number;
  consecutiveCorrect: number;
  consecutiveIncorrect: number;
}

// Risk Assessment Summary
export interface RiskAssessmentSummary {
  studentId: string;
  studentName: string;
  riskScore: number;
  riskLevel: RiskLevel;
  primaryConcerns: string[];
  recommendedActions: string[];
}

// Intervention Summary
export interface InterventionSummary {
  id: string;
  title: string;
  category: string;
  priority: InterventionPriority;
  targetArea: string;
  estimatedDuration: string;
}


