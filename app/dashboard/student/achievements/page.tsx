'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import Card from '@/components/ui/Card';
import { getAllResults } from '@/lib/utils';
import { calculateStudentAchievements, type Achievement } from '@/lib/filterUtils';

interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'performance' | 'consistency' | 'improvement' | 'special';
  requirement: string;
  earned: boolean;
  earnedDate?: string;
  progress?: number;
  maxProgress?: number;
}

const allBadges: Omit<Badge, 'earned' | 'earnedDate' | 'progress'>[] = [
  // Performance badges
  { id: 'first-100', name: 'Perfect Score', description: 'Score 100% on any assessment', icon: '💯', category: 'performance', requirement: '100% score', maxProgress: 1 },
  { id: 'high-achiever', name: 'High Achiever', description: 'Score 90% or above 5 times', icon: '🌟', category: 'performance', requirement: '5 scores above 90%', maxProgress: 5 },
  { id: 'math-master', name: 'Math Master', description: 'Score 80%+ in Mathematics 3 times', icon: '🔢', category: 'performance', requirement: '3 Math scores above 80%', maxProgress: 3 },
  { id: 'english-expert', name: 'English Expert', description: 'Score 80%+ in English 3 times', icon: '📖', category: 'performance', requirement: '3 English scores above 80%', maxProgress: 3 },
  { id: 'urdu-star', name: 'Urdu Star', description: 'Score 80%+ in Urdu 3 times', icon: '📝', category: 'performance', requirement: '3 Urdu scores above 80%', maxProgress: 3 },

  // Consistency badges
  { id: 'first-assessment', name: 'First Steps', description: 'Complete your first assessment', icon: '🎯', category: 'consistency', requirement: 'Complete 1 assessment', maxProgress: 1 },
  { id: 'five-complete', name: 'Getting Started', description: 'Complete 5 assessments', icon: '📚', category: 'consistency', requirement: 'Complete 5 assessments', maxProgress: 5 },
  { id: 'ten-complete', name: 'Dedicated Learner', description: 'Complete 10 assessments', icon: '📘', category: 'consistency', requirement: 'Complete 10 assessments', maxProgress: 10 },
  { id: 'twenty-complete', name: 'Assessment Champion', description: 'Complete 20 assessments', icon: '🏆', category: 'consistency', requirement: 'Complete 20 assessments', maxProgress: 20 },
  { id: 'all-subjects', name: 'Well Rounded', description: 'Complete assessments in all subjects', icon: '🎨', category: 'consistency', requirement: 'All 3 subjects', maxProgress: 3 },

  // Improvement badges
  { id: 'improver', name: 'On The Rise', description: 'Improve your score by 10% from previous attempt', icon: '📈', category: 'improvement', requirement: '10% improvement', maxProgress: 1 },
  { id: 'comeback', name: 'Comeback Kid', description: 'Score 80%+ after scoring below 50%', icon: '💪', category: 'improvement', requirement: 'Bounce back from low score', maxProgress: 1 },
  { id: 'consistent', name: 'Steady Progress', description: 'Score above 60% for 5 consecutive assessments', icon: '⚡', category: 'improvement', requirement: '5 consecutive 60%+ scores', maxProgress: 5 },

  // Special badges
  { id: 'early-bird', name: 'Early Bird', description: 'Complete an assessment before noon', icon: '🌅', category: 'special', requirement: 'Morning assessment', maxProgress: 1 },
  { id: 'speed-demon', name: 'Quick Thinker', description: 'Complete an assessment in under 5 minutes', icon: '⚡', category: 'special', requirement: 'Fast completion', maxProgress: 1 },
  { id: 'streak-3', name: 'On Fire', description: 'Complete assessments 3 days in a row', icon: '🔥', category: 'special', requirement: '3-day streak', maxProgress: 3 },
];

