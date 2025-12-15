'use client';

interface ActivityDay {
  date: string;
  count: number;
  level: 0 | 1 | 2 | 3 | 4; // 0 = no activity, 4 = high activity
}

interface ActivityCalendarProps {
  data: ActivityDay[];
  title?: string;
  weeks?: number;
}

export default function ActivityCalendar({
  data,
  title,
  weeks = 12
}: ActivityCalendarProps) {
  // Generate last N weeks of dates
  const generateCalendarDays = (): (ActivityDay | null)[][] => {
    const today = new Date();
    const calendar: (ActivityDay | null)[][] = [];

    // Start from beginning of the week, N weeks ago
    const startDate = new Date(today);
    startDate.setDate(startDate.getDate() - (weeks * 7) - startDate.getDay());

    for (let week = 0; week < weeks; week++) {
      const weekDays: (ActivityDay | null)[] = [];
      for (let day = 0; day < 7; day++) {
        const currentDate = new Date(startDate);
        currentDate.setDate(startDate.getDate() + (week * 7) + day);

        // Check if date is in the future
        if (currentDate > today) {
          weekDays.push(null);
        } else {
          const dateStr = currentDate.toISOString().split('T')[0];
          const activityData = data.find(d => d.date === dateStr);
          weekDays.push(activityData || { date: dateStr, count: 0, level: 0 });
        }
      }
      calendar.push(weekDays);
    }

    return calendar;
  };

  const getLevelColor = (level: number): string => {
    const colors = [
      'bg-slate-100', // level 0
      'bg-emerald-200', // level 1
      'bg-emerald-400', // level 2
      'bg-emerald-500', // level 3
      'bg-emerald-600', // level 4
    ];
    return colors[level] || colors[0];
  };

  const calendar = generateCalendarDays();
  const dayLabels = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  // Calculate streak
  const calculateStreak = (): number => {
    let streak = 0;
    const sortedData = [...data].sort((a, b) =>
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < sortedData.length; i++) {
      const activityDate = new Date(sortedData[i].date);
      activityDate.setHours(0, 0, 0, 0);

      const expectedDate = new Date(today);
      expectedDate.setDate(today.getDate() - i);

      if (activityDate.getTime() === expectedDate.getTime() && sortedData[i].count > 0) {
        streak++;
      } else if (i === 0 && activityDate.getTime() < expectedDate.getTime()) {
        // Check if yesterday had activity for ongoing streaks
        continue;
      } else {
        break;
      }
    }

    return streak;
  };

  const totalActivities = data.reduce((sum, d) => sum + d.count, 0);
  const activeDays = data.filter(d => d.count > 0).length;
  const streak = calculateStreak();

  return (
    <div className="w-full">
      {title && <h4 className="text-sm font-semibold text-slate-600 mb-4">{title}</h4>}

      {/* Stats row */}
      <div className="flex gap-6 mb-4 text-sm">
        <div>
          <span className="text-slate-500">Total activities:</span>
          <span className="ml-2 font-bold text-slate-800">{totalActivities}</span>
        </div>
        <div>
          <span className="text-slate-500">Active days:</span>
          <span className="ml-2 font-bold text-slate-800">{activeDays}</span>
        </div>
        <div>
          <span className="text-slate-500">Current streak:</span>
          <span className="ml-2 font-bold text-emerald-600">{streak} days 🔥</span>
        </div>
      </div>

      {/* Calendar grid */}
      <div className="flex gap-1">
        {/* Day labels */}
        <div className="flex flex-col gap-1 mr-2">
          {dayLabels.map((label, index) => (
            <div
              key={index}
              className="w-3 h-3 text-[10px] text-slate-400 flex items-center justify-center"
            >
              {index % 2 === 1 ? label : ''}
            </div>
          ))}
        </div>

        {/* Calendar weeks */}
        {calendar.map((week, weekIndex) => (
          <div key={weekIndex} className="flex flex-col gap-1">
            {week.map((day, dayIndex) => (
              <div
                key={dayIndex}
                className={`w-3 h-3 rounded-sm ${
                  day === null
                    ? 'bg-transparent'
                    : getLevelColor(day.level)
                } transition-colors hover:ring-2 hover:ring-slate-300`}
                title={day ? `${day.date}: ${day.count} activities` : ''}
              />
            ))}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-2 mt-4 text-xs text-slate-500">
        <span>Less</span>
        {[0, 1, 2, 3, 4].map(level => (
          <div
            key={level}
            className={`w-3 h-3 rounded-sm ${getLevelColor(level)}`}
          />
        ))}
        <span>More</span>
      </div>
    </div>
  );
}
