'use client';

import { useState, useEffect, useRef } from 'react';
import type { Question, Answer } from '@/types';
import MultipleChoiceInput from './MultipleChoiceInput';
import TrueFalseInput from './TrueFalseInput';
import ShortAnswerInput from './ShortAnswerInput';
import FeedbackDisplay from './FeedbackDisplay';
import Button from '@/components/ui/Button';
import TextToSpeechButton from '@/components/ai/TextToSpeechButton';
import SmartHint from '@/components/ai/SmartHint';

interface QuestionDisplayProps {
  question: Question;
  questionNumber: number;
  existingAnswer?: Answer;
  onSubmit: (answer: string | number) => boolean;
  disabled?: boolean;
  showAIFeatures?: boolean;
}

export default function QuestionDisplay({
  question,
  questionNumber,
  existingAnswer,
  onSubmit,
  disabled = false,
  showAIFeatures = true,
}: QuestionDisplayProps) {
  const prevQuestionIdRef = useRef<string>(question.id);
  const [currentAnswer, setCurrentAnswer] = useState<string | number | undefined>(
    existingAnswer?.answer
  );
  const [hasSubmitted, setHasSubmitted] = useState(!!existingAnswer);
  const [showHint, setShowHint] = useState(false);
  const [wrongAttempts, setWrongAttempts] = useState(0);
  const [feedback, setFeedback] = useState<{
    isCorrect: boolean;
    points: number;
    similarityScore?: number;
    matchingMethod?: 'exact' | 'fuzzy' | 'none';
  } | null>(existingAnswer ? {
    isCorrect: existingAnswer.isCorrect,
    points: existingAnswer.points,
    similarityScore: existingAnswer.similarityScore,
    matchingMethod: existingAnswer.matchingMethod,
  } : null);

  // Generate full text for TTS including options
  const getFullQuestionText = () => {
    let text = `Question ${questionNumber}. ${question.question}`;
    if (question.type === 'multiple-choice' && question.options) {
      text += '. The options are: ';
      question.options.forEach((opt, idx) => {
        text += `Option ${idx + 1}: ${opt}. `;
      });
    } else if (question.type === 'true-false') {
      text += '. Is this statement true or false?';
    }
    return text;
  };

  // Reset state when question changes
  useEffect(() => {
    if (prevQuestionIdRef.current !== question.id) {
      prevQuestionIdRef.current = question.id;
      setCurrentAnswer(existingAnswer?.answer);
      setHasSubmitted(!!existingAnswer);
      setShowHint(false);
      setWrongAttempts(0);
      setFeedback(
        existingAnswer
          ? {
              isCorrect: existingAnswer.isCorrect,
              points: existingAnswer.points,
              similarityScore: existingAnswer.similarityScore,
              matchingMethod: existingAnswer.matchingMethod,
            }
          : null
      );
    }
  }, [question.id, existingAnswer]);

  const handleSubmit = () => {
    if (currentAnswer === undefined || hasSubmitted) return;

    const isCorrect = onSubmit(currentAnswer);
    const points = isCorrect ? question.points : 0;

    if (!isCorrect) {
      setWrongAttempts(prev => prev + 1);
    }

    setFeedback({ isCorrect, points });
    setHasSubmitted(true);
  };

  const canSubmit = currentAnswer !== undefined && !hasSubmitted;

  return (
    <div className="space-y-6">
      {/* Question text */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-[#00d4ff] uppercase tracking-wider">
              Question {questionNumber}
            </span>
            <span className="text-sm font-semibold text-[#334155]">
              • {question.points} {question.points === 1 ? 'point' : 'points'}
            </span>
          </div>
          {/* Text-to-Speech Button */}
          {showAIFeatures && (
            <TextToSpeechButton
              text={getFullQuestionText()}
              label="Read Question"
              size="sm"
              showSpeedControl={true}
            />
          )}
        </div>
        <h2 className="text-xl font-bold text-[#0f172a] leading-relaxed">
          {question.question}
        </h2>
      </div>

      {/* Smart Hint Section (AI-powered) */}
      {showAIFeatures && !hasSubmitted && (
        <SmartHint
          question={question}
          wrongAttempts={wrongAttempts}
          hasAnswered={hasSubmitted}
        />
      )}

      {/* Legacy Hint Section (fallback if AI features disabled) */}
      {!showAIFeatures && question.hint && !hasSubmitted && (
        <div className="space-y-2">
          <button
            type="button"
            onClick={() => setShowHint(!showHint)}
            className="flex items-center gap-2 text-sm font-medium text-amber-600 hover:text-amber-700 transition-colors"
          >
            <span className="text-lg">💡</span>
            {showHint ? 'Hide Hint' : 'Need a Hint?'}
          </button>
          {showHint && (
            <div className="px-4 py-3 rounded-xl bg-amber-50 border-2 border-amber-200 animate-fadeIn">
              <p className="text-sm text-amber-900">
                <span className="font-semibold">Hint: </span>
                {question.hint}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Input based on question type */}
      <div>
        {question.type === 'multiple-choice' && question.options && (
          <MultipleChoiceInput
            options={question.options}
            selectedValue={currentAnswer as number | undefined}
            onChange={setCurrentAnswer}
            disabled={hasSubmitted || disabled}
          />
        )}

        {question.type === 'true-false' && (
          <TrueFalseInput
            selectedValue={currentAnswer as number | undefined}
            onChange={setCurrentAnswer}
            disabled={hasSubmitted || disabled}
          />
        )}

        {question.type === 'short-answer' && (
          <ShortAnswerInput
            value={currentAnswer as string | undefined}
            onChange={setCurrentAnswer}
            disabled={hasSubmitted || disabled}
          />
        )}
      </div>

      {/* Submit button */}
      {!hasSubmitted && (
        <Button
          onClick={handleSubmit}
          disabled={!canSubmit || disabled}
          variant="primary"
          size="lg"
          className="w-full"
        >
          Submit Answer
        </Button>
      )}

      {/* Feedback */}
      {hasSubmitted && feedback && (
        <FeedbackDisplay
          isCorrect={feedback.isCorrect}
          points={feedback.points}
          maxPoints={question.points}
          question={question}
          studentAnswer={currentAnswer}
          similarityScore={existingAnswer?.similarityScore || feedback.similarityScore}
          matchingMethod={existingAnswer?.matchingMethod || feedback.matchingMethod}
        />
      )}
    </div>
  );
}
