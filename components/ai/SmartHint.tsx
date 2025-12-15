'use client';

import { useState } from 'react';
import type { Question } from '@/types';

interface SmartHintProps {
  question: Question;
  wrongAttempts: number;
  hasAnswered: boolean;
  onHintUsed?: () => void;
}

// Generate contextual hints based on question type and content
function generateSmartHints(question: Question): string[] {
  const hints: string[] = [];

  // Add the manual hint if available
  if (question.hint) {
    hints.push(question.hint);
  }

  // Generate additional hints based on question type
  switch (question.type) {
    case 'multiple-choice':
      hints.push('Read all the options carefully before selecting your answer.');
      if (question.options && question.options.length > 2) {
        hints.push('Try to eliminate options that are clearly wrong first.');
      }
      hints.push('Look for keywords in the question that match the correct answer.');
      break;

    case 'true-false':
      hints.push('Look for absolute words like "always", "never", "all" - they often indicate false statements.');
      hints.push('Think about whether there could be any exceptions to the statement.');
      hints.push('Read the statement very carefully - one wrong word can make it false.');
      break;

    case 'short-answer':
      hints.push('Make sure to spell your answer correctly.');
      hints.push('Keep your answer short and focused on what\'s being asked.');
      hints.push('Double-check your answer before submitting.');
      break;
  }

  // Add subject-specific hints based on keywords
  const questionLower = question.question.toLowerCase();

  // Math hints
  if (questionLower.includes('add') || questionLower.includes('sum') || questionLower.includes('+')) {
    hints.push('Remember: Addition means combining numbers together.');
  }
  if (questionLower.includes('subtract') || questionLower.includes('minus') || questionLower.includes('-')) {
    hints.push('Remember: Subtraction means taking away from a number.');
  }
  if (questionLower.includes('multiply') || questionLower.includes('times') || questionLower.includes('×')) {
    hints.push('Multiplication is like repeated addition.');
  }
  if (questionLower.includes('divide') || questionLower.includes('÷') || questionLower.includes('split')) {
    hints.push('Division means splitting into equal parts.');
  }

  // Reading/English hints
  if (questionLower.includes('main idea')) {
    hints.push('The main idea is what the whole text is mostly about.');
  }
  if (questionLower.includes('synonym')) {
    hints.push('A synonym is a word that means the same or nearly the same as another word.');
  }
  if (questionLower.includes('antonym') || questionLower.includes('opposite')) {
    hints.push('An antonym is a word that means the opposite of another word.');
  }

  // Remove duplicates and return
  return [...new Set(hints)];
}

export default function SmartHint({
  question,
  wrongAttempts,
  hasAnswered,
  onHintUsed,
}: SmartHintProps) {
  const [currentHintIndex, setCurrentHintIndex] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [hintsUsed, setHintsUsed] = useState(0);

  const allHints = generateSmartHints(question);

  // Don't show if already answered
  if (hasAnswered) {
    return null;
  }

  const handleShowHint = () => {
    if (!showHint) {
      setShowHint(true);
      setHintsUsed(prev => prev + 1);
      onHintUsed?.();
    }
  };

  const handleNextHint = () => {
    if (currentHintIndex < allHints.length - 1) {
      setCurrentHintIndex(prev => prev + 1);
      setHintsUsed(prev => prev + 1);
      onHintUsed?.();
    }
  };

  const handlePrevHint = () => {
    if (currentHintIndex > 0) {
      setCurrentHintIndex(prev => prev - 1);
    }
  };

  // Determine hint level based on wrong attempts
  const getHintLevel = () => {
    if (wrongAttempts >= 2) return 'helpful';
    if (wrongAttempts >= 1) return 'gentle';
    return 'available';
  };

  const hintLevel = getHintLevel();

  const levelConfig = {
    available: {
      buttonText: 'Need a Hint?',
      buttonClass: 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100',
      icon: '💡',
    },
    gentle: {
      buttonText: 'Get a Hint',
      buttonClass: 'bg-amber-100 text-amber-800 border-amber-300 hover:bg-amber-200',
      icon: '💡',
    },
    helpful: {
      buttonText: 'Here\'s a Hint!',
      buttonClass: 'bg-amber-200 text-amber-900 border-amber-400 animate-pulse',
      icon: '🌟',
    },
  };

  const config = levelConfig[hintLevel];

  return (
    <div className="space-y-3">
      {!showHint ? (
        <button
          type="button"
          onClick={handleShowHint}
          className={`
            inline-flex items-center gap-2 px-4 py-2 rounded-xl border-2
            font-medium text-sm transition-all
            ${config.buttonClass}
          `}
        >
          <span className="text-lg">{config.icon}</span>
          {config.buttonText}
        </button>
      ) : (
        <div className="rounded-xl bg-gradient-to-br from-amber-50 to-yellow-50 border-2 border-amber-200 p-4 animate-fadeIn">
          {/* Hint Header */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-xl">💡</span>
              <span className="font-bold text-amber-800">
                Hint {currentHintIndex + 1} of {allHints.length}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setShowHint(false)}
              className="text-amber-600 hover:text-amber-800 p-1"
            >
              ✕
            </button>
          </div>

          {/* Hint Content */}
          <div className="bg-white/60 rounded-lg p-3 mb-3">
            <p className="text-amber-900 leading-relaxed">
              {allHints[currentHintIndex]}
            </p>
          </div>

          {/* Navigation */}
          {allHints.length > 1 && (
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={handlePrevHint}
                disabled={currentHintIndex === 0}
                className={`
                  px-3 py-1 text-sm rounded-lg transition-colors
                  ${currentHintIndex === 0
                    ? 'text-amber-300 cursor-not-allowed'
                    : 'text-amber-700 hover:bg-amber-100'
                  }
                `}
              >
                ← Previous
              </button>

              <div className="flex gap-1">
                {allHints.map((_, idx) => (
                  <div
                    key={idx}
                    className={`w-2 h-2 rounded-full ${
                      idx === currentHintIndex ? 'bg-amber-500' : 'bg-amber-200'
                    }`}
                  />
                ))}
              </div>

              <button
                type="button"
                onClick={handleNextHint}
                disabled={currentHintIndex >= allHints.length - 1}
                className={`
                  px-3 py-1 text-sm rounded-lg transition-colors
                  ${currentHintIndex >= allHints.length - 1
                    ? 'text-amber-300 cursor-not-allowed'
                    : 'text-amber-700 hover:bg-amber-100'
                  }
                `}
              >
                More Hints →
              </button>
            </div>
          )}

          {/* Encouragement message */}
          {wrongAttempts >= 2 && (
            <div className="mt-3 pt-3 border-t border-amber-200">
              <p className="text-sm text-amber-700 flex items-center gap-2">
                <span>🌟</span>
                Don't give up! You're learning with every try.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
