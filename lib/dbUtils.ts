/**
 * Database utility functions using Prisma
 * Replaces the JSON-based utils.ts with database operations
 */

import prisma from './db';
import type {
  User,
  Student,
  Assessment,
  AssessmentResult,
  DashboardStats,
  Question,
  ScoringResult,
  StudentFeedback,
  ClassroomObservation,
  Activity
} from '@/types';
import { compareTwoStrings } from 'string-similarity';
import { FUZZY_MATCHING_CONFIG, getThresholdForSubject } from './fuzzyMatchingConfig';
import { generateFeedback } from './feedbackGenerator';

// ==================== USER FUNCTIONS ====================

export async function getUsers(): Promise<User[]> {
  const users = await prisma.user.findMany({
    orderBy: { name: 'asc' },
  });
  return users as User[];
}

export async function getUserById(id: string): Promise<User | null> {
  const user = await prisma.user.findUnique({
    where: { id },
  });
  return user as User | null;
}

export async function getUserByEmail(email: string): Promise<User | null> {
  const user = await prisma.user.findUnique({
    where: { email },
  });
  return user as User | null;
}

// ==================== STUDENT FUNCTIONS ====================

export async function getStudents(): Promise<Student[]> {
  const students = await prisma.student.findMany({
    include: {
      subjects: true,
    },
    orderBy: { name: 'asc' },
  });

  return students.map(s => ({
    id: s.id,
    name: s.name,
    grade: s.grade,
    schoolId: s.schoolId,
    teacherId: s.teacherId,
    avatar: s.avatar || undefined,
    subjects: s.subjects.map(sub => sub.subject),
  }));
}

export async function getStudentById(id: string): Promise<Student | null> {
  const student = await prisma.student.findUnique({
    where: { id },
    include: {
      subjects: true,
    },
  });

  if (!student) return null;

  return {
    id: student.id,
    name: student.name,
    grade: student.grade,
    schoolId: student.schoolId,
    teacherId: student.teacherId,
    avatar: student.avatar || undefined,
    subjects: student.subjects.map(sub => sub.subject),
  };
}

export async function createStudent(payload: {
  name: string;
  grade: number;
  schoolId: string;
  teacherId: string;
  subjects: string[];
  avatar?: string;
}): Promise<Student> {
  const student = await prisma.student.create({
    data: {
      id: `student-${Date.now()}`,
      name: payload.name,
      grade: payload.grade,
      schoolId: payload.schoolId,
      teacherId: payload.teacherId,
      avatar: payload.avatar,
      subjects: {
        create: payload.subjects.map(subject => ({ subject })),
      },
    },
    include: {
      subjects: true,
    },
  });

  return {
    id: student.id,
    name: student.name,
    grade: student.grade,
    schoolId: student.schoolId,
    teacherId: student.teacherId,
    avatar: student.avatar || undefined,
    subjects: student.subjects.map(sub => sub.subject),
  };
}

export async function updateStudent(id: string, data: Partial<Student>): Promise<Student | null> {
  // Delete existing subjects and create new ones if subjects are being updated
  if (data.subjects) {
    await prisma.studentSubject.deleteMany({
      where: { studentId: id },
    });
  }

  const student = await prisma.student.update({
    where: { id },
    data: {
      name: data.name,
      grade: data.grade,
      schoolId: data.schoolId,
      teacherId: data.teacherId,
      avatar: data.avatar,
      ...(data.subjects && {
        subjects: {
          create: data.subjects.map(subject => ({ subject })),
        },
      }),
    },
    include: {
      subjects: true,
    },
  });

  return {
    id: student.id,
    name: student.name,
    grade: student.grade,
    schoolId: student.schoolId,
    teacherId: student.teacherId,
    avatar: student.avatar || undefined,
    subjects: student.subjects.map(sub => sub.subject),
  };
}

export async function deleteStudent(id: string): Promise<void> {
  await prisma.student.delete({
    where: { id },
  });
}

// ==================== ASSESSMENT FUNCTIONS ====================

