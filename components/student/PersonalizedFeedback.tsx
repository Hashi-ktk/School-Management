'use client';

import type { StudentFeedback } from '@/types';
import Card from '@/components/ui/Card';

interface PersonalizedFeedbackProps {
  feedback: StudentFeedback;
}

export default function PersonalizedFeedback({
  feedback,
}: PersonalizedFeedbackProps) {
  const getTierColor = (tier: string) => {
    if (tier.includes('Excellent')) return 'from-emerald-400 to-green-400';
    if (tier.includes('Good')) return 'from-blue-400 to-cyan-400';
    if (tier.includes('Satisfactory')) return 'from-purple-400 to-indigo-400';
    if (tier.includes('Improvement')) return 'from-amber-400 to-orange-400';
    return 'from-red-400 to-pink-400';
  };

  const getTierIcon = (tier: string) => {
    if (tier.includes('Excellent')) return '🌟';
    if (tier.includes('Good')) return '👍';
    if (tier.includes('Satisfactory')) return '📈';
    if (tier.includes('Improvement')) return '💪';
    return '🎯';
  };

  return (
    <div className="space-y-4">
      {/* Performance Tier Badge */}
      <div className="flex items-center gap-3">
        <span className="text-4xl" role="img" aria-label="Performance icon">
          {getTierIcon(feedback.performanceTier)}
        </span>
        <div>
          <h3
            className={`text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r ${getTierColor(
              feedback.performanceTier
            )}`}
          >
            {feedback.performanceTier}
          </h3>
          <p className="text-sm text-[#475569]">Your Performance Level</p>
        </div>
      </div>

      {/* Main Message */}
      <Card className="glass-surface bg-gradient-to-br from-white/50 to-white/30">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-2xl" role="img" aria-label="Message">
              💬
            </span>
            <h4 className="text-lg font-bold text-[#0f172a]">
              Personalized Feedback
            </h4>
          </div>
          <p className="text-[#334155] leading-relaxed">
            {feedback.mainMessage}
          </p>
          <p className="text-[#00d4ff] font-semibold italic">
            {feedback.encouragement}
          </p>
        </div>
      </Card>

      {/* Strengths */}
      {feedback.strengthAreas.length > 0 && (
        <Card className="glass-surface border-l-4 border-l-emerald-500">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-2xl" role="img" aria-label="Strengths">
                ✨
              </span>
              <h4 className="text-lg font-bold text-emerald-700">
                Your Strengths
              </h4>
            </div>
            <ul className="space-y-2">
              {feedback.strengthAreas.map((strength, idx) => (
                <li
                  key={idx}
                  className="flex items-start gap-2 text-[#334155]"
                >
                  <span className="text-emerald-500 mt-1 flex-shrink-0">
                    ✓
                  </span>
                  <span>{strength}</span>
                </li>
              ))}
            </ul>
          </div>
        </Card>
      )}

      {/* Areas for Improvement */}
      {feedback.improvementAreas.length > 0 && (
        <Card className="glass-surface border-l-4 border-l-amber-500">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-2xl" role="img" aria-label="Focus areas">
                🎯
              </span>
              <h4 className="text-lg font-bold text-amber-700">
                Areas to Focus On
              </h4>
            </div>
            <ul className="space-y-2">
              {feedback.improvementAreas.map((area, idx) => (
                <li key={idx} className="flex items-start gap-2 text-[#334155]">
                  <span className="text-amber-500 mt-1 flex-shrink-0">•</span>
                  <span>{area}</span>
                </li>
              ))}
            </ul>
          </div>
        </Card>
      )}

      {/* Next Steps */}
      <Card className="glass-surface border-l-4 border-l-blue-500">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-2xl" role="img" aria-label="Next steps">
              🚀
            </span>
            <h4 className="text-lg font-bold text-blue-700">Next Steps</h4>
          </div>
          <ol className="space-y-2">
            {feedback.nextSteps.map((step, idx) => (
              <li key={idx} className="flex items-start gap-3 text-[#334155]">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-bold">
                  {idx + 1}
                </span>
                <span className="pt-0.5">{step}</span>
              </li>
            ))}
          </ol>
        </div>
      </Card>

      {/* Subject Tip */}
      <Card className="glass-surface bg-gradient-to-r from-purple-50 to-indigo-50">
        <div className="flex items-start gap-3">
          <span className="text-2xl" role="img" aria-label="Study tip">
            💡
          </span>
          <div className="flex-1">
            <h4 className="text-sm font-bold text-purple-700 uppercase tracking-wide mb-1">
              Study Tip
            </h4>
            <p className="text-[#334155]">{feedback.subjectTip}</p>
          </div>
        </div>
      </Card>
    </div>
  );
}
