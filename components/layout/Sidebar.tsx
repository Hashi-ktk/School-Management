'use client';

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";

interface NavItem {
  name: string;
  href: string;
  icon: React.ReactNode;
  badge?: number;
  isAI?: boolean;
}

// AI Sparkle Icon for highlighting AI features
const SparkleIcon = () => (
  <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 0L14.59 8.41L23 11L14.59 13.59L12 22L9.41 13.59L1 11L9.41 8.41L12 0Z" />
  </svg>
);

// SVG Icon Components for better visual fidelity
const DashboardIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="9" rx="1" />
    <rect x="14" y="3" width="7" height="5" rx="1" />
    <rect x="14" y="12" width="7" height="9" rx="1" />
    <rect x="3" y="16" width="7" height="5" rx="1" />
  </svg>
);

const AssessmentIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <path d="M14 2v6h6" />
    <path d="M16 13H8" />
    <path d="M16 17H8" />
    <path d="M10 9H8" />
  </svg>
);

const StudentsIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

const GroupsIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="18" cy="5" r="3" />
    <circle cx="6" cy="12" r="3" />
    <circle cx="18" cy="19" r="3" />
    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
    <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
  </svg>
);

const AIInsightsIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2a2 2 0 0 1 2 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 0 1 7 7h1a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1v1a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-1H2a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h1a7 7 0 0 1 7-7h1V5.73c-.6-.34-1-.99-1-1.73a2 2 0 0 1 2-2z" />
    <circle cx="7.5" cy="14.5" r="1" />
    <circle cx="16.5" cy="14.5" r="1" />
  </svg>
);

const ResultsIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="20" x2="18" y2="10" />
    <line x1="12" y1="20" x2="12" y2="4" />
    <line x1="6" y1="20" x2="6" y2="14" />
  </svg>
);

const ReportsIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <path d="M14 2v6h6" />
    <path d="M12 18v-6" />
    <path d="M8 18v-1" />
    <path d="M16 18v-3" />
  </svg>
);

const ObservationsIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const AnalyticsIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21.21 15.89A10 10 0 1 1 8 2.83" />
    <path d="M22 12A10 10 0 0 0 12 2v10z" />
  </svg>
);

const PlusIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

const teacherNav: NavItem[] = [
  { name: "Dashboard", href: "/dashboard/teacher", icon: <DashboardIcon /> },
  { name: "AI Insights", href: "/dashboard/teacher/ai-insights", icon: <AIInsightsIcon />, isAI: true },
  { name: "Learning Groups", href: "/dashboard/teacher/grouping", icon: <GroupsIcon />, isAI: true },
  { name: "Assessments", href: "/dashboard/teacher/assessments", icon: <AssessmentIcon /> },
  { name: "Students", href: "/dashboard/teacher/students", icon: <StudentsIcon /> },
  { name: "Results", href: "/dashboard/teacher/results", icon: <ResultsIcon /> },
  { name: "Reports", href: "/dashboard/teacher/reports", icon: <ReportsIcon /> },
  { name: "My Observations", href: "/dashboard/teacher/observations", icon: <ObservationsIcon /> },
];

const adminNav: NavItem[] = [
  { name: "Dashboard", href: "/dashboard/admin", icon: <DashboardIcon /> },
  { name: "All Assessments", href: "/dashboard/admin/assessments", icon: <AssessmentIcon /> },
  { name: "All Students", href: "/dashboard/admin/students", icon: <StudentsIcon /> },
  { name: "Analytics", href: "/dashboard/admin/analytics", icon: <AnalyticsIcon /> },
  { name: "Reports", href: "/dashboard/admin/reports", icon: <ReportsIcon /> },
  { name: "Observations", href: "/dashboard/admin/observations", icon: <ObservationsIcon /> },
];

const PracticeIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
    <line x1="8" y1="7" x2="16" y2="7" />
    <line x1="8" y1="11" x2="14" y2="11" />
  </svg>
);

const ProgressIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
  </svg>
);

const AchievementsIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="8" r="6" />
    <path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11" />
  </svg>
);

const TutorIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    <path d="M12 7v2" />
    <path d="M12 13h.01" />
  </svg>
);

const studentNav: NavItem[] = [
  { name: "Dashboard", href: "/dashboard/student", icon: <DashboardIcon /> },
  { name: "AI Tutor", href: "/dashboard/student/ai-tutor", icon: <TutorIcon />, isAI: true },
  { name: "Practice Mode", href: "/dashboard/student/practice", icon: <PracticeIcon />, isAI: true },
  { name: "Assessments", href: "/dashboard/student/assessments", icon: <AssessmentIcon /> },
  { name: "My Progress", href: "/dashboard/student/progress", icon: <ProgressIcon /> },
  { name: "Results", href: "/dashboard/student/results", icon: <ResultsIcon /> },
  { name: "Achievements", href: "/dashboard/student/achievements", icon: <AchievementsIcon /> },
];

