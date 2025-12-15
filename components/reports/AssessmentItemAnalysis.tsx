'use client';

import React from 'react';
import type { AssessmentItemAnalysis, QuestionStats } from '@/lib/itemAnalysis';

interface AssessmentItemAnalysisProps {
  data: AssessmentItemAnalysis;
  onClose?: () => void;
}

export default function AssessmentItemAnalysisComponent({ data, onClose }: AssessmentItemAnalysisProps) {
  const { assessmentTitle, subject, grade, totalStudents, questionStats, averageScore, passRate } = data;

  const getDifficultyColor = (difficulty: string) => {
    if (difficulty === 'Easy') return 'bg-green-500/20 text-green-400 print:bg-green-100 print:text-green-800';
    if (difficulty === 'Medium') return 'bg-yellow-500/20 text-yellow-400 print:bg-yellow-100 print:text-yellow-800';
    return 'bg-red-500/20 text-red-400 print:bg-red-100 print:text-red-800';
  };

  const getDiscriminationLevel = (index: number): { label: string; color: string } => {
    if (index >= 0.4) return { label: 'Excellent', color: 'text-green-400 print:text-black' };
    if (index >= 0.3) return { label: 'Good', color: 'text-blue-400 print:text-black' };
    if (index >= 0.2) return { label: 'Fair', color: 'text-yellow-400 print:text-black' };
    if (index >= 0) return { label: 'Poor', color: 'text-orange-400 print:text-black' };
    return { label: 'Problematic', color: 'text-red-400 print:text-black' };
  };

  const problematicQuestions = questionStats.filter(q => q.correctPercentage < 40);
  const poorDiscrimination = questionStats.filter(q => q.discriminationIndex < 0.2);

  return (
    <div
      id="assessment-item-analysis"
      className="bg-white text-slate-800 p-8 rounded-lg max-w-6xl mx-auto border border-slate-200 shadow-sm print:shadow-none print:border-0"
    >
      {/* Header */}
      <div className="border-b border-slate-200 pb-6 mb-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">
              Assessment Item Analysis
            </h1>
            <p className="text-xl mt-2 text-slate-600">{assessmentTitle}</p>
            <p className="text-slate-500 mt-1">
              {subject} • Grade {grade}
            </p>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 print:hidden"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Overview Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
          <p className="text-slate-500 text-sm">Total Students</p>
          <p className="text-3xl font-bold text-blue-600">{totalStudents}</p>
        </div>
        <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
          <p className="text-slate-500 text-sm">Total Questions</p>
          <p className="text-3xl font-bold text-purple-600">{questionStats.length}</p>
        </div>
        <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
          <p className="text-slate-500 text-sm">Average Score</p>
          <p className="text-3xl font-bold text-emerald-600">{averageScore}%</p>
        </div>
        <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
          <p className="text-slate-500 text-sm">Pass Rate</p>
          <p className="text-3xl font-bold text-amber-600">{passRate}%</p>
        </div>
      </div>

      {/* Difficulty Distribution */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4 text-slate-800">
          Question Difficulty Distribution
        </h2>
        <div className="grid grid-cols-3 gap-4">
          {['Easy', 'Medium', 'Hard'].map((difficulty) => {
            const count = questionStats.filter(q => q.difficulty === difficulty).length;
            const percentage = Math.round((count / questionStats.length) * 100);
            return (
              <div
                key={difficulty}
                className="bg-slate-50 p-4 rounded-lg border border-slate-200"
              >
                <div className="flex justify-between items-center mb-2">
                  <span className="font-semibold text-slate-700">{difficulty}</span>
                  <span className="text-2xl font-bold text-slate-800">{count}</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${
                      difficulty === 'Easy'
                        ? 'bg-emerald-500'
                        : difficulty === 'Medium'
                        ? 'bg-amber-500'
                        : 'bg-red-500'
                    }`}
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
                <p className="text-sm text-slate-500 mt-1">{percentage}% of questions</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Alerts */}
      {(problematicQuestions.length > 0 || poorDiscrimination.length > 0) && (
        <div className="mb-8 space-y-4">
          {problematicQuestions.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-red-700 mb-2">
                ⚠ {problematicQuestions.length} Problematic Question(s) Detected
              </h3>
              <p className="text-sm text-slate-600">
                These questions have a correct response rate below 40%. Consider reviewing for clarity, difficulty, or errors.
              </p>
            </div>
          )}
          {poorDiscrimination.length > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-amber-700 mb-2">
                ⚠ {poorDiscrimination.length} Question(s) with Poor Discrimination
              </h3>
              <p className="text-sm text-slate-600">
                These questions do not effectively differentiate between high and low performers.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Detailed Question Statistics */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4 text-blue-400 print:text-black">
          Detailed Question Analysis
        </h2>
        <div className="space-y-4">
          {questionStats.map((question, index) => {
            const discrimination = getDiscriminationLevel(question.discriminationIndex);
            return (
              <div
                key={question.questionId}
                className="bg-gray-800 rounded-lg p-5 print:bg-gray-100 print:border print:border-gray-300"
              >
                {/* Question Header */}
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="bg-blue-500/20 text-blue-400 px-2 py-1 rounded text-sm font-semibold print:bg-blue-100 print:text-blue-800">
                        Q{index + 1}
                      </span>
                      <span className={`px-2 py-1 rounded text-sm font-semibold ${getDifficultyColor(question.difficulty)}`}>
                        {question.difficulty}
                      </span>
                      <span className="text-xs text-gray-400 print:text-gray-600">
                        {question.type}
                      </span>
                    </div>
                    <p className="text-gray-300 print:text-gray-700">{question.questionText}</p>
                  </div>
                </div>

                {/* Statistics Grid */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-3">
                  <div>
                    <p className="text-xs text-gray-400 print:text-gray-600">Attempts</p>
                    <p className="text-lg font-semibold">{question.totalAttempts}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 print:text-gray-600">Correct</p>
                    <p className="text-lg font-semibold text-green-400 print:text-black">
                      {question.correctAttempts}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 print:text-gray-600">Incorrect</p>
                    <p className="text-lg font-semibold text-red-400 print:text-black">
                      {question.incorrectAttempts}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 print:text-gray-600">Success Rate</p>
                    <p className="text-lg font-semibold">{question.correctPercentage}%</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 print:text-gray-600">Avg Points</p>
                    <p className="text-lg font-semibold">
                      {question.averagePoints}/{question.maxPoints}
                    </p>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-gray-700 rounded-full h-3 mb-3 print:bg-gray-300">
                  <div
                    className={`h-3 rounded-full ${
                      question.correctPercentage >= 70
                        ? 'bg-green-500'
                        : question.correctPercentage >= 40
                        ? 'bg-yellow-500'
                        : 'bg-red-500'
                    }`}
                    style={{ width: `${question.correctPercentage}%` }}
                  ></div>
                </div>

                {/* Discrimination Index */}
                <div className="flex items-center justify-between text-sm">
                  <div>
                    <span className="text-gray-400 print:text-gray-600">Discrimination Index: </span>
                    <span className={`font-semibold ${discrimination.color}`}>
                      {question.discriminationIndex} ({discrimination.label})
                    </span>
                  </div>
                  {question.discriminationIndex < 0 && (
                    <span className="text-red-400 text-xs print:text-black">
                      ⚠ Review for possible errors
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recommendations */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4 text-purple-400 print:text-black">
          Recommendations
        </h2>
        <div className="bg-gray-800 rounded-lg p-5 space-y-3 print:bg-gray-100 print:border print:border-gray-300">
          {averageScore >= 80 && (
            <p className="flex items-start">
              <span className="text-green-400 mr-2 print:text-black">✓</span>
              <span>Assessment difficulty is appropriate. Students performed well overall.</span>
            </p>
          )}
          {averageScore < 60 && (
            <p className="flex items-start">
              <span className="text-yellow-400 mr-2 print:text-black">⚠</span>
              <span>Assessment may be too difficult. Consider reviewing question clarity and difficulty balance.</span>
            </p>
          )}
          {problematicQuestions.length > 0 && (
            <p className="flex items-start">
              <span className="text-red-400 mr-2 print:text-black">!</span>
              <span>
                Review {problematicQuestions.length} problematic question(s) for potential errors, ambiguous wording, or excessive difficulty.
              </span>
            </p>
          )}
          {poorDiscrimination.length > 0 && (
            <p className="flex items-start">
              <span className="text-yellow-400 mr-2 print:text-black">⚠</span>
              <span>
                {poorDiscrimination.length} question(s) with poor discrimination may need revision to better assess student understanding.
              </span>
            </p>
          )}
          {questionStats.filter(q => q.difficulty === 'Easy').length / questionStats.length > 0.6 && (
            <p className="flex items-start">
              <span className="text-blue-400 mr-2 print:text-black">→</span>
              <span>Consider adding more challenging questions to better assess advanced understanding.</span>
            </p>
          )}
          {questionStats.filter(q => q.difficulty === 'Hard').length / questionStats.length > 0.5 && (
            <p className="flex items-start">
              <span className="text-blue-400 mr-2 print:text-black">→</span>
              <span>Consider adding easier questions to build student confidence and assess foundational knowledge.</span>
            </p>
          )}
        </div>
      </div>

      {/* Understanding Discrimination Index */}
      <div className="bg-gray-800/50 rounded-lg p-5 print:bg-gray-100 print:border print:border-gray-300">
        <h3 className="text-lg font-semibold mb-3 text-blue-400 print:text-black">
          Understanding the Discrimination Index
        </h3>
        <p className="text-sm text-gray-400 mb-3 print:text-gray-600">
          The discrimination index measures how well a question differentiates between high-performing and low-performing students.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
          <div>
            <p className="font-semibold text-green-400 print:text-black">0.40 or higher - Excellent</p>
            <p className="text-gray-400 print:text-gray-600">Question effectively identifies knowledge differences</p>
          </div>
          <div>
            <p className="font-semibold text-blue-400 print:text-black">0.30-0.39 - Good</p>
            <p className="text-gray-400 print:text-gray-600">Reasonably good discrimination</p>
          </div>
          <div>
            <p className="font-semibold text-yellow-400 print:text-black">0.20-0.29 - Fair</p>
            <p className="text-gray-400 print:text-gray-600">May need minor revision</p>
          </div>
          <div>
            <p className="font-semibold text-red-400 print:text-black">Below 0.20 - Poor/Problematic</p>
            <p className="text-gray-400 print:text-gray-600">Question needs significant revision or removal</p>
          </div>
        </div>
      </div>
    </div>
  );
}
