'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import TextToSpeechButton from '@/components/ai/TextToSpeechButton';
import { getAllResults } from '@/lib/utils';
import type { AssessmentResult } from '@/types';

interface LearningTip {
  id: string;
  subject: string;
  topic: string;
  tip: string;
  example?: string;
  difficulty: 'basic' | 'intermediate' | 'advanced';
}

const learningTips: LearningTip[] = [
  // Mathematics tips
  { id: 'm1', subject: 'Mathematics', topic: 'Addition', tip: 'When adding numbers, start from the right side (ones place) and move left.', example: '23 + 45 = 68 (3+5=8, 2+4=6)', difficulty: 'basic' },
  { id: 'm2', subject: 'Mathematics', topic: 'Subtraction', tip: 'If the top number is smaller, borrow from the next column.', example: '42 - 17 = 25', difficulty: 'basic' },
  { id: 'm3', subject: 'Mathematics', topic: 'Multiplication', tip: 'Multiplication is like adding the same number multiple times.', example: '4 × 3 = 4 + 4 + 4 = 12', difficulty: 'intermediate' },
  { id: 'm4', subject: 'Mathematics', topic: 'Division', tip: 'Division means splitting into equal groups.', example: '12 ÷ 3 = 4 (12 split into 3 equal groups)', difficulty: 'intermediate' },
  { id: 'm5', subject: 'Mathematics', topic: 'Fractions', tip: 'A fraction shows parts of a whole. The top number (numerator) tells how many parts you have.', example: '3/4 means 3 out of 4 equal parts', difficulty: 'advanced' },

  // English tips
  { id: 'e1', subject: 'English', topic: 'Nouns', tip: 'A noun is a word that names a person, place, thing, or animal.', example: 'cat, school, book, teacher', difficulty: 'basic' },
  { id: 'e2', subject: 'English', topic: 'Verbs', tip: 'A verb is an action word - it tells what someone or something does.', example: 'run, jump, eat, sleep', difficulty: 'basic' },
  { id: 'e3', subject: 'English', topic: 'Adjectives', tip: 'Adjectives describe nouns. They tell us more about people, places, or things.', example: 'big dog, red apple, happy child', difficulty: 'intermediate' },
  { id: 'e4', subject: 'English', topic: 'Sentences', tip: 'A complete sentence needs a subject (who/what) and a verb (action).', example: 'The cat (subject) sleeps (verb).', difficulty: 'intermediate' },
  { id: 'e5', subject: 'English', topic: 'Reading', tip: 'When reading, look for the main idea - what is the story mostly about?', difficulty: 'advanced' },

  // Urdu tips
  { id: 'u1', subject: 'Urdu', topic: 'حروف', tip: 'اردو میں 39 حروف ہیں۔ ہر حرف کی آواز سیکھیں۔', difficulty: 'basic' },
  { id: 'u2', subject: 'Urdu', topic: 'الفاظ', tip: 'نئے الفاظ سیکھنے کے لیے انہیں جملوں میں استعمال کریں۔', difficulty: 'basic' },
  { id: 'u3', subject: 'Urdu', topic: 'جملے', tip: 'ایک مکمل جملے میں فاعل اور فعل ہونا چاہیے۔', difficulty: 'intermediate' },
];

