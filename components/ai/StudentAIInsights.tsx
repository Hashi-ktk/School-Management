'use client';

import { useMemo } from 'react';
import Card from '@/components/ui/Card';
import type { AssessmentResult } from '@/types';

interface StudentAIInsightsProps {
  results: AssessmentResult[];
  studentName: string;
}

interface Insight {
  type: 'strength' | 'improvement' | 'tip' | 'achievement';
  icon: string;
  title: string;
  message: string;
  color: string;
}

export default function StudentAIInsights({ results, studentName }: StudentAIInsightsProps) {
  const insights = useMemo(() => {
    const generatedInsights: Insight[] = [];

    if (results.length === 0) {
      return [{
        type: 'tip' as const,
        icon: '🎯',
        title: 'Get Started!',
        message: 'Complete your first assessment to get personalized AI insights about your learning.',
        color: 'blue',
      }];
    }

    // Calculate subject averages
    const subjectStats: Record<string, { total: number; count: number; scores: number[] }> = {};
    results.forEach(r => {
      if (!subjectStats[r.subject]) {
        subjectStats[r.subject] = { total: 0, count: 0, scores: [] };
      }
      subjectStats[r.subject].total += r.percentage;
      subjectStats[r.subject].count++;
      subjectStats[r.subject].scores.push(r.percentage);
    });

    // Find strongest subject
    let strongestSubject = '';
    let highestAvg = 0;
    let weakestSubject = '';
    let lowestAvg = 100;

    Object.entries(subjectStats).forEach(([subject, stats]) => {
      const avg = stats.total / stats.count;
      if (avg > highestAvg) {
        highestAvg = avg;
        strongestSubject = subject;
      }
      if (avg < lowestAvg) {
        lowestAvg = avg;
        weakestSubject = subject;
      }
    });

    // Add strength insight
    if (strongestSubject && highestAvg >= 70) {
      generatedInsights.push({
        type: 'strength',
        icon: '⭐',
        title: `${strongestSubject} Star!`,
        message: `You're doing great in ${strongestSubject} with an average of ${Math.round(highestAvg)}%! Keep it up!`,
        color: 'emerald',
      });
    }

    // Add improvement insight
    if (weakestSubject && lowestAvg < 70 && weakestSubject !== strongestSubject) {
      generatedInsights.push({
        type: 'improvement',
        icon: '📚',
        title: `Focus on ${weakestSubject}`,
        message: `A little more practice in ${weakestSubject} will help boost your score from ${Math.round(lowestAvg)}%!`,
        color: 'amber',
      });
    }

    // Check for recent improvement
    if (results.length >= 3) {
      const recentResults = results.slice(0, 3);
      const recentAvg = recentResults.reduce((sum, r) => sum + r.percentage, 0) / 3;
      const olderResults = results.slice(3, 6);
      if (olderResults.length >= 2) {
        const olderAvg = olderResults.reduce((sum, r) => sum + r.percentage, 0) / olderResults.length;
        if (recentAvg > olderAvg + 5) {
          generatedInsights.push({
            type: 'achievement',
            icon: '📈',
            title: 'You\'re Improving!',
            message: `Your recent scores are ${Math.round(recentAvg - olderAvg)}% higher than before. Amazing progress!`,
            color: 'purple',
          });
        }
      }
    }

    // Check for consistency
    const lastFiveScores = results.slice(0, 5).map(r => r.percentage);
    if (lastFiveScores.length >= 3) {
      const allAbove70 = lastFiveScores.every(s => s >= 70);
      if (allAbove70) {
        generatedInsights.push({
          type: 'achievement',
          icon: '🏆',
          title: 'Consistent Performer!',
          message: 'You\'ve scored above 70% in your last assessments. You\'re building strong habits!',
          color: 'indigo',
        });
      }
    }

    // Add motivational tip based on overall performance
    const overallAvg = results.reduce((sum, r) => sum + r.percentage, 0) / results.length;
    if (overallAvg >= 80) {
      generatedInsights.push({
        type: 'tip',
        icon: '🌟',
        title: 'Excellence!',
        message: 'You\'re performing exceptionally well! Challenge yourself with harder questions.',
        color: 'purple',
      });
    } else if (overallAvg >= 60) {
      generatedInsights.push({
        type: 'tip',
        icon: '💪',
        title: 'Keep Going!',
        message: 'You\'re making good progress. Regular practice will help you reach even higher!',
        color: 'blue',
      });
    } else {
      generatedInsights.push({
        type: 'tip',
        icon: '🌱',
        title: 'Every Step Counts!',
        message: 'Don\'t worry about mistakes - they help you learn! Focus on understanding, not just scores.',
        color: 'teal',
      });
    }

    // Limit to 4 insights
    return generatedInsights.slice(0, 4);
  }, [results, studentName]);

  const colorClasses: Record<string, string> = {
    emerald: 'bg-emerald-50 border-emerald-200 text-emerald-800',
    amber: 'bg-amber-50 border-amber-200 text-amber-800',
    purple: 'bg-purple-50 border-purple-200 text-purple-800',
    blue: 'bg-blue-50 border-blue-200 text-blue-800',
    indigo: 'bg-indigo-50 border-indigo-200 text-indigo-800',
    teal: 'bg-teal-50 border-teal-200 text-teal-800',
  };

  return (
    <Card>
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-xl text-white">
          🤖
        </div>
        <div>
          <h3 className="text-lg font-bold text-slate-800">AI Learning Insights</h3>
          <p className="text-xs text-slate-500">Personalized tips just for you</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {insights.map((insight, idx) => (
          <div
            key={idx}
            className={`p-3 rounded-xl border-2 ${colorClasses[insight.color]} transition-transform hover:scale-[1.02]`}
          >
            <div className="flex items-start gap-2">
              <span className="text-xl flex-shrink-0">{insight.icon}</span>
              <div>
                <h4 className="font-bold text-sm">{insight.title}</h4>
                <p className="text-xs mt-1 opacity-90">{insight.message}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer with AI badge */}
      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-center gap-2 text-xs text-slate-400">
        <span>✨</span>
        <span>Powered by AI • Updated based on your performance</span>
      </div>
    </Card>
  );
}