export async function getAssessments(): Promise<Assessment[]> {
  const assessments = await prisma.assessment.findMany({
    include: {
      questions: {
        orderBy: { orderIndex: 'asc' },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return assessments.map(a => ({
    id: a.id,
    title: a.title,
    subject: a.subject as 'Mathematics' | 'English' | 'Urdu',
    grade: a.grade,
    duration: a.duration,
    createdAt: a.createdAt.toISOString(),
    createdBy: a.createdBy,
    questions: a.questions.map(q => ({
      id: q.id.replace(`${a.id}-`, ''), // Remove assessment prefix from question ID
      type: q.type as 'multiple-choice' | 'true-false' | 'short-answer',
      question: q.question,
      options: q.options ? JSON.parse(q.options) : undefined,
      correctAnswer: isNaN(Number(q.correctAnswer)) ? q.correctAnswer : Number(q.correctAnswer),
      points: q.points,
      hint: q.hint || undefined,
      fuzzyMatchingEnabled: q.fuzzyMatchingEnabled,
      similarityThreshold: q.similarityThreshold || undefined,
    })),
  }));
}

export async function getAssessmentById(id: string): Promise<Assessment | null> {
  const assessment = await prisma.assessment.findUnique({
    where: { id },
    include: {
      questions: {
        orderBy: { orderIndex: 'asc' },
      },
    },
  });

  if (!assessment) return null;

  return {
    id: assessment.id,
    title: assessment.title,
    subject: assessment.subject as 'Mathematics' | 'English' | 'Urdu',
    grade: assessment.grade,
    duration: assessment.duration,
    createdAt: assessment.createdAt.toISOString(),
    createdBy: assessment.createdBy,
    questions: assessment.questions.map(q => ({
      id: q.id.replace(`${assessment.id}-`, ''),
      type: q.type as 'multiple-choice' | 'true-false' | 'short-answer',
      question: q.question,
      options: q.options ? JSON.parse(q.options) : undefined,
      correctAnswer: isNaN(Number(q.correctAnswer)) ? q.correctAnswer : Number(q.correctAnswer),
      points: q.points,
      hint: q.hint || undefined,
      fuzzyMatchingEnabled: q.fuzzyMatchingEnabled,
      similarityThreshold: q.similarityThreshold || undefined,
    })),
  };
}

export async function createAssessment(payload: {
  title: string;
  subject: Assessment['subject'];
  grade: number;
  duration: number;
  questions: Question[];
  createdBy?: string;
}): Promise<Assessment> {
  const id = `assessment-${Date.now()}`;

  const assessment = await prisma.assessment.create({
    data: {
      id,
      title: payload.title,
      subject: payload.subject,
      grade: payload.grade,
      duration: payload.duration,
      createdBy: payload.createdBy || 'system',
      questions: {
        create: payload.questions.map((q, index) => ({
          id: `${id}-${q.id}`,
          type: q.type,
          question: q.question,
          options: q.options ? JSON.stringify(q.options) : null,
          correctAnswer: String(q.correctAnswer),
          points: q.points,
          hint: q.hint || null,
          fuzzyMatchingEnabled: q.fuzzyMatchingEnabled || false,
          similarityThreshold: q.similarityThreshold || null,
          orderIndex: index,
        })),
      },
    },
    include: {
      questions: {
        orderBy: { orderIndex: 'asc' },
      },
    },
  });

  return {
    id: assessment.id,
    title: assessment.title,
    subject: assessment.subject as 'Mathematics' | 'English' | 'Urdu',
    grade: assessment.grade,
    duration: assessment.duration,
    createdAt: assessment.createdAt.toISOString(),
    createdBy: assessment.createdBy,
    questions: assessment.questions.map(q => ({
      id: q.id.replace(`${assessment.id}-`, ''),
      type: q.type as 'multiple-choice' | 'true-false' | 'short-answer',
      question: q.question,
      options: q.options ? JSON.parse(q.options) : undefined,
      correctAnswer: isNaN(Number(q.correctAnswer)) ? q.correctAnswer : Number(q.correctAnswer),
      points: q.points,
      hint: q.hint || undefined,
      fuzzyMatchingEnabled: q.fuzzyMatchingEnabled,
      similarityThreshold: q.similarityThreshold || undefined,
    })),
  };
}

export async function updateAssessment(id: string, data: Partial<Assessment>): Promise<Assessment | null> {
  // If questions are being updated, delete existing and create new
  if (data.questions) {
    await prisma.question.deleteMany({
      where: { assessmentId: id },
    });
  }

  const assessment = await prisma.assessment.update({
    where: { id },
    data: {
      title: data.title,
      subject: data.subject,
      grade: data.grade,
      duration: data.duration,
      ...(data.questions && {
        questions: {
          create: data.questions.map((q, index) => ({
            id: `${id}-${q.id}`,
            type: q.type,
            question: q.question,
            options: q.options ? JSON.stringify(q.options) : null,
            correctAnswer: String(q.correctAnswer),
            points: q.points,
            hint: q.hint || null,
            fuzzyMatchingEnabled: q.fuzzyMatchingEnabled || false,
            similarityThreshold: q.similarityThreshold || null,
            orderIndex: index,
          })),
        },
      }),
    },
    include: {
      questions: {
        orderBy: { orderIndex: 'asc' },
      },
    },
  });

  return {
    id: assessment.id,
    title: assessment.title,
    subject: assessment.subject as 'Mathematics' | 'English' | 'Urdu',
    grade: assessment.grade,
    duration: assessment.duration,
    createdAt: assessment.createdAt.toISOString(),
    createdBy: assessment.createdBy,
    questions: assessment.questions.map(q => ({
      id: q.id.replace(`${assessment.id}-`, ''),
      type: q.type as 'multiple-choice' | 'true-false' | 'short-answer',
      question: q.question,
      options: q.options ? JSON.parse(q.options) : undefined,
      correctAnswer: isNaN(Number(q.correctAnswer)) ? q.correctAnswer : Number(q.correctAnswer),
      points: q.points,
      hint: q.hint || undefined,
      fuzzyMatchingEnabled: q.fuzzyMatchingEnabled,
      similarityThreshold: q.similarityThreshold || undefined,
    })),
  };
}

export async function deleteAssessment(id: string): Promise<void> {
  await prisma.assessment.delete({
    where: { id },
  });
}

// ==================== RESULTS FUNCTIONS ====================

export async function getResults(): Promise<AssessmentResult[]> {
  const results = await prisma.assessmentResult.findMany({
    include: {
      answers: true,
    },
    orderBy: { completedAt: 'desc' },
  });

  return results.map(r => ({
    id: r.id,
    assessmentId: r.assessmentId,
    studentId: r.studentId,
    studentName: r.studentName,
    grade: r.grade,
    subject: r.subject,
    score: r.score,
    totalPoints: r.totalPoints,
    percentage: r.percentage,
    completedAt: r.completedAt.toISOString(),
    status: r.status as 'completed' | 'in-progress',
    answers: r.answers.map(a => ({
      questionId: a.questionId,
      answer: isNaN(Number(a.answer)) ? a.answer : Number(a.answer),
      isCorrect: a.isCorrect,
      points: a.points,
      similarityScore: a.similarityScore || undefined,
      matchingMethod: a.matchingMethod as 'exact' | 'fuzzy' | 'none' | undefined,
    })),
  }));
}

export async function getResultsByStudent(studentId: string): Promise<AssessmentResult[]> {
  const results = await prisma.assessmentResult.findMany({
    where: { studentId },
    include: {
      answers: true,
    },
    orderBy: { completedAt: 'desc' },
  });

  return results.map(r => ({
    id: r.id,
    assessmentId: r.assessmentId,
    studentId: r.studentId,
    studentName: r.studentName,
    grade: r.grade,
    subject: r.subject,
    score: r.score,
    totalPoints: r.totalPoints,
    percentage: r.percentage,
    completedAt: r.completedAt.toISOString(),
    status: r.status as 'completed' | 'in-progress',
    answers: r.answers.map(a => ({
      questionId: a.questionId,
      answer: isNaN(Number(a.answer)) ? a.answer : Number(a.answer),
      isCorrect: a.isCorrect,
      points: a.points,
      similarityScore: a.similarityScore || undefined,
      matchingMethod: a.matchingMethod as 'exact' | 'fuzzy' | 'none' | undefined,
    })),
  }));
}

export async function getResultsByAssessment(assessmentId: string): Promise<AssessmentResult[]> {
  const results = await prisma.assessmentResult.findMany({
    where: { assessmentId },
    include: {
      answers: true,
    },
    orderBy: { completedAt: 'desc' },
  });

  return results.map(r => ({
    id: r.id,
    assessmentId: r.assessmentId,
    studentId: r.studentId,
    studentName: r.studentName,
    grade: r.grade,
    subject: r.subject,
    score: r.score,
    totalPoints: r.totalPoints,
    percentage: r.percentage,
    completedAt: r.completedAt.toISOString(),
    status: r.status as 'completed' | 'in-progress',
    answers: r.answers.map(a => ({
      questionId: a.questionId,
      answer: isNaN(Number(a.answer)) ? a.answer : Number(a.answer),
      isCorrect: a.isCorrect,
      points: a.points,
      similarityScore: a.similarityScore || undefined,
      matchingMethod: a.matchingMethod as 'exact' | 'fuzzy' | 'none' | undefined,
    })),
  }));
}

export async function createResult(result: AssessmentResult): Promise<AssessmentResult> {
  const created = await prisma.assessmentResult.create({
    data: {
      id: result.id,
      assessmentId: result.assessmentId,
      studentId: result.studentId,
      studentName: result.studentName,
      grade: result.grade,
      subject: result.subject,
      score: result.score,
      totalPoints: result.totalPoints,
      percentage: result.percentage,
      completedAt: new Date(result.completedAt),
      status: result.status,
      answers: {
        create: result.answers.map(a => ({
          questionId: a.questionId,
          answer: String(a.answer),
          isCorrect: a.isCorrect,
          points: a.points,
          similarityScore: a.similarityScore || null,
          matchingMethod: a.matchingMethod || null,
        })),
      },
    },
    include: {
      answers: true,
    },
  });

  return {
    id: created.id,
    assessmentId: created.assessmentId,
    studentId: created.studentId,
    studentName: created.studentName,
    grade: created.grade,
    subject: created.subject,
    score: created.score,
    totalPoints: created.totalPoints,
    percentage: created.percentage,
    completedAt: created.completedAt.toISOString(),
    status: created.status as 'completed' | 'in-progress',
    answers: created.answers.map(a => ({
      questionId: a.questionId,
      answer: isNaN(Number(a.answer)) ? a.answer : Number(a.answer),
      isCorrect: a.isCorrect,
      points: a.points,
      similarityScore: a.similarityScore || undefined,
      matchingMethod: a.matchingMethod as 'exact' | 'fuzzy' | 'none' | undefined,
    })),
  };
}

// ==================== STATS FUNCTIONS ====================

export async function getStats(): Promise<DashboardStats> {
  const [
    totalStudents,
    totalAssessments,
    results,
    activities,
  ] = await Promise.all([
    prisma.student.count(),
    prisma.assessment.count(),
    prisma.assessmentResult.findMany({
      where: { status: 'completed' },
      select: { percentage: true },
    }),
    prisma.activity.findMany({
      orderBy: { timestamp: 'desc' },
      take: 10,
    }),
  ]);

  const averageScore = results.length > 0
    ? results.reduce((sum, r) => sum + r.percentage, 0) / results.length
    : 0;

  const completedCount = results.length;
  const completionRate = totalAssessments > 0
    ? (completedCount / (totalStudents * totalAssessments)) * 100
    : 0;

  return {
    totalStudents,
    totalAssessments,
    averageScore: Math.round(averageScore),
    completionRate: Math.round(completionRate),
    recentActivity: activities.map(a => ({
      id: a.id,
      type: a.type as 'assessment' | 'observation' | 'login',
      description: a.description,
      timestamp: a.timestamp.toISOString(),
      userId: a.userId,
      userName: a.userName,
    })),
  };
}

// ==================== OBSERVATION FUNCTIONS ====================

export async function getObservations(): Promise<ClassroomObservation[]> {
  const observations = await prisma.classroomObservation.findMany({
    include: {
      indicators: true,
    },
    orderBy: { date: 'desc' },
  });

  return observations.map(o => ({
    id: o.id,
    teacherId: o.teacherId,
    teacherName: o.teacherName,
    observerId: o.observerId,
    observerName: o.observerName,
    schoolId: o.schoolId,
    classGrade: o.classGrade,
    subject: o.subject,
    observationType: o.observationType as 'Baseline' | 'Formative' | 'Summative',
    date: o.date.toISOString(),
    preObservationNotes: o.preObservationNotes || undefined,
    overallScore: o.overallScore,
    feedback: o.feedback,
    recommendations: o.recommendations ? JSON.parse(o.recommendations) : undefined,
    status: o.status as 'draft' | 'completed',
    createdAt: o.createdAt.toISOString(),
    updatedAt: o.updatedAt.toISOString(),
    indicators: o.indicators.map(i => ({
      id: i.id.replace(`${o.id}-`, ''),
      name: i.name,
      score: i.score,
      maxScore: i.maxScore,
      notes: i.notes,
      timestamp: i.timestamp || undefined,
    })),
  }));
}

export async function getObservationById(id: string): Promise<ClassroomObservation | null> {
  const observation = await prisma.classroomObservation.findUnique({
    where: { id },
    include: {
      indicators: true,
    },
  });

  if (!observation) return null;

  return {
    id: observation.id,
    teacherId: observation.teacherId,
    teacherName: observation.teacherName,
    observerId: observation.observerId,
    observerName: observation.observerName,
    schoolId: observation.schoolId,
    classGrade: observation.classGrade,
    subject: observation.subject,
    observationType: observation.observationType as 'Baseline' | 'Formative' | 'Summative',
    date: observation.date.toISOString(),
    preObservationNotes: observation.preObservationNotes || undefined,
    overallScore: observation.overallScore,
    feedback: observation.feedback,
    recommendations: observation.recommendations ? JSON.parse(observation.recommendations) : undefined,
    status: observation.status as 'draft' | 'completed',
    createdAt: observation.createdAt.toISOString(),
    updatedAt: observation.updatedAt.toISOString(),
    indicators: observation.indicators.map(i => ({
      id: i.id.replace(`${observation.id}-`, ''),
      name: i.name,
      score: i.score,
      maxScore: i.maxScore,
      notes: i.notes,
      timestamp: i.timestamp || undefined,
    })),
  };
}

// ==================== FEEDBACK FUNCTIONS ====================

export async function getFeedbackForResult(resultId: string): Promise<StudentFeedback | null> {
  const feedback = await prisma.studentFeedback.findUnique({
    where: { resultId },
  });

  if (!feedback) return null;

  return {
    id: feedback.id,
    resultId: feedback.resultId,
    studentId: feedback.studentId,
    generatedAt: feedback.generatedAt.toISOString(),
    mainMessage: feedback.mainMessage,
    encouragement: feedback.encouragement,
    nextSteps: JSON.parse(feedback.nextSteps),
    strengthAreas: JSON.parse(feedback.strengthAreas),
    improvementAreas: JSON.parse(feedback.improvementAreas),
    subjectTip: feedback.subjectTip,
    performanceTier: feedback.performanceTier,
  };
}

export async function saveFeedback(feedback: StudentFeedback): Promise<void> {
  await prisma.studentFeedback.upsert({
    where: { resultId: feedback.resultId },
    update: {
      mainMessage: feedback.mainMessage,
      encouragement: feedback.encouragement,
      nextSteps: JSON.stringify(feedback.nextSteps),
      strengthAreas: JSON.stringify(feedback.strengthAreas),
      improvementAreas: JSON.stringify(feedback.improvementAreas),
      subjectTip: feedback.subjectTip,
      performanceTier: feedback.performanceTier,
    },
    create: {
      id: feedback.id,
      resultId: feedback.resultId,
      studentId: feedback.studentId,
      generatedAt: new Date(feedback.generatedAt),
      mainMessage: feedback.mainMessage,
      encouragement: feedback.encouragement,
      nextSteps: JSON.stringify(feedback.nextSteps),
      strengthAreas: JSON.stringify(feedback.strengthAreas),
      improvementAreas: JSON.stringify(feedback.improvementAreas),
      subjectTip: feedback.subjectTip,
      performanceTier: feedback.performanceTier,
    },
  });
}

// ==================== ACTIVITY FUNCTIONS ====================

export async function createActivity(activity: Omit<Activity, 'id'>): Promise<Activity> {
  const created = await prisma.activity.create({
    data: {
      id: `act-${Date.now()}`,
      type: activity.type,
      description: activity.description,
      timestamp: new Date(activity.timestamp),
      userId: activity.userId,
      userName: activity.userName,
    },
  });

  return {
    id: created.id,
    type: created.type as 'assessment' | 'observation' | 'login',
    description: created.description,
    timestamp: created.timestamp.toISOString(),
    userId: created.userId,
    userName: created.userName,
  };
}

// ==================== HELPER FUNCTIONS ====================

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function formatTime(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Enhanced answer checking with fuzzy matching for short-answer questions
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

function checkShortAnswer(
  question: Question,
  studentAnswer: string | number,
  subject?: string
): ScoringResult {
  const studentStr = String(studentAnswer).trim().toLowerCase();
  const correctStr = String(question.correctAnswer).trim().toLowerCase();

  if (FUZZY_MATCHING_CONFIG.strictMode && studentStr === correctStr) {
    return {
      isCorrect: true,
      similarityScore: 1.0,
      matchingMethod: 'exact',
    };
  }

  const fuzzyEnabled = FUZZY_MATCHING_CONFIG.enabled || question.fuzzyMatchingEnabled === true;

  if (!fuzzyEnabled) {
    const isExactMatch = studentStr === correctStr;
    return {
      isCorrect: isExactMatch,
      similarityScore: isExactMatch ? 1.0 : 0,
      matchingMethod: 'exact',
    };
  }

  const similarityScore = compareTwoStrings(studentStr, correctStr);
  const threshold = getThresholdForSubject(subject || '', question.similarityThreshold);
  const isCorrect = similarityScore >= threshold;

  return {
    isCorrect,
    similarityScore,
    matchingMethod: isCorrect ? 'fuzzy' : 'none',
  };
}

export async function getAvailableAssessments(studentId: string, grade: number): Promise<Assessment[]> {
  const assessments = await getAssessments();
  return assessments.filter(a => a.grade === grade);
}
