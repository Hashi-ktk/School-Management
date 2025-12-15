'use client';

import { useRouter } from "next/navigation";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import type { StudentAnalytics } from "@/types";

interface AtRiskAlertProps {
  students: StudentAnalytics[];
}

export default function AtRiskAlert({ students }: AtRiskAlertProps) {
  const router = useRouter();

  if (students.length === 0) return null;

  return (
    <Card className="border-2 border-rose-500/40 bg-gradient-to-br from-rose-500/10 to-transparent">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="h-12 w-12 rounded-xl bg-rose-500/20 text-rose-500 grid place-content-center text-2xl ring-2 ring-rose-500/40">
            ⚠️
          </div>
          <div>
            <h3 className="text-lg font-bold text-[#0f172a] mb-1">
              {students.length} Student{students.length > 1 ? 's' : ''} Need Support
            </h3>
            <p className="text-sm text-[#334155] mb-3">
              Students scoring below 60% average require immediate attention
            </p>

            <div className="space-y-2">
              {students.slice(0, 3).map(student => (
                <div
                  key={student.studentId}
                  className="flex items-center gap-3 px-3 py-2 rounded-lg bg-white/5 border border-white/10"
                >
                  <div className="h-8 w-8 rounded-full bg-gradient-to-br from-rose-400 to-rose-600 text-white grid place-content-center text-sm font-bold">
                    {student.studentName.slice(0, 1)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-[#0f172a] text-sm truncate">
                      {student.studentName}
                    </p>
                    <p className="text-xs text-[#334155]">
                      {student.totalAssessments} assessment{student.totalAssessments > 1 ? 's' : ''}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-rose-500">{student.averageScore}%</p>
                    <p className="text-[10px] text-[#334155] uppercase tracking-wider">
                      {student.trend === 'declining' ? '📉 Declining' :
                       student.trend === 'improving' ? '📈 Improving' : '➡️ Stable'}
                    </p>
                  </div>
                </div>
              ))}

              {students.length > 3 && (
                <p className="text-xs text-[#334155] pl-3">
                  + {students.length - 3} more student{students.length - 3 > 1 ? 's' : ''}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-white/10">
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.push("/dashboard/teacher/students")}
          className="border-rose-500/50 text-rose-600 hover:bg-rose-500/10"
        >
          View all at-risk students →
        </Button>
      </div>
    </Card>
  );
}