export default function AITutorPage() {
  const { user, isLoading } = useAuth();
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [currentTipIndex, setCurrentTipIndex] = useState(0);
  const [weakAreas, setWeakAreas] = useState<string[]>([]);
  const [chatMessages, setChatMessages] = useState<{ role: 'user' | 'ai'; message: string }[]>([
    { role: 'ai', message: 'Hi! I\'m your AI Learning Assistant. 👋 How can I help you today? You can ask me questions about Math, English, or Urdu!' },
  ]);
  const [inputMessage, setInputMessage] = useState('');

  // Analyze weak areas
  useEffect(() => {
    if (!user) return;

    const results = getAllResults().filter(r => r.studentId === user.id && r.status === 'completed');
    const subjectScores: Record<string, number[]> = {};

    results.forEach(r => {
      if (!subjectScores[r.subject]) subjectScores[r.subject] = [];
      subjectScores[r.subject].push(r.percentage);
    });

    const weak: string[] = [];
    Object.entries(subjectScores).forEach(([subject, scores]) => {
      const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
      if (avg < 70) weak.push(subject);
    });

    setWeakAreas(weak);
  }, [user]);

  const filteredTips = selectedSubject
    ? learningTips.filter(t => t.subject === selectedSubject)
    : learningTips;

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;

    const userMessage = inputMessage.trim();
    setChatMessages(prev => [...prev, { role: 'user', message: userMessage }]);
    setInputMessage('');

    // Simple AI response logic
    setTimeout(() => {
      let response = '';

      const lowerMessage = userMessage.toLowerCase();

      if (lowerMessage.includes('add') || lowerMessage.includes('plus') || lowerMessage.includes('+')) {
        response = '➕ **Addition Tip**: Start adding from the right side (ones place). Remember to carry over if the sum is more than 9! For example: 27 + 15 = 42 (7+5=12, carry 1, then 2+1+1=4)';
      } else if (lowerMessage.includes('subtract') || lowerMessage.includes('minus') || lowerMessage.includes('-')) {
        response = '➖ **Subtraction Tip**: If the top number is smaller, borrow 10 from the next column. For example: 43 - 18 = 25 (borrow from 4, so 13-8=5, then 3-1=2)';
      } else if (lowerMessage.includes('multiply') || lowerMessage.includes('times') || lowerMessage.includes('×')) {
        response = '✖️ **Multiplication Tip**: Think of it as repeated addition! 4 × 5 is the same as 5+5+5+5 = 20. Learn your times tables for faster solving!';
      } else if (lowerMessage.includes('divide') || lowerMessage.includes('÷')) {
        response = '➗ **Division Tip**: Division means sharing equally. 20 ÷ 4 means "how many 4s fit in 20?" The answer is 5!';
      } else if (lowerMessage.includes('noun')) {
        response = '📚 **Nouns** are words that name people, places, things, or animals. Examples: teacher, school, book, dog. Can you think of 5 nouns around you?';
      } else if (lowerMessage.includes('verb')) {
        response = '🏃 **Verbs** are action words! They tell what someone does. Examples: run, jump, read, sleep, eat. What verbs describe what you do every day?';
      } else if (lowerMessage.includes('help') || lowerMessage.includes('stuck')) {
        response = '💪 Don\'t worry, I\'m here to help! Tell me:\n• Which subject: Math, English, or Urdu?\n• What topic are you learning?\nI\'ll give you tips and examples!';
      } else if (lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
        response = 'Hello! 😊 Great to see you! What would you like to learn today? I can help with Math, English, or Urdu!';
      } else if (lowerMessage.includes('math') || lowerMessage.includes('mathematics')) {
        response = '🔢 **Mathematics Help**:\n• Addition & Subtraction\n• Multiplication & Division\n• Fractions\nWhat specific topic do you need help with?';
      } else if (lowerMessage.includes('english')) {
        response = '📖 **English Help**:\n• Nouns, Verbs, Adjectives\n• Making Sentences\n• Reading Comprehension\nWhat would you like to learn?';
      } else if (lowerMessage.includes('urdu')) {
        response = '📝 **Urdu Help**:\n• حروف تہجی (Alphabet)\n• الفاظ (Vocabulary)\n• جملے (Sentences)\nکیا سیکھنا چاہتے ہیں؟';
      } else {
        response = '🤔 That\'s a great question! Let me think...\n\nTry asking about specific topics like:\n• "How do I add numbers?"\n• "What is a noun?"\n• "Help me with multiplication"';
      }

      setChatMessages(prev => [...prev, { role: 'ai', message: response }]);
    }, 500);
  };

  if (isLoading || !user) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="h-12 w-12 rounded-full border-4 border-purple-200 border-t-purple-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-slate-800">🤖 AI Learning Assistant</h1>
        <p className="text-lg text-slate-600">Your personal tutor - ask questions and learn!</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Chat Interface */}
        <Card className="h-[500px] flex flex-col">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-200">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-xl text-white">
              🤖
            </div>
            <div>
              <h3 className="font-bold text-slate-800">AI Tutor</h3>
              <p className="text-xs text-emerald-600">● Online - Ready to help!</p>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto py-4 space-y-4">
            {chatMessages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                    msg.role === 'user'
                      ? 'bg-purple-500 text-white rounded-br-sm'
                      : 'bg-slate-100 text-slate-800 rounded-bl-sm'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{msg.message}</p>
                  {msg.role === 'ai' && (
                    <div className="mt-2 flex justify-end">
                      <TextToSpeechButton text={msg.message} size="sm" />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Input */}
          <div className="pt-4 border-t border-slate-200">
            <div className="flex gap-2">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Ask me anything..."
                className="flex-1 px-4 py-2 rounded-xl border-2 border-slate-200 focus:border-purple-400 focus:ring-2 focus:ring-purple-100 outline-none"
              />
              <Button variant="primary" onClick={handleSendMessage}>
                Send
              </Button>
            </div>
            <div className="flex gap-2 mt-2">
              {['Help with Math', 'English tips', 'Urdu help'].map(quick => (
                <button
                  key={quick}
                  onClick={() => {
                    setInputMessage(quick);
                  }}
                  className="px-3 py-1 text-xs bg-slate-100 text-slate-600 rounded-full hover:bg-slate-200"
                >
                  {quick}
                </button>
              ))}
            </div>
          </div>
        </Card>

        {/* Learning Tips */}
        <div className="space-y-6">
          {/* Subject Filter */}
          <div className="flex gap-2">
            <Button
              variant={selectedSubject === null ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setSelectedSubject(null)}
            >
              All
            </Button>
            {['Mathematics', 'English', 'Urdu'].map(subject => (
              <Button
                key={subject}
                variant={selectedSubject === subject ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setSelectedSubject(subject)}
              >
                {subject === 'Mathematics' ? '🔢' : subject === 'English' ? '📖' : '📝'} {subject}
              </Button>
            ))}
          </div>

          {/* AI Recommendations */}
          {weakAreas.length > 0 && (
            <Card className="bg-amber-50 border-amber-200">
              <div className="flex items-start gap-3">
                <span className="text-2xl">🎯</span>
                <div>
                  <h4 className="font-bold text-amber-800">AI Recommendation</h4>
                  <p className="text-sm text-amber-700">
                    Based on your results, focus on: <strong>{weakAreas.join(', ')}</strong>
                  </p>
                </div>
              </div>
            </Card>
          )}

          {/* Tips List */}
          <div className="space-y-3 max-h-[400px] overflow-y-auto">
            {filteredTips.map(tip => (
              <Card
                key={tip.id}
                className={`hover:shadow-md transition-shadow ${
                  weakAreas.includes(tip.subject) ? 'ring-2 ring-amber-300' : ''
                }`}
              >
                <div className="flex items-start gap-3">
                  <span className="text-2xl">
                    {tip.subject === 'Mathematics' ? '🔢' : tip.subject === 'English' ? '📖' : '📝'}
                  </span>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-bold text-slate-800">{tip.topic}</h4>
                      <span className={`px-2 py-0.5 text-xs rounded-full ${
                        tip.difficulty === 'basic' ? 'bg-emerald-100 text-emerald-700' :
                        tip.difficulty === 'intermediate' ? 'bg-amber-100 text-amber-700' :
                        'bg-purple-100 text-purple-700'
                      }`}>
                        {tip.difficulty}
                      </span>
                    </div>
                    <p className="text-sm text-slate-600">{tip.tip}</p>
                    {tip.example && (
                      <p className="text-xs text-slate-500 mt-1 bg-slate-50 px-2 py-1 rounded">
                        📌 Example: {tip.example}
                      </p>
                    )}
                    <div className="mt-2">
                      <TextToSpeechButton
                        text={`${tip.tip}${tip.example ? `. Example: ${tip.example}` : ''}`}
                        size="sm"
                      />
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
