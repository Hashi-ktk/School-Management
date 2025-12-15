import dummyData from "@/data/dummyData.json";
import type { User, Student, Assessment, AssessmentResult, DashboardStats, Question, ScoringResult, StudentFeedback } from "@/types";
import { compareTwoStrings } from 'string-similarity';
import { FUZZY_MATCHING_CONFIG, getThresholdForSubject } from './fuzzyMatchingConfig';
import { generateFeedback } from './feedbackGenerator';

const LOCAL_ASSESSMENTS_KEY = "customAssessments";
const LOCAL_STUDENTS_KEY = "customStudents";
const LOCAL_FEEDBACK_KEY = "studentFeedback";

const safeParse = <T,>(val: string | null): T | null => {
  if (!val) return null;
  try {
    return JSON.parse(val) as T;
  } catch {
    return null;
  }
};

const readStoredAssessments = (): Assessment[] => {
  if (typeof window === "undefined") return [];
  return safeParse<Assessment[]>(localStorage.getItem(LOCAL_ASSESSMENTS_KEY)) ?? [];
};

const writeStoredAssessments = (assessments: Assessment[]) => {
  if (typeof window === "undefined") return;
  localStorage.setItem(LOCAL_ASSESSMENTS_KEY, JSON.stringify(assessments));
};

export function getUsers(): User[] {
  return dummyData.users as User[];
}

const readStoredStudents = (): Student[] => {
  if (typeof window === "undefined") return [];
  return safeParse<Student[]>(localStorage.getItem(LOCAL_STUDENTS_KEY)) ?? [];
};

const writeStoredStudents = (students: Student[]) => {
  if (typeof window === "undefined") return;
  localStorage.setItem(LOCAL_STUDENTS_KEY, JSON.stringify(students));
};

export function getStudents(): Student[] {
  const base = dummyData.students as Student[];
  const stored = readStoredStudents();
  const filteredBase = base.filter((b) => !stored.some((s) => s.id === b.id));
  return [...filteredBase, ...stored];
}

export function getAssessments(): Assessment[] {
  const base = dummyData.assessments as Assessment[];
  const stored = readStoredAssessments();
  const filteredBase = base.filter((b) => !stored.some((s) => s.id === b.id));
  return [...filteredBase, ...stored];
}

export function getAssessmentById(id: string): Assessment | undefined {
  return getAssessments().find((a) => a.id === id);
}

export function createAssessment(payload: {
  title: string;
  subject: Assessment["subject"];
  grade: number;
  duration: number;
  questions: Question[];
  createdBy?: string;
}): Assessment {
  const newAssessment: Assessment = {
    id: `custom-${Date.now()}`,
    createdAt: new Date().toISOString(),
    ...payload,
    createdBy: payload.createdBy || 'system',
  };
  const existing = readStoredAssessments();
  const next = [...existing, newAssessment];
  writeStoredAssessments(next);
  return newAssessment;
}

export function updateAssessment(updated: Assessment): Assessment[] {
  const existing = readStoredAssessments();
  const next = existing.map((a) => (a.id === updated.id ? updated : a));
  writeStoredAssessments(next);
  return next;
}

export function deleteAssessment(id: string): Assessment[] {
  const existing = readStoredAssessments();
  const next = existing.filter((a) => a.id !== id);
  writeStoredAssessments(next);
  return next;
}

export function getResults(): AssessmentResult[] {
  return dummyData.results as AssessmentResult[];
}

export function getStats(): DashboardStats {
  return dummyData.stats as DashboardStats;
}

export function getStudentById(id: string): Student | undefined {
  return getStudents().find((s) => s.id === id);
}

export function createStudent(payload: {
  name: string;
  grade: number;
  schoolId: string;
  teacherId: string;
  subjects: string[];
  avatar?: string;
}): Student {
  const newStudent: Student = {
    id: `custom-student-${Date.now()}`,
    ...payload,
  };
  const existing = readStoredStudents();
  const next = [...existing, newStudent];
  writeStoredStudents(next);
  return newStudent;
}

export function updateStudent(updated: Student): Student[] {
  const existing = readStoredStudents();
  const baseStudents = dummyData.students as Student[];

  // Check if this is a base student (from dummyData)
  const isBaseStudent = baseStudents.some((s) => s.id === updated.id);

  if (isBaseStudent) {
    // If it's a base student, add/update it in stored students
    const index = existing.findIndex((s) => s.id === updated.id);
    if (index >= 0) {
      existing[index] = updated;
    } else {
      existing.push(updated);
    }
  } else {
    // If it's a custom student, just update it
    const index = existing.findIndex((s) => s.id === updated.id);
    if (index >= 0) {
      existing[index] = updated;
    }
  }

  writeStoredStudents(existing);
  return existing;
}

