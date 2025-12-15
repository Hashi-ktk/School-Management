import { getAllResults, getStudents } from "./utils";
import { getAtRiskStudents, getStudentAnalytics } from "./teacherAnalytics";
import type { Notification, TaskReminder } from "@/types";

const LOCAL_NOTIFICATIONS_KEY = "teacherNotifications";
const LOCAL_TASKS_KEY = "teacherTasks";

// localStorage helpers
const safeParse = <T,>(val: string | null): T | null => {
  if (!val) return null;
  try {
    return JSON.parse(val) as T;
  } catch {
    return null;
  }
};

/**
 * Get all notifications for a teacher
 */
export function getNotifications(teacherId: string): Notification[] {
  if (typeof window === "undefined") return [];
  const stored = safeParse<Notification[]>(localStorage.getItem(LOCAL_NOTIFICATIONS_KEY)) ?? [];
  return stored.filter(n => !n.read).sort((a, b) =>
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
}

/**
 * Mark notification as read
 */
export function markNotificationRead(notificationId: string): void {
  if (typeof window === "undefined") return;
  const stored = safeParse<Notification[]>(localStorage.getItem(LOCAL_NOTIFICATIONS_KEY)) ?? [];
  const updated = stored.map(n => n.id === notificationId ? { ...n, read: true } : n);
  localStorage.setItem(LOCAL_NOTIFICATIONS_KEY, JSON.stringify(updated));
}

/**
 * Mark all notifications as read
 */
export function markAllNotificationsRead(teacherId: string): void {
  if (typeof window === "undefined") return;
  const stored = safeParse<Notification[]>(localStorage.getItem(LOCAL_NOTIFICATIONS_KEY)) ?? [];
  const updated = stored.map(n => ({ ...n, read: true }));
  localStorage.setItem(LOCAL_NOTIFICATIONS_KEY, JSON.stringify(updated));
}

/**
 * Create notification
 */
export function createNotification(notification: Omit<Notification, 'id' | 'timestamp' | 'read'>): Notification {
  if (typeof window === "undefined") throw new Error("Not in browser");

  const newNotification: Notification = {
    ...notification,
    id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    timestamp: new Date().toISOString(),
    read: false,
  };

  const stored = safeParse<Notification[]>(localStorage.getItem(LOCAL_NOTIFICATIONS_KEY)) ?? [];
  const updated = [newNotification, ...stored];
  localStorage.setItem(LOCAL_NOTIFICATIONS_KEY, JSON.stringify(updated));

  return newNotification;
}

/**
 * Get task reminders for a teacher
 */
export function getTaskReminders(teacherId: string): TaskReminder[] {
  if (typeof window === "undefined") return [];
  const stored = safeParse<TaskReminder[]>(localStorage.getItem(LOCAL_TASKS_KEY)) ?? [];
  return stored.sort((a, b) => {
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });
}

/**
 * Generate task reminders automatically based on student data
 */
export function generateTaskReminders(teacherId: string): TaskReminder[] {
  const tasks: TaskReminder[] = [];

  // Task 1: At-risk students needing attention
  const atRiskStudents = getAtRiskStudents(teacherId);
  if (atRiskStudents.length > 0) {
    tasks.push({
      id: `task-at-risk-${Date.now()}`,
      type: 'follow-up',
      title: 'Students need support',
      description: `${atRiskStudents.length} student(s) scoring below 60% average`,
      studentIds: atRiskStudents.map(s => s.studentId),
      count: atRiskStudents.length,
      priority: 'high',
      createdAt: new Date().toISOString(),
    });
  }

  // Task 2: Students with no recent assessments
  const students = getStudents().filter(s => s.teacherId === teacherId);
  const studentsWithNoResults = students.filter(s => {
    const analytics = getStudentAnalytics(s.id);
    return analytics === null || analytics.totalAssessments === 0;
  });

  if (studentsWithNoResults.length > 0) {
    tasks.push({
      id: `task-no-results-${Date.now()}`,
      type: 'incomplete-assessment',
      title: 'No assessment data',
      description: `${studentsWithNoResults.length} student(s) have not completed any assessments`,
      studentIds: studentsWithNoResults.map(s => s.id),
      count: studentsWithNoResults.length,
      priority: 'medium',
      createdAt: new Date().toISOString(),
    });
  }

  return tasks;
}

/**
 * Generate notifications for new results and at-risk alerts
 */
export function generateAutomaticNotifications(teacherId: string): void {
  if (typeof window === "undefined") return;

  const atRiskStudents = getAtRiskStudents(teacherId);

  atRiskStudents.forEach(student => {
    // Check if we've already sent a notification for this student recently
    const existing = getNotifications(teacherId).filter(
      n => n.studentId === student.studentId && n.category === 'at-risk'
    );

    // Only create notification if none exists
    if (existing.length === 0) {
      createNotification({
        type: 'alert',
        category: 'at-risk',
        title: 'Student needs support',
        message: `${student.studentName} is struggling with an average score of ${student.averageScore}%`,
        studentId: student.studentId,
        studentName: student.studentName,
        actionUrl: `/dashboard/teacher/students`,
      });
    }
  });
}
