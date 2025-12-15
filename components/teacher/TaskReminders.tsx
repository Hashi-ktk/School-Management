'use client';

import { useRouter } from "next/navigation";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import type { TaskReminder } from "@/types";

interface TaskRemindersProps {
  tasks: TaskReminder[];
}

export default function TaskReminders({ tasks }: TaskRemindersProps) {
  const router = useRouter();

  if (tasks.length === 0) {
    return (
      <Card className="border border-emerald-500/40 bg-gradient-to-br from-emerald-500/10 to-transparent">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-xl bg-emerald-500/20 text-emerald-500 grid place-content-center text-2xl">
            ✅
          </div>
          <div>
            <h3 className="text-lg font-bold text-[#0f172a]">All caught up!</h3>
            <p className="text-sm text-[#334155]">No pending tasks at the moment.</p>
          </div>
        </div>
      </Card>
    );
  }

  const priorityConfig = {
    high: { color: '#ff6b6b', icon: '🔴', label: 'High' },
    medium: { color: '#ffd060', icon: '🟡', label: 'Medium' },
    low: { color: '#00d4ff', icon: '🔵', label: 'Low' },
  };

  return (
    <Card>
      <div className="flex items-center justify-between mb-5">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#334155]">Tasks</p>
          <h3 className="text-xl font-bold text-[#0f172a]">Pending Reminders</h3>
          <p className="text-sm text-[#334155]">{tasks.length} task{tasks.length !== 1 ? 's' : ''} requiring attention</p>
        </div>
      </div>

      <div className="space-y-3">
        {tasks.map(task => {
          const config = priorityConfig[task.priority];

          return (
            <div
              key={task.id}
              className="p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition group"
            >
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div
                    className="h-10 w-10 rounded-lg grid place-content-center text-xl ring-2 flex-shrink-0"
                    style={{
                      backgroundColor: `${config.color}20`,
                      borderColor: `${config.color}40`
                    }}
                  >
                    {task.type === 'incomplete-assessment' ? '📝' :
                     task.type === 'review-needed' ? '👀' : '📌'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-[#0f172a] mb-1">{task.title}</h4>
                    <p className="text-sm text-[#334155] mb-2">{task.description}</p>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className="text-xs px-2 py-1 rounded-full font-semibold"
                        style={{
                          backgroundColor: `${config.color}20`,
                          color: config.color
                        }}
                      >
                        {config.icon} {config.label} Priority
                      </span>
                      <span className="text-xs text-[#334155]">
                        {task.count} student{task.count !== 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => router.push('/dashboard/teacher/students')}
                  className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition"
                >
                  View →
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
