'use client';

import { ReactNode, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Image from 'next/image';
import Header from '@/components/layout/Header';
import Sidebar from '@/components/layout/Sidebar';
import { useAuth } from '@/hooks/useAuth';

type Props = {
  children: ReactNode;
};

export default function DashboardLayout({ children }: Props) {
  const { user, role, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const isAdminPath = pathname.startsWith('/dashboard/admin');
  const isTeacherPath = pathname.startsWith('/dashboard/teacher');
  const isStudentPath = pathname.startsWith('/dashboard/student');

  useEffect(() => {
    if (isLoading) return;

    if (!user) {
      router.replace('/');
      return;
    }

    if (role === 'admin' && (isTeacherPath || isStudentPath)) {
      router.replace('/dashboard/admin');
      return;
    }

    if (role === 'teacher' && (isAdminPath || isStudentPath)) {
      router.replace('/dashboard/teacher');
      return;
    }

    if (role === 'student' && (isAdminPath || isTeacherPath)) {
      router.replace('/dashboard/student');
      return;
    }
  }, [isLoading, user, role, isAdminPath, isTeacherPath, isStudentPath, router]);

  const isBlocked = isLoading || !user || (role === 'admin' && (isTeacherPath || isStudentPath)) || (role === 'teacher' && (isAdminPath || isStudentPath)) || (role === 'student' && (isAdminPath || isTeacherPath));

  if (isBlocked) {
    return (
      <div className="min-h-screen grid place-content-center bg-gradient-to-br from-slate-50 via-purple-50/30 to-cyan-50/30">
        <div className="text-center space-y-6">
          {/* Animated Logo with App Name */}
          <div className="relative">
            <div className="mx-auto flex flex-col items-center gap-3">
              <div className="relative rounded-2xl overflow-hidden shadow-lg animate-pulse">
                <Image
                  src="/logo.jpeg"
                  alt="EduAssess Logo"
                  width={64}
                  height={64}
                  className="object-cover"
                  priority
                />
              </div>
              <div className="flex flex-col items-center">
                <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-600">
                  Education Platform
                </span>
                <span className="text-2xl font-extrabold bg-gradient-to-r from-purple-700 via-purple-600 to-orange-500 bg-clip-text text-transparent">
                  EduAssess
                </span>
              </div>
            </div>
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-16 h-1 bg-purple-600/20 rounded-full blur-sm" />
          </div>

          {/* Loading Card */}
          <div className="flex items-center gap-3 rounded-2xl bg-white/80 backdrop-blur-xl px-6 py-4 shadow-xl border border-white/50">
            <div className="relative">
              <div className="h-3 w-3 rounded-full bg-purple-500 animate-ping absolute" />
              <div className="h-3 w-3 rounded-full bg-purple-600" />
            </div>
            <div className="text-left">
              <p className="text-sm font-bold text-slate-800">
                {isLoading ? 'Checking your session...' : 'Redirecting you...'}
              </p>
              <p className="text-xs text-slate-500">Please wait a moment</p>
            </div>
          </div>

          {/* Loading Dots */}
          <div className="flex items-center justify-center gap-1">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-2 h-2 rounded-full bg-purple-400 animate-bounce"
                style={{ animationDelay: `${i * 150}ms` }}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="app-shell bg-gradient-to-br from-slate-50 via-slate-50 to-purple-50/20 min-h-screen">
      {/* Background Pattern */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-purple-200/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-200/20 rounded-full blur-3xl" />
        <div
          className="absolute inset-0 opacity-[0.015]"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, #8B5CF6 1px, transparent 0)`,
            backgroundSize: '32px 32px'
          }}
        />
      </div>

      <Sidebar />
      <div className="md:ml-72 transition-all duration-300">
        <Header />
        <main className="px-4 py-6 md:px-8 md:py-8 lg:px-10 lg:py-10">
          {children}
        </main>
      </div>
    </div>
  );
}