export function deleteStudent(id: string): Student[] {
  const existing = readStoredStudents();
  const next = existing.filter((s) => s.id !== id);
  writeStoredStudents(next);
  return next;
}

export function getResultsByStudent(studentId: string): AssessmentResult[] {
  return getResults().filter((r) => r.studentId === studentId);
}

export function getResultsByAssessment(assessmentId: string): AssessmentResult[] {
  return getResults().filter((r) => r.assessmentId === assessmentId);
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function formatTime(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

// Assessment Attempt Management
const LOCAL_ATTEMPTS_KEY = "assessmentAttempts";
const LOCAL_RESULTS_KEY = "assessmentResults";

const readStoredAttempts = (): import("@/types").AssessmentAttempt[] => {
  if (typeof window === "undefined") return [];
  return safeParse<import("@/types").AssessmentAttempt[]>(localStorage.getItem(LOCAL_ATTEMPTS_KEY)) ?? [];
};

const writeStoredAttempts = (attempts: import("@/types").AssessmentAttempt[]) => {
  if (typeof window === "undefined") return;
  localStorage.setItem(LOCAL_ATTEMPTS_KEY, JSON.stringify(attempts));
};

const readStoredResults = (): import("@/types").AssessmentResult[] => {
  if (typeof window === "undefined") return [];
  return safeParse<import("@/types").AssessmentResult[]>(localStorage.getItem(LOCAL_RESULTS_KEY)) ?? [];
};

const writeStoredResults = (results: import("@/types").AssessmentResult[]) => {
  if (typeof window === "undefined") return;
  localStorage.setItem(LOCAL_RESULTS_KEY, JSON.stringify(results));
};

// Student Feedback Management
const readStoredFeedback = (): StudentFeedback[] => {
  if (typeof window === "undefined") return [];
  return safeParse<StudentFeedback[]>(localStorage.getItem(LOCAL_FEEDBACK_KEY)) ?? [];
};

const writeStoredFeedback = (feedback: StudentFeedback[]) => {
  if (typeof window === "undefined") return;
  localStorage.setItem(LOCAL_FEEDBACK_KEY, JSON.stringify(feedback));
};

/**
 * Save feedback to localStorage
 * @param feedback - StudentFeedback object to save
 */
export function saveFeedback(feedback: StudentFeedback): void {
  const existing = readStoredFeedback();
  const index = existing.findIndex((f) => f.resultId === feedback.resultId);

  if (index >= 0) {
    // Update existing feedback
    existing[index] = feedback;
  } else {
    // Add new feedback
    existing.push(feedback);
  }

  writeStoredFeedback(existing);
}

/**
 * Get feedback for a specific result
 * @param resultId - Assessment result ID
 * @returns StudentFeedback or null if not found
 */
export function getFeedbackForResult(resultId: string): StudentFeedback | null {
  const feedback = readStoredFeedback();
  return feedback.find((f) => f.resultId === resultId) ?? null;
}

/**
 * Get all feedback for a student
 * @param studentId - Student ID
 * @returns Array of StudentFeedback
 */
export function getFeedbackForStudent(studentId: string): StudentFeedback[] {
  const feedback = readStoredFeedback();
  return feedback.filter((f) => f.studentId === studentId);
}

export function getAssessmentAttempt(studentId: string, assessmentId: string): import("@/types").AssessmentAttempt | null {
  const attempts = readStoredAttempts();
  return attempts.find((a) => a.studentId === studentId && a.assessmentId === assessmentId) ?? null;
}

export function saveAssessmentAttempt(attempt: import("@/types").AssessmentAttempt): void {
  const attempts = readStoredAttempts();
  const index = attempts.findIndex((a) => a.studentId === attempt.studentId && a.assessmentId === attempt.assessmentId);

  attempt.lastSaved = new Date().toISOString();

  if (index >= 0) {
    attempts[index] = attempt;
  } else {
    attempts.push(attempt);
  }

  writeStoredAttempts(attempts);
}

export function submitAssessmentAttempt(attempt: import("@/types").AssessmentAttempt): import("@/types").AssessmentResult {
  // Convert attempt to result
  const result: import("@/types").AssessmentResult = {
    id: attempt.id,
    assessmentId: attempt.assessmentId,
    studentId: attempt.studentId,
    studentName: attempt.studentName,
    grade: attempt.grade,
    subject: attempt.subject,
    score: attempt.score,
    totalPoints: attempt.totalPoints,
    percentage: attempt.percentage,
    completedAt: new Date().toISOString(),
    answers: attempt.answers,
    status: 'completed',
  };

  // Generate and save personalized feedback
  const assessment = getAssessmentById(attempt.assessmentId);
  if (assessment) {
    try {
      const generatedFeedback = generateFeedback(result, assessment.questions);

      const studentFeedback: StudentFeedback = {
        id: `feedback-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        resultId: result.id,
        studentId: result.studentId,
        generatedAt: new Date().toISOString(),
        ...generatedFeedback,
      };

      saveFeedback(studentFeedback);
    } catch (error) {
      console.error('Failed to generate feedback:', error);
      // Continue even if feedback generation fails
    }
  }

  // Save result
  const existingResults = getResults();
  const storedResults = readStoredResults();
  const allResults = [...existingResults, ...storedResults, result];
  writeStoredResults(allResults);

  // Remove attempt
  const attempts = readStoredAttempts();
  const filtered = attempts.filter((a) => a.studentId !== attempt.studentId || a.assessmentId !== attempt.assessmentId);
  writeStoredAttempts(filtered);

  return result;
}

export function getAvailableAssessments(studentId: string, grade: number): Assessment[] {
  return getAssessments().filter((a) => a.grade === grade);
}

/**
 * Enhanced answer checking with fuzzy matching for short-answer questions
 * @param question - Question object with type, correct answer, and optional fuzzy settings
 * @param studentAnswer - Student's answer
 * @param subject - Subject name (for subject-specific thresholds)
 * @returns ScoringResult with correctness, similarity score, and matching method
 */
export function checkAnswer(
  question: Question,
  studentAnswer: string | number,
  subject?: string
): ScoringResult {
  switch (question.type) {
    case 'multiple-choice':
    case 'true-false':
      return {
        isCorrect: studentAnswer === question.correctAnswer,
        matchingMethod: 'exact',
      };

    case 'short-answer':
      return checkShortAnswer(question, studentAnswer, subject);

    default:
      return {
        isCorrect: false,
        matchingMethod: 'none',
      };
  }
}

/**
 * Helper function for short-answer checking with fuzzy matching
 * @param question - Question object
 * @param studentAnswer - Student's answer
 * @param subject - Subject name for threshold
 * @returns ScoringResult with fuzzy matching metadata
 */
function checkShortAnswer(
  question: Question,
  studentAnswer: string | number,
  subject?: string
): ScoringResult {
  const studentStr = String(studentAnswer).trim().toLowerCase();
  const correctStr = String(question.correctAnswer).trim().toLowerCase();

  // Step 1: Try exact match first (strictMode optimization)
  if (FUZZY_MATCHING_CONFIG.strictMode && studentStr === correctStr) {
    return {
      isCorrect: true,
      similarityScore: 1.0,
      matchingMethod: 'exact',
    };
  }

  // Step 2: Check if fuzzy matching is enabled (globally or per-question)
  const fuzzyEnabled = FUZZY_MATCHING_CONFIG.enabled || question.fuzzyMatchingEnabled === true;

  if (!fuzzyEnabled) {
    // Fall back to exact match only
    const isExactMatch = studentStr === correctStr;
    return {
      isCorrect: isExactMatch,
      similarityScore: isExactMatch ? 1.0 : 0,
      matchingMethod: 'exact',
    };
  }

  // Step 3: Calculate similarity score using Dice coefficient
  const similarityScore = compareTwoStrings(studentStr, correctStr);

  // Step 4: Determine threshold (question-specific, subject-specific, or default)
  const threshold = getThresholdForSubject(subject || '', question.similarityThreshold);

  // Step 5: Apply threshold
  const isCorrect = similarityScore >= threshold;

  return {
    isCorrect,
    similarityScore,
    matchingMethod: isCorrect ? 'fuzzy' : 'none',
  };
}

export function getAllResults(): import("@/types").AssessmentResult[] {
  const baseResults = getResults();
  const storedResults = readStoredResults();
  return [...baseResults, ...storedResults];
}