const observerNav: NavItem[] = [
  { name: "Dashboard", href: "/dashboard/observer", icon: <DashboardIcon /> },
  { name: "My Observations", href: "/dashboard/observer/observations", icon: <ObservationsIcon /> },
  { name: "New Observation", href: "/dashboard/observer/observations/create", icon: <PlusIcon /> },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { user, role, isLoading } = useAuth();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  const items = role === "admin" ? adminNav : role === "teacher" ? teacherNav : role === "student" ? studentNav : role === "observer" ? observerNav : [];

  const getRoleColor = () => {
    switch (role) {
      case 'admin': return 'from-indigo-600 to-purple-600';
      case 'teacher': return 'from-purple-600 to-pink-600';
      case 'student': return 'from-emerald-500 to-cyan-500';
      case 'observer': return 'from-amber-500 to-orange-500';
      default: return 'from-purple-600 to-pink-600';
    }
  };

  const getRoleBadgeColor = () => {
    switch (role) {
      case 'admin': return 'bg-indigo-100 text-indigo-700 border-indigo-200';
      case 'teacher': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'student': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'observer': return 'bg-amber-100 text-amber-700 border-amber-200';
      default: return 'bg-purple-100 text-purple-700 border-purple-200';
    }
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="md:hidden fixed top-4 left-4 z-50 h-12 w-12 rounded-xl bg-white border-2 border-gray-200 shadow-lg text-slate-700 hover:bg-purple-50 hover:border-purple-300 transition-all duration-200 flex items-center justify-center"
        aria-label="Toggle navigation"
      >
        {open ? (
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        ) : (
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        )}
      </button>

      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 md:hidden transition-opacity"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 z-50 h-screen w-72 bg-white/95 backdrop-blur-xl border-r border-gray-200/80 shadow-2xl transition-transform duration-300 ease-out ${
          open ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <div className="flex h-full flex-col">
          {/* Logo Section */}
          <div className="px-5 py-4 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="relative flex-shrink-0 rounded-xl overflow-hidden shadow-md">
                <Image
                  src="/logo.jpeg"
                  alt="EduAssess Logo"
                  width={44}
                  height={44}
                  className="object-cover"
                  priority
                />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-[9px] font-bold uppercase tracking-wider text-cyan-600 leading-tight">
                  Education Platform
                </span>
                <span className="text-lg font-extrabold bg-gradient-to-r from-purple-700 via-purple-600 to-orange-500 bg-clip-text text-transparent leading-tight">
                  EduAssess
                </span>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
            {isLoading || items.length === 0 ? (
              <div className="space-y-2 px-2">
                {Array.from({ length: 5 }).map((_, idx) => (
                  <div
                    key={idx}
                    className="animate-pulse h-11 rounded-xl bg-gradient-to-r from-gray-100 to-gray-50"
                    style={{ animationDelay: `${idx * 100}ms` }}
                    aria-hidden
                  />
                ))}
              </div>
            ) : (
              items.map((item, index) => {
                const active = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                      active
                        ? `text-white bg-gradient-to-r ${getRoleColor()} shadow-lg shadow-purple-500/20`
                        : item.isAI
                        ? "text-purple-700 bg-gradient-to-r from-purple-50 to-indigo-50 hover:from-purple-100 hover:to-indigo-100 border border-purple-200/50"
                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                    }`}
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <span
                      className={`flex h-9 w-9 items-center justify-center rounded-lg transition-all duration-200 ${
                        active
                          ? "bg-white/20 text-white"
                          : item.isAI
                          ? "bg-gradient-to-br from-purple-500 to-indigo-600 text-white shadow-md shadow-purple-500/30"
                          : "bg-slate-100 text-slate-500 group-hover:bg-slate-200 group-hover:text-slate-700"
                      }`}
                    >
                      {item.icon}
                    </span>
                    <span className="truncate">{item.name}</span>
                    {item.isAI && !active && (
                      <span className="ml-auto flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-sm">
                        <SparkleIcon />
                        AI
                      </span>
                    )}
                    {item.badge && (
                      <span className="ml-auto px-2 py-0.5 rounded-full text-xs font-bold bg-red-500 text-white">
                        {item.badge}
                      </span>
                    )}
                    {active && (
                      <div className="absolute right-2 w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                    )}
                  </Link>
                );
              })
            )}
          </nav>

          {/* Help Section */}
          <div className="px-4 py-3 border-t border-gray-100">
            <div className="rounded-xl bg-gradient-to-br from-slate-50 to-slate-100 p-4 border border-slate-200">
              <div className="flex items-center gap-3 mb-2">
                <div className="h-8 w-8 rounded-lg bg-slate-200 flex items-center justify-center">
                  <svg className="w-4 h-4 text-slate-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                    <line x1="12" y1="17" x2="12.01" y2="17" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-700">Need Help?</p>
                  <p className="text-[10px] text-slate-500">View documentation</p>
                </div>
              </div>
            </div>
          </div>

          {/* User Section */}
          {!isLoading && user && (
            <div className="px-4 py-4 border-t border-gray-100 bg-gradient-to-br from-slate-50/50 to-white">
              <div className="flex items-center gap-3">
                <div className={`h-10 w-10 rounded-xl bg-gradient-to-br ${getRoleColor()} text-white grid place-content-center font-semibold shadow-md text-sm`}>
                  {user.name?.slice(0, 1)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-slate-800 truncate">{user.name}</p>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getRoleBadgeColor()}`}>
                    {user.role}
                  </span>
                </div>
                <button className="h-8 w-8 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-700 transition-colors">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="1" />
                    <circle cx="12" cy="5" r="1" />
                    <circle cx="12" cy="19" r="1" />
                  </svg>
                </button>
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