export default function AchievementsPage() {
  const { user, isLoading } = useAuth();
  const [badges, setBadges] = useState<Badge[]>([]);
  const [stats, setStats] = useState({
    totalEarned: 0,
    totalBadges: allBadges.length,
    recentBadge: null as Badge | null,
  });

  useEffect(() => {
    if (!user) return;

    const results = getAllResults()
      .filter(r => r.studentId === user.id && r.status === 'completed')
      .sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime());

    // Calculate badge progress
    const calculatedBadges: Badge[] = allBadges.map(badge => {
      let earned = false;
      let progress = 0;

      switch (badge.id) {
        case 'first-100':
          progress = results.some(r => r.percentage === 100) ? 1 : 0;
          earned = progress >= 1;
          break;
        case 'high-achiever':
          progress = results.filter(r => r.percentage >= 90).length;
          earned = progress >= 5;
          break;
        case 'math-master':
          progress = results.filter(r => r.subject === 'Mathematics' && r.percentage >= 80).length;
          earned = progress >= 3;
          break;
        case 'english-expert':
          progress = results.filter(r => r.subject === 'English' && r.percentage >= 80).length;
          earned = progress >= 3;
          break;
        case 'urdu-star':
          progress = results.filter(r => r.subject === 'Urdu' && r.percentage >= 80).length;
          earned = progress >= 3;
          break;
        case 'first-assessment':
          progress = Math.min(results.length, 1);
          earned = results.length >= 1;
          break;
        case 'five-complete':
          progress = Math.min(results.length, 5);
          earned = results.length >= 5;
          break;
        case 'ten-complete':
          progress = Math.min(results.length, 10);
          earned = results.length >= 10;
          break;
        case 'twenty-complete':
          progress = Math.min(results.length, 20);
          earned = results.length >= 20;
          break;
        case 'all-subjects':
          const subjects = new Set(results.map(r => r.subject));
          progress = subjects.size;
          earned = subjects.size >= 3;
          break;
        case 'improver':
          for (let i = 0; i < results.length - 1; i++) {
            if (results[i].percentage - results[i + 1].percentage >= 10) {
              earned = true;
              progress = 1;
              break;
            }
          }
          break;
        case 'comeback':
          const hasLow = results.some(r => r.percentage < 50);
          const hasHighAfterLow = results.some((r, i) => {
            if (r.percentage >= 80) {
              return results.slice(i + 1).some(prev => prev.percentage < 50);
            }
            return false;
          });
          earned = hasLow && hasHighAfterLow;
          progress = earned ? 1 : 0;
          break;
        case 'consistent':
          let consecutive = 0;
          let maxConsecutive = 0;
          results.forEach(r => {
            if (r.percentage >= 60) {
              consecutive++;
              maxConsecutive = Math.max(maxConsecutive, consecutive);
            } else {
              consecutive = 0;
            }
          });
          progress = Math.min(maxConsecutive, 5);
          earned = maxConsecutive >= 5;
          break;
        case 'streak-3':
          // Simplified - just check if there are 3+ results
          progress = Math.min(results.length, 3);
          earned = results.length >= 3;
          break;
        default:
          progress = 0;
          earned = false;
      }

      return {
        ...badge,
        earned,
        progress: Math.min(progress, badge.maxProgress || 1),
        earnedDate: earned ? results[0]?.completedAt : undefined,
      };
    });

    setBadges(calculatedBadges);

    const earnedBadges = calculatedBadges.filter(b => b.earned);
    setStats({
      totalEarned: earnedBadges.length,
      totalBadges: allBadges.length,
      recentBadge: earnedBadges[0] || null,
    });
  }, [user]);

  if (isLoading || !user) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="h-12 w-12 rounded-full border-4 border-purple-200 border-t-purple-500 animate-spin" />
      </div>
    );
  }

  const categoryColors: Record<string, string> = {
    performance: 'from-amber-400 to-orange-500',
    consistency: 'from-blue-400 to-indigo-500',
    improvement: 'from-emerald-400 to-teal-500',
    special: 'from-purple-400 to-pink-500',
  };

  const categoryNames: Record<string, string> = {
    performance: 'Performance',
    consistency: 'Consistency',
    improvement: 'Improvement',
    special: 'Special',
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-slate-800">🏆 My Achievements</h1>
        <p className="text-lg text-slate-600">Collect badges and celebrate your learning journey!</p>
      </div>

      {/* Stats Overview */}
      <Card className="bg-gradient-to-r from-purple-100 via-white to-amber-100 border-2 border-purple-200">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-center md:text-left">
            <h2 className="text-2xl font-bold text-purple-700">
              {stats.totalEarned} / {stats.totalBadges} Badges Earned
            </h2>
            <p className="text-slate-600">Keep completing assessments to earn more!</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative w-24 h-24">
              <svg className="w-24 h-24 transform -rotate-90">
                <circle cx="48" cy="48" r="40" fill="none" stroke="#e2e8f0" strokeWidth="8" />
                <circle
                  cx="48" cy="48" r="40" fill="none"
                  stroke="url(#gradient)"
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={`${(stats.totalEarned / stats.totalBadges) * 251.2} 251.2`}
                />
                <defs>
                  <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#a855f7" />
                    <stop offset="100%" stopColor="#f59e0b" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-2xl font-bold text-purple-700">
                  {Math.round((stats.totalEarned / stats.totalBadges) * 100)}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Badge Categories */}
      {(['performance', 'consistency', 'improvement', 'special'] as const).map(category => {
        const categoryBadges = badges.filter(b => b.category === category);
        const earnedInCategory = categoryBadges.filter(b => b.earned).length;

        return (
          <div key={category}>
            <div className="flex items-center gap-3 mb-4">
              <div className={`h-8 w-8 rounded-lg bg-gradient-to-r ${categoryColors[category]} flex items-center justify-center text-white text-sm font-bold`}>
                {earnedInCategory}
              </div>
              <h3 className="text-xl font-bold text-slate-800">{categoryNames[category]} Badges</h3>
              <span className="text-sm text-slate-500">({earnedInCategory}/{categoryBadges.length})</span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {categoryBadges.map(badge => (
                <div
                  key={badge.id}
                  className={`relative rounded-xl p-4 text-center transition-all ${
                    badge.earned
                      ? 'bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-200 shadow-lg transform hover:scale-105'
                      : 'bg-slate-50 border-2 border-slate-200 opacity-60'
                  }`}
                >
                  {/* Badge Icon */}
                  <div className={`text-4xl mb-2 ${badge.earned ? '' : 'grayscale'}`}>
                    {badge.icon}
                  </div>

                  {/* Badge Name */}
                  <h4 className={`font-bold text-sm ${badge.earned ? 'text-slate-800' : 'text-slate-500'}`}>
                    {badge.name}
                  </h4>

                  {/* Badge Description */}
                  <p className="text-xs text-slate-500 mt-1">{badge.description}</p>

                  {/* Progress Bar (if not earned) */}
                  {!badge.earned && badge.maxProgress && badge.maxProgress > 1 && (
                    <div className="mt-3">
                      <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full bg-gradient-to-r ${categoryColors[category]} rounded-full`}
                          style={{ width: `${((badge.progress || 0) / badge.maxProgress) * 100}%` }}
                        />
                      </div>
                      <p className="text-xs text-slate-400 mt-1">
                        {badge.progress}/{badge.maxProgress}
                      </p>
                    </div>
                  )}

                  {/* Earned Badge Indicator */}
                  {badge.earned && (
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center text-white text-xs shadow-lg">
                      ✓
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        );
      })}

      {/* Motivational Message */}
      <Card className="bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-200 text-center">
        <div className="text-4xl mb-3">🌟</div>
        <h3 className="text-lg font-bold text-indigo-800">Keep Going!</h3>
        <p className="text-indigo-600">
          Every assessment you complete brings you closer to earning more badges.
          {stats.totalEarned === 0 && ' Complete your first assessment to start collecting!'}
          {stats.totalEarned > 0 && stats.totalEarned < 5 && ' You\'re making great progress!'}
          {stats.totalEarned >= 5 && ' You\'re a star learner!'}
        </p>
      </Card>
    </div>
  );
}
