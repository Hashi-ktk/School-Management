'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import TextToSpeechButton from '@/components/ai/TextToSpeechButton';
import { getAllResults, getAssessmentById } from '@/lib/utils';
import type { AssessmentResult } from '@/types';

interface PracticeQuestion {
  id: string;
  question: string;
  type: 'multiple-choice' | 'true-false' | 'short-answer';
  options?: string[];
  correctAnswer: string | number;
  subject: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

// Sample practice questions organized by subject and difficulty
const practiceBank: Record<string, PracticeQuestion[]> = {
  Mathematics: [
    { id: 'm1', question: 'What is 5 + 3?', type: 'multiple-choice', options: ['6', '7', '8', '9'], correctAnswer: 2, subject: 'Mathematics', difficulty: 'easy' },
    { id: 'm2', question: 'What is 12 - 7?', type: 'multiple-choice', options: ['4', '5', '6', '7'], correctAnswer: 1, subject: 'Mathematics', difficulty: 'easy' },
    { id: 'm3', question: '6 × 4 = 24', type: 'true-false', correctAnswer: 0, subject: 'Mathematics', difficulty: 'medium' },
    { id: 'm4', question: 'What is 15 ÷ 3?', type: 'short-answer', correctAnswer: '5', subject: 'Mathematics', difficulty: 'medium' },
    { id: 'm5', question: 'What is 7 × 8?', type: 'multiple-choice', options: ['54', '56', '58', '62'], correctAnswer: 1, subject: 'Mathematics', difficulty: 'hard' },
    { id: 'm6', question: 'What is 144 ÷ 12?', type: 'short-answer', correctAnswer: '12', subject: 'Mathematics', difficulty: 'hard' },
  ],
  English: [
    { id: 'e1', question: 'The opposite of "hot" is:', type: 'multiple-choice', options: ['warm', 'cold', 'cool', 'heat'], correctAnswer: 1, subject: 'English', difficulty: 'easy' },
    { id: 'e2', question: '"Apple" is a noun.', type: 'true-false', correctAnswer: 0, subject: 'English', difficulty: 'easy' },
    { id: 'e3', question: 'What is the plural of "child"?', type: 'short-answer', correctAnswer: 'children', subject: 'English', difficulty: 'medium' },
    { id: 'e4', question: 'Choose the correct sentence:', type: 'multiple-choice', options: ['She go to school.', 'She goes to school.', 'She going to school.', 'She gone to school.'], correctAnswer: 1, subject: 'English', difficulty: 'medium' },
    { id: 'e5', question: '"Quickly" is an adverb.', type: 'true-false', correctAnswer: 0, subject: 'English', difficulty: 'hard' },
  ],
  Urdu: [
    { id: 'u1', question: '"کتاب" کا مطلب کیا ہے؟', type: 'multiple-choice', options: ['Pen', 'Book', 'Table', 'Chair'], correctAnswer: 1, subject: 'Urdu', difficulty: 'easy' },
    { id: 'u2', question: '"سیب" ایک پھل ہے۔', type: 'true-false', correctAnswer: 0, subject: 'Urdu', difficulty: 'easy' },
    { id: 'u3', question: '"بڑا" کی ضد کیا ہے؟', type: 'multiple-choice', options: ['لمبا', 'چھوٹا', 'موٹا', 'پتلا'], correctAnswer: 1, subject: 'Urdu', difficulty: 'medium' },
  ],
};

// Helper function to generate TTS text for questions
const getQuestionTextForTTS = (question: PracticeQuestion): string => {
  let text = question.question;

  if (question.type === 'multiple-choice' && question.options) {
    text += '. The options are: ';
    text += question.options.map((opt, idx) => `${String.fromCharCode(65 + idx)}, ${opt}`).join('. ');
  } else if (question.type === 'true-false') {
    text += '. Is this true or false?';
  } else if (question.type === 'short-answer') {
    text += '. Type your answer.';
  }

  return text;
};

export default function PracticeModePage() {
  const { user, isLoading } = useAuth();
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<PracticeQuestion | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<string | number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [practiceStats, setPracticeStats] = useState({ correct: 0, total: 0 });
  const [weakSubjects, setWeakSubjects] = useState<string[]>([]);
  const [streak, setStreak] = useState(0);

  // Analyze weak subjects from results
  useEffect(() => {
    if (!user) return;

    const results = getAllResults().filter(r => r.studentId === user.id && r.status === 'completed');
    const subjectScores: Record<string, { total: number; count: number }> = {};

    results.forEach(r => {
      if (!subjectScores[r.subject]) {
        subjectScores[r.subject] = { total: 0, count: 0 };
      }
      subjectScores[r.subject].total += r.percentage;
      subjectScores[r.subject].count++;
    });

    const weak = Object.entries(subjectScores)
      .filter(([_, stats]) => stats.total / stats.count < 70)
      .map(([subject]) => subject);

    setWeakSubjects(weak);
  }, [user]);

  const startPractice = (subject: string) => {
    setSelectedSubject(subject);
    selectRandomQuestion(subject);
    setPracticeStats({ correct: 0, total: 0 });
    setStreak(0);
  };

  const selectRandomQuestion = (subject: string) => {
    const questions = practiceBank[subject] || [];
    if (questions.length === 0) return;

    const randomIndex = Math.floor(Math.random() * questions.length);
    setCurrentQuestion(questions[randomIndex]);
    setSelectedAnswer(null);
    setShowResult(false);
  };

  const checkAnswer = () => {
    if (!currentQuestion || selectedAnswer === null) return;

    const isCorrect = selectedAnswer === currentQuestion.correctAnswer ||
      (currentQuestion.type === 'short-answer' &&
        String(selectedAnswer).toLowerCase().trim() === String(currentQuestion.correctAnswer).toLowerCase().trim());

    setShowResult(true);
    setPracticeStats(prev => ({
      correct: prev.correct + (isCorrect ? 1 : 0),
      total: prev.total + 1,
    }));

    if (isCorrect) {
      setStreak(prev => prev + 1);
    } else {
      setStreak(0);
    }
  };

  const nextQuestion = () => {
    if (selectedSubject) {
      selectRandomQuestion(selectedSubject);
    }
  };

  const endPractice = () => {
    setSelectedSubject(null);
    setCurrentQuestion(null);
  };

  if (isLoading || !user) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="h-12 w-12 rounded-full border-4 border-purple-200 border-t-purple-500 animate-spin" />
      </div>
    );
  }

  // Subject selection screen
  if (!selectedSubject) {
    return (
      <div className="space-y-8 max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-slate-800">Practice Mode</h1>
          <p className="text-lg text-slate-600">
            Strengthen your skills with AI-powered practice questions
          </p>
        </div>

        {/* AI Recommendation */}
        {weakSubjects.length > 0 && (
          <Card className="bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-200">
            <div className="flex items-start gap-4">
              <div className="text-3xl">🤖</div>
              <div>
                <h3 className="font-bold text-amber-800">AI Recommendation</h3>
                <p className="text-amber-700 text-sm mt-1">
                  Based on your results, we recommend practicing: <strong>{weakSubjects.join(', ')}</strong>
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* Subject Selection */}
        <div className="grid md:grid-cols-3 gap-6">
          {['Mathematics', 'English', 'Urdu'].map(subject => {
            const isWeak = weakSubjects.includes(subject);
            const questions = practiceBank[subject]?.length || 0;

            return (
              <Card
                key={subject}
                className={`text-center cursor-pointer transition-all hover:scale-105 ${
                  isWeak ? 'ring-2 ring-amber-400 bg-amber-50' : ''
                }`}
                onClick={() => startPractice(subject)}
              >
                <div className="space-y-4">
                  <div className="text-5xl">
                    {subject === 'Mathematics' ? '🔢' : subject === 'English' ? '📖' : '📝'}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-800">{subject}</h3>
                    <p className="text-sm text-slate-500">{questions} practice questions</p>
                  </div>
                  {isWeak && (
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-amber-100 text-amber-700 text-xs font-bold rounded-full">
                      ⭐ Recommended
                    </span>
                  )}
                  <Button variant="primary" className="w-full">
                    Start Practice
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Tips */}
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <div className="flex items-start gap-4">
            <div className="text-3xl">💡</div>
            <div>
              <h3 className="font-bold text-blue-800">Practice Tips</h3>
              <ul className="text-blue-700 text-sm mt-2 space-y-1">
                <li>• Practice a little every day for best results</li>
                <li>• Focus on subjects where you need improvement</li>
                <li>• Try to build a streak of correct answers!</li>
              </ul>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  // Practice session
  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">{selectedSubject} Practice</h1>
          <p className="text-slate-600">Keep practicing to improve!</p>
        </div>
        <Button variant="outline" onClick={endPractice}>
          End Practice
        </Button>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="text-center py-3">
          <p className="text-2xl font-bold text-emerald-600">{practiceStats.correct}</p>
          <p className="text-xs text-slate-500">Correct</p>
        </Card>
        <Card className="text-center py-3">
          <p className="text-2xl font-bold text-slate-700">{practiceStats.total}</p>
          <p className="text-xs text-slate-500">Attempted</p>
        </Card>
        <Card className={`text-center py-3 ${streak >= 3 ? 'bg-amber-50 border-amber-200' : ''}`}>
          <p className="text-2xl font-bold text-amber-600">🔥 {streak}</p>
          <p className="text-xs text-slate-500">Streak</p>
        </Card>
      </div>

      {/* Question Card */}
      {currentQuestion && (
        <Card className="space-y-6">
          <div className="flex items-center justify-between">
            <span className={`px-3 py-1 rounded-full text-xs font-bold ${
              currentQuestion.difficulty === 'easy' ? 'bg-emerald-100 text-emerald-700' :
              currentQuestion.difficulty === 'medium' ? 'bg-amber-100 text-amber-700' :
              'bg-red-100 text-red-700'
            }`}>
              {currentQuestion.difficulty.toUpperCase()}
            </span>
          </div>

          <div className="flex items-start gap-3">
            <h2 className="text-xl font-bold text-slate-800 flex-1">{currentQuestion.question}</h2>
            <TextToSpeechButton
              text={getQuestionTextForTTS(currentQuestion)}
              size="md"
            />
          </div>

          {/* Answer Options */}
          <div className="space-y-3">
            {currentQuestion.type === 'multiple-choice' && currentQuestion.options?.map((option, idx) => (
              <button
                key={idx}
                onClick={() => !showResult && setSelectedAnswer(idx)}
                disabled={showResult}
                className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                  showResult
                    ? idx === currentQuestion.correctAnswer
                      ? 'bg-emerald-100 border-emerald-500 text-emerald-800'
                      : idx === selectedAnswer
                        ? 'bg-red-100 border-red-500 text-red-800'
                        : 'bg-slate-50 border-slate-200'
                    : selectedAnswer === idx
                      ? 'bg-purple-100 border-purple-500'
                      : 'bg-white border-slate-200 hover:border-purple-300'
                }`}
              >
                <span className="font-medium">{String.fromCharCode(65 + idx)}.</span> {option}
              </button>
            ))}

            {currentQuestion.type === 'true-false' && (
              <div className="flex gap-4">
                {['True', 'False'].map((option, idx) => (
                  <button
                    key={option}
                    onClick={() => !showResult && setSelectedAnswer(idx)}
                    disabled={showResult}
                    className={`flex-1 p-4 rounded-xl border-2 font-bold transition-all ${
                      showResult
                        ? idx === currentQuestion.correctAnswer
                          ? 'bg-emerald-100 border-emerald-500 text-emerald-800'
                          : idx === selectedAnswer
                            ? 'bg-red-100 border-red-500 text-red-800'
                            : 'bg-slate-50 border-slate-200'
                        : selectedAnswer === idx
                          ? 'bg-purple-100 border-purple-500'
                          : 'bg-white border-slate-200 hover:border-purple-300'
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            )}

            {currentQuestion.type === 'short-answer' && (
              <input
                type="text"
                value={selectedAnswer as string || ''}
                onChange={(e) => !showResult && setSelectedAnswer(e.target.value)}
                disabled={showResult}
                placeholder="Type your answer..."
                className={`w-full p-4 rounded-xl border-2 text-lg ${
                  showResult
                    ? String(selectedAnswer).toLowerCase().trim() === String(currentQuestion.correctAnswer).toLowerCase().trim()
                      ? 'bg-emerald-100 border-emerald-500'
                      : 'bg-red-100 border-red-500'
                    : 'border-slate-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200'
                }`}
              />
            )}
          </div>

          {/* Result Message */}
          {showResult && (
            <div className={`p-4 rounded-xl ${
              (currentQuestion.type === 'short-answer'
                ? String(selectedAnswer).toLowerCase().trim() === String(currentQuestion.correctAnswer).toLowerCase().trim()
                : selectedAnswer === currentQuestion.correctAnswer)
                ? 'bg-emerald-100 text-emerald-800'
                : 'bg-red-100 text-red-800'
            }`}>
              {(currentQuestion.type === 'short-answer'
                ? String(selectedAnswer).toLowerCase().trim() === String(currentQuestion.correctAnswer).toLowerCase().trim()
                : selectedAnswer === currentQuestion.correctAnswer)
                ? '✅ Correct! Great job!'
                : `❌ Not quite. The correct answer is: ${
                    currentQuestion.type === 'multiple-choice' && currentQuestion.options
                      ? currentQuestion.options[currentQuestion.correctAnswer as number]
                      : currentQuestion.type === 'true-false'
                        ? currentQuestion.correctAnswer === 0 ? 'True' : 'False'
                        : currentQuestion.correctAnswer
                  }`
              }
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-4">
            {!showResult ? (
              <Button
                variant="primary"
                className="flex-1"
                onClick={checkAnswer}
                disabled={selectedAnswer === null}
              >
                Check Answer
              </Button>
            ) : (
              <Button
                variant="primary"
                className="flex-1"
                onClick={nextQuestion}
              >
                Next Question →
              </Button>
            )}
          </div>
        </Card>
      )}

      {/* Streak Celebration */}
      {streak >= 5 && (
        <Card className="bg-gradient-to-r from-amber-100 to-yellow-100 border-amber-300 text-center">
          <div className="text-4xl mb-2">🔥🎉</div>
          <h3 className="text-lg font-bold text-amber-800">{streak} in a row! You're on fire!</h3>
        </Card>
      )}
    </div>
  );
}
