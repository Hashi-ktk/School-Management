'use client';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { useAuth } from "@/hooks/useAuth";
import dummyData from "@/data/dummyData.json";
import feedbackTemplates from "@/data/feedbackTemplates.json";
import { saveObservation, calculateOverallScore } from "@/lib/observationUtils";
import type { ClassroomObservation, ObservationIndicator } from "@/types";

export default function CreateObservationPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  const [formData, setFormData] = useState({
    teacherId: '',
    classGrade: 3,
    subject: 'Mathematics',
    observationType: 'Formative' as const,
    date: new Date().toISOString().split('T')[0],
    preObservationNotes: '',
  });

  const [indicators, setIndicators] = useState<ObservationIndicator[]>([]);

  useEffect(() => {
    // Initialize indicators from templates
    const initialIndicators = feedbackTemplates.indicators.map(ind => ({
      id: ind.id,
      name: ind.name,
      score: 0,
      maxScore: ind.maxScore,
      notes: '',
      timestamp: '',
    }));
    setIndicators(initialIndicators);
  }, []);

  const handleSubmit = (status: 'draft' | 'completed') => {
    if (!user) return;

    const teacher = dummyData.users.find(u => u.id === formData.teacherId);
    if (!teacher) {
      alert('Please select a teacher');
      return;
    }

    const overallScore = calculateOverallScore(indicators);

    // Auto-generate feedback if completed
    let feedback = '';
    let recommendations: string[] | undefined;

    if (status === 'completed') {
      const template = feedbackTemplates.observationTemplates.find(
        (t: any) => overallScore >= t.scoreRange[0] && overallScore <= t.scoreRange[1]
      );
      feedback = template?.feedback.replace('{teacherName}', teacher.name) || '';
      recommendations = template?.recommendations;
    }

    const observation: ClassroomObservation = {
      id: `obs-${Date.now()}`,
      teacherId: formData.teacherId,
      teacherName: teacher.name,
      observerId: user.id,
      observerName: user.name,
      schoolId: teacher.schoolId || '',
      classGrade: formData.classGrade,
      subject: formData.subject,
      observationType: formData.observationType,
      date: formData.date,
      preObservationNotes: formData.preObservationNotes,
      indicators: indicators,
      overallScore: overallScore,
      feedback: feedback,
      recommendations: recommendations,
      status: status,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    saveObservation(observation);
    router.push(`/dashboard/observer/observations/${observation.id}`);
  };

  if (isLoading || !user) {
    return <div className="min-h-[50vh] grid place-content-center text-slate-600">Loading...</div>;
  }

  const teachers = dummyData.users.filter(u => u.role === 'teacher');

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">New Classroom Observation</h1>
        <p className="text-gray-600">Create a new observation report</p>
      </div>

      <Card>
        <h2 className="text-xl font-bold text-slate-900 mb-6">Observation Details</h2>

        {/* Teacher Selection */}
        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Teacher *
            </label>
            <select
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:outline-none transition"
              value={formData.teacherId}
              onChange={(e) => setFormData({...formData, teacherId: e.target.value})}
              required
            >
              <option value="">Select a teacher</option>
              {teachers.map(teacher => (
                <option key={teacher.id} value={teacher.id}>
                  {teacher.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Grade *
              </label>
              <select
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:outline-none transition"
                value={formData.classGrade}
                onChange={(e) => setFormData({...formData, classGrade: Number(e.target.value)})}
              >
                {[1, 2, 3, 4, 5].map(grade => (
                  <option key={grade} value={grade}>Grade {grade}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Subject *
              </label>
              <select
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:outline-none transition"
                value={formData.subject}
                onChange={(e) => setFormData({...formData, subject: e.target.value})}
              >
                <option value="Mathematics">Mathematics</option>
                <option value="English">English</option>
                <option value="Urdu">Urdu</option>
                <option value="Science">Science</option>
                <option value="Social Studies">Social Studies</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Observation Type *
              </label>
              <select
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:outline-none transition"
                value={formData.observationType}
                onChange={(e) => setFormData({...formData, observationType: e.target.value as any})}
              >
                <option value="Baseline">Baseline</option>
                <option value="Formative">Formative</option>
                <option value="Summative">Summative</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Date *
              </label>
              <input
                type="date"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:outline-none transition"
                value={formData.date}
                onChange={(e) => setFormData({...formData, date: e.target.value})}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Pre-Observation Notes
            </label>
            <textarea
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:outline-none transition"
              rows={4}
              placeholder="Any notes or objectives before the observation..."
              value={formData.preObservationNotes}
              onChange={(e) => setFormData({...formData, preObservationNotes: e.target.value})}
            />
          </div>
        </div>
      </Card>

      {/* Scoring Section */}
      <Card>
        <h2 className="text-xl font-bold text-slate-900 mb-6">Observation Indicators</h2>
        <div className="space-y-6">
          {indicators.map((indicator, index) => (
            <div key={indicator.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/60">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-semibold text-slate-900 mb-1">{indicator.name}</h3>
                  <p className="text-sm text-gray-600">
                    {feedbackTemplates.indicators.find(i => i.id === indicator.id)?.description}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-bold text-indigo-600">
                    {indicator.score}/{indicator.maxScore}
                  </span>
                </div>
              </div>

              {/* Score Slider */}
              <div className="mb-4">
                <input
                  type="range"
                  min="0"
                  max={indicator.maxScore}
                  value={indicator.score}
                  onChange={(e) => {
                    const newIndicators = [...indicators];
                    newIndicators[index].score = Number(e.target.value);
                    setIndicators(newIndicators);
                  }}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer slider"
                  style={{
                    background: `linear-gradient(to right, #6366f1 0%, #6366f1 ${(indicator.score / indicator.maxScore) * 100}%, #e2e8f0 ${(indicator.score / indicator.maxScore) * 100}%, #e2e8f0 100%)`
                  }}
                />
              </div>

              {/* Evidence Notes */}
              <div className="mb-3">
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Evidence / Notes
                </label>
                <textarea
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:outline-none transition"
                  rows={2}
                  placeholder="Describe what you observed..."
                  value={indicator.notes}
                  onChange={(e) => {
                    const newIndicators = [...indicators];
                    newIndicators[index].notes = e.target.value;
                    setIndicators(newIndicators);
                  }}
                />
              </div>

              {/* Timestamp */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Timestamp (optional)
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:outline-none transition"
                  placeholder="e.g., 09:15 or 15 minutes in"
                  value={indicator.timestamp}
                  onChange={(e) => {
                    const newIndicators = [...indicators];
                    newIndicators[index].timestamp = e.target.value;
                    setIndicators(newIndicators);
                  }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Overall Score Preview */}
        <div className="mt-6 p-6 rounded-2xl bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-200">
          <div className="text-center">
            <p className="text-sm font-semibold text-slate-700 mb-2">Overall Score</p>
            <p className="text-5xl font-bold text-indigo-600">
              {calculateOverallScore(indicators)}%
            </p>
            <p className="text-sm text-gray-600 mt-2">
              Based on {indicators.length} indicators
            </p>
          </div>
        </div>
      </Card>

      {/* Action Buttons */}
      <div className="flex gap-4 pb-8">
        <Button
          variant="outline"
          onClick={() => handleSubmit('draft')}
          className="flex-1"
        >
          💾 Save Draft
        </Button>
        <Button
          variant="primary"
          onClick={() => handleSubmit('completed')}
          className="flex-1"
        >
          ✅ Complete Observation
        </Button>
      </div>
    </div>
  );
}
