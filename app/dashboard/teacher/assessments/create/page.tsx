'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import QuestionBuilder from "@/components/forms/QuestionBuilder";
import { useAuth } from "@/hooks/useAuth";
import { createAssessment } from "@/lib/utils";
import type { Assessment, Question } from "@/types";

export default function CreateAssessmentPage() {
  const { user, isLoading, role } = useAuth();
  const router = useRouter();

  // Assessment metadata
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState<Assessment["subject"]>("Mathematics");
  const [grade, setGrade] = useState("3");
  const [duration, setDuration] = useState("30");

  // Questions management
  const [questions, setQuestions] = useState<Question[]>([]);
  const [showQuestionBuilder, setShowQuestionBuilder] = useState(false);
  const [editingQuestionIndex, setEditingQuestionIndex] = useState<number | null>(null);

  // Preview mode
  const [showPreview, setShowPreview] = useState(false);

  const [submitting, setSubmitting] = useState(false);

  if (isLoading || !user || role !== "teacher") {
    return <div className="min-h-[50vh] grid place-content-center text-slate-600">Loading…</div>;
  }

  const handleAddQuestion = () => {
    setEditingQuestionIndex(null);
    setShowQuestionBuilder(true);
  };

  const handleEditQuestion = (index: number) => {
    setEditingQuestionIndex(index);
    setShowQuestionBuilder(true);
  };

  const handleSaveQuestion = (questionData: Omit<Question, 'id'>) => {
    const newQuestion: Question = {
      ...questionData,
      id: editingQuestionIndex !== null
        ? questions[editingQuestionIndex].id
        : `q-${Date.now()}`,
    };

    if (editingQuestionIndex !== null) {
      // Update existing question
      const updatedQuestions = [...questions];
      updatedQuestions[editingQuestionIndex] = newQuestion;
      setQuestions(updatedQuestions);
    } else {
      // Add new question
      setQuestions([...questions, newQuestion]);
    }

    setShowQuestionBuilder(false);
    setEditingQuestionIndex(null);
  };

  const handleDeleteQuestion = (index: number) => {
    if (confirm('Are you sure you want to delete this question?')) {
      setQuestions(questions.filter((_, i) => i !== index));
    }
  };

  const handlePreview = () => {
    if (questions.length === 0) {
      alert('Please add at least one question before previewing');
      return;
    }
    setShowPreview(true);
  };

  const handleSubmit = () => {
    if (!title.trim()) {
      alert('Please enter an assessment title');
      return;
    }

    if (questions.length === 0) {
      alert('Please add at least one question');
      return;
    }

    setSubmitting(true);

    createAssessment({
      title,
      subject,
      grade: Number(grade),
      duration: Number(duration),
      questions,
      createdBy: user?.id,
    });

    alert("Assessment created successfully!");
    router.push("/dashboard/teacher/assessments");
  };

  const totalPoints = questions.reduce((sum, q) => sum + q.points, 0);

  // Preview Mode
  if (showPreview) {
    return (
      <div className="max-w-5xl mx-auto space-y-8 px-4 md:px-0 py-4">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Preview</p>
            <h1 className="text-3xl font-bold text-slate-800">{title}</h1>
            <div className="flex items-center gap-4 text-sm text-slate-600">
              <span className="px-3 py-1 rounded-full bg-indigo-100 text-indigo-700 font-medium">
                {subject}
              </span>
              <span>Grade {grade}</span>
              <span>{duration} minutes</span>
              <span>{questions.length} questions</span>
              <span className="font-semibold">{totalPoints} points total</span>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={() => setShowPreview(false)}>
            ← Back to Edit
          </Button>
        </div>

        <div className="space-y-4">
          {questions.map((question, index) => (
            <Card key={question.id} className="mb-0">
              <div className="flex items-start justify-between gap-4 mb-4">
                <h3 className="text-lg font-semibold text-slate-800">
                  Question {index + 1}
                  <span className="ml-2 text-sm font-normal text-slate-500">
                    ({question.points} {question.points === 1 ? 'point' : 'points'})
                  </span>
                </h3>
                <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-medium">
                  {question.type === 'multiple-choice' ? 'Multiple Choice' :
                   question.type === 'true-false' ? 'True/False' : 'Short Answer'}
                </span>
              </div>

              <p className="text-slate-700 mb-4">{question.question}</p>

              {question.type === 'multiple-choice' && question.options && (
                <div className="space-y-2 mb-4">
                  {question.options.map((option, i) => (
                    <div
                      key={i}
                      className={`px-4 py-2 rounded-lg border ${
                        option === question.correctAnswer
                          ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                          : 'border-slate-200 bg-white text-slate-700'
                      }`}
                    >
                      {option}
                      {option === question.correctAnswer && (
                        <span className="ml-2 text-xs font-semibold">✓ Correct Answer</span>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {question.type === 'true-false' && (
                <div className="space-y-2 mb-4">
                  {['true', 'false'].map((value) => (
                    <div
                      key={value}
                      className={`px-4 py-2 rounded-lg border ${
                        value === question.correctAnswer
                          ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                          : 'border-slate-200 bg-white text-slate-700'
                      }`}
                    >
                      {value === 'true' ? 'True' : 'False'}
                      {value === question.correctAnswer && (
                        <span className="ml-2 text-xs font-semibold">✓ Correct Answer</span>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {question.type === 'short-answer' && (
                <div className="px-4 py-2 rounded-lg border border-emerald-500 bg-emerald-50 text-emerald-700 mb-4">
                  <span className="text-xs font-semibold">Correct Answer: </span>
                  {question.correctAnswer}
                </div>
              )}

              {question.hint && (
                <div className="px-4 py-2 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-sm">
                  <span className="font-semibold">💡 Hint: </span>
                  {question.hint}
                </div>
              )}
            </Card>
          ))}
        </div>

        <div className="flex items-center justify-end gap-3 pt-4">
          <Button variant="ghost" onClick={() => setShowPreview(false)}>
            Back to Edit
          </Button>
          <Button onClick={handleSubmit} disabled={submitting}>
            {submitting ? "Creating…" : "Publish Assessment"}
          </Button>
        </div>
      </div>
    );
  }

  // Question Builder Mode
  if (showQuestionBuilder) {
    return (
      <div className="max-w-5xl mx-auto space-y-8 px-4 md:px-0 py-4">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
              {editingQuestionIndex !== null ? 'Edit Question' : 'Add Question'}
            </p>
            <h1 className="text-3xl font-bold text-slate-800">
              {editingQuestionIndex !== null
                ? `Question ${editingQuestionIndex + 1}`
                : 'New Question'}
            </h1>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setShowQuestionBuilder(false);
              setEditingQuestionIndex(null);
            }}
          >
            ← Back
          </Button>
        </div>

        <QuestionBuilder
          existingQuestion={editingQuestionIndex !== null ? questions[editingQuestionIndex] : undefined}
          onSave={handleSaveQuestion}
          onCancel={() => {
            setShowQuestionBuilder(false);
            setEditingQuestionIndex(null);
          }}
        />
      </div>
    );
  }

  // Main Edit Mode
  return (
    <div className="max-w-5xl mx-auto space-y-8 px-4 md:px-0 py-4">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Assessments</p>
          <h1 className="text-3xl font-bold text-slate-800">Create Assessment</h1>
          <p className="text-slate-600">Design a custom assessment with real questions</p>
        </div>
        <Button variant="ghost" size="sm" onClick={() => router.back()}>
          ← Back
        </Button>
      </div>

      {/* Assessment Metadata */}
      <Card className="mb-0">
        <h2 className="text-xl font-bold text-slate-800 mb-4">Assessment Details</h2>
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-800">Title</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              placeholder="e.g., Fractions Basics - Grade 3"
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 transition"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-800">Subject</label>
              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value as Assessment["subject"])}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 transition"
              >
                <option>Mathematics</option>
                <option>English</option>
                <option>Urdu</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-800">Grade</label>
              <select
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 transition"
              >
                <option value="1">Grade 1</option>
                <option value="2">Grade 2</option>
                <option value="3">Grade 3</option>
                <option value="4">Grade 4</option>
                <option value="5">Grade 5</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-800">Duration (minutes)</label>
              <input
                type="number"
                min={5}
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 transition"
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Questions Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-800">Questions</h2>
            <p className="text-sm text-slate-600">
              {questions.length} {questions.length === 1 ? 'question' : 'questions'}
              {questions.length > 0 && ` • ${totalPoints} points total`}
            </p>
          </div>
          <Button onClick={handleAddQuestion}>
            + Add Question
          </Button>
        </div>

        {questions.length === 0 ? (
          <Card className="mb-0">
            <div className="text-center py-8">
              <p className="text-slate-500 mb-4">No questions added yet</p>
              <Button onClick={handleAddQuestion}>
                + Add Your First Question
              </Button>
            </div>
          </Card>
        ) : (
          <div className="space-y-3">
            {questions.map((question, index) => (
              <Card key={question.id} className="mb-0">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm font-bold text-indigo-600">Q{index + 1}</span>
                      <span className="px-2 py-1 rounded text-xs font-medium bg-slate-100 text-slate-700">
                        {question.type === 'multiple-choice' ? 'MCQ' :
                         question.type === 'true-false' ? 'T/F' : 'Short Answer'}
                      </span>
                      <span className="text-xs text-slate-500">
                        {question.points} {question.points === 1 ? 'point' : 'points'}
                      </span>
                    </div>
                    <p className="text-slate-700 font-medium">{question.question}</p>
                    {question.hint && (
                      <p className="text-xs text-amber-600 mt-1">💡 Hint provided</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditQuestion(index)}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteQuestion(index)}
                      className="text-rose-600 hover:text-rose-700"
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Actions */}
      {questions.length > 0 && (
        <div className="flex items-center justify-end gap-3 pt-4">
          <Button variant="ghost" onClick={() => router.push("/dashboard/teacher/assessments")}>
            Cancel
          </Button>
          <Button variant="outline" onClick={handlePreview}>
            Preview
          </Button>
          <Button onClick={handleSubmit} disabled={submitting}>
            {submitting ? "Creating…" : "Publish Assessment"}
          </Button>
        </div>
      )}
    </div>
  );
}
