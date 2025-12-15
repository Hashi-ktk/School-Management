'use client';

import { useState } from 'react';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import type { Question } from '@/types';

interface QuestionBuilderProps {
  onSave: (question: Omit<Question, 'id'>) => void;
  onCancel: () => void;
  existingQuestion?: Question;
}

export default function QuestionBuilder({
  onSave,
  onCancel,
  existingQuestion,
}: QuestionBuilderProps) {
  const [questionType, setQuestionType] = useState<Question['type']>(
    existingQuestion?.type || 'multiple-choice'
  );
  const [questionText, setQuestionText] = useState(existingQuestion?.question || '');
  const [options, setOptions] = useState<string[]>(
    existingQuestion?.options || ['', '', '', '']
  );
  const [correctAnswer, setCorrectAnswer] = useState<string | number>(
    existingQuestion?.correctAnswer || ''
  );
  const [points, setPoints] = useState(existingQuestion?.points?.toString() || '1');
  const [hint, setHint] = useState(existingQuestion?.hint || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    let questionData: Omit<Question, 'id'>;

    switch (questionType) {
      case 'multiple-choice':
        // Filter out empty options
        const filteredOptions = options.filter((opt) => opt.trim() !== '');
        if (filteredOptions.length < 2) {
          alert('Multiple choice questions need at least 2 options');
          return;
        }
        if (!correctAnswer || !filteredOptions.includes(correctAnswer as string)) {
          alert('Please select a valid correct answer');
          return;
        }
        questionData = {
          type: 'multiple-choice',
          question: questionText,
          options: filteredOptions,
          correctAnswer: correctAnswer as string,
          points: Number(points),
          hint: hint || undefined,
        };
        break;

      case 'true-false':
        if (correctAnswer !== 'true' && correctAnswer !== 'false') {
          alert('Please select the correct answer (True or False)');
          return;
        }
        questionData = {
          type: 'true-false',
          question: questionText,
          correctAnswer: correctAnswer as string,
          points: Number(points),
          hint: hint || undefined,
        };
        break;

      case 'short-answer':
        if (!correctAnswer || (correctAnswer as string).trim() === '') {
          alert('Please provide the correct answer');
          return;
        }
        questionData = {
          type: 'short-answer',
          question: questionText,
          correctAnswer: (correctAnswer as string).trim(),
          points: Number(points),
          hint: hint || undefined,
        };
        break;
    }

    onSave(questionData);
  };

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const addOption = () => {
    setOptions([...options, '']);
  };

  const removeOption = (index: number) => {
    if (options.length <= 2) {
      alert('Multiple choice questions need at least 2 options');
      return;
    }
    setOptions(options.filter((_, i) => i !== index));
  };

  const handleTypeChange = (newType: Question['type']) => {
    setQuestionType(newType);
    // Reset type-specific fields
    if (newType === 'true-false') {
      setCorrectAnswer('');
    } else if (newType === 'multiple-choice') {
      setOptions(['', '', '', '']);
      setCorrectAnswer('');
    } else {
      setCorrectAnswer('');
    }
  };

  return (
    <div className="space-y-6">
      <Card className="mb-0">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Question Type Selector */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-800">Question Type</label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { value: 'multiple-choice', label: 'Multiple Choice' },
                { value: 'true-false', label: 'True/False' },
                { value: 'short-answer', label: 'Short Answer' },
              ].map((type) => (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => handleTypeChange(type.value as Question['type'])}
                  className={`px-4 py-3 rounded-xl border-2 text-sm font-medium transition ${
                    questionType === type.value
                      ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                      : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                  }`}
                >
                  {type.label}
                </button>
              ))}
            </div>
          </div>

          {/* Question Text */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-800">Question</label>
            <textarea
              value={questionText}
              onChange={(e) => setQuestionText(e.target.value)}
              required
              rows={3}
              placeholder="Enter your question here..."
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 transition"
            />
          </div>

          {/* Question Type Specific Fields */}
          {questionType === 'multiple-choice' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-semibold text-slate-800">Answer Options</label>
                <Button type="button" variant="ghost" size="sm" onClick={addOption}>
                  + Add Option
                </Button>
              </div>
              <div className="space-y-2">
                {options.map((option, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="correctAnswer"
                      checked={correctAnswer === option && option !== ''}
                      onChange={() => setCorrectAnswer(option)}
                      className="w-4 h-4 text-indigo-600"
                      disabled={option.trim() === ''}
                    />
                    <input
                      type="text"
                      value={option}
                      onChange={(e) => handleOptionChange(index, e.target.value)}
                      placeholder={`Option ${index + 1}`}
                      className="flex-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition"
                    />
                    {options.length > 2 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeOption(index)}
                        className="text-rose-600 hover:text-rose-700"
                      >
                        ×
                      </Button>
                    )}
                  </div>
                ))}
              </div>
              <p className="text-xs text-slate-500">Select the correct answer by clicking the radio button</p>
            </div>
          )}

          {questionType === 'true-false' && (
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-800">Correct Answer</label>
              <div className="flex gap-3">
                {['true', 'false'].map((value) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setCorrectAnswer(value)}
                    className={`flex-1 px-4 py-3 rounded-xl border-2 text-sm font-medium transition ${
                      correctAnswer === value
                        ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                        : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    {value === 'true' ? 'True' : 'False'}
                  </button>
                ))}
              </div>
            </div>
          )}

          {questionType === 'short-answer' && (
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-800">Expected Answer</label>
              <input
                type="text"
                value={correctAnswer}
                onChange={(e) => setCorrectAnswer(e.target.value)}
                required
                placeholder="Enter the correct answer"
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 transition"
              />
              <p className="text-xs text-slate-500">Answer matching is case-insensitive</p>
            </div>
          )}

          {/* Hint Field */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-800">
              Hint <span className="text-slate-400 font-normal">(Optional)</span>
            </label>
            <textarea
              value={hint}
              onChange={(e) => setHint(e.target.value)}
              rows={2}
              placeholder="Provide a helpful hint for students..."
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 transition"
            />
          </div>

          {/* Points */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-800">Points</label>
            <input
              type="number"
              min={1}
              value={points}
              onChange={(e) => setPoints(e.target.value)}
              required
              className="w-full max-w-xs rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 transition"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
            <Button type="button" variant="ghost" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit">
              {existingQuestion ? 'Update Question' : 'Add Question'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
