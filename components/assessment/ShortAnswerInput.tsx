'use client';

import { useState, useEffect } from 'react';

interface ShortAnswerInputProps {
  value?: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  maxLength?: number;
}

export default function ShortAnswerInput({
  value = '',
  onChange,
  disabled = false,
  maxLength = 200,
}: ShortAnswerInputProps) {
  const [text, setText] = useState(value);

  useEffect(() => {
    setText(value);
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    if (newValue.length <= maxLength) {
      setText(newValue);
      onChange(newValue);
    }
  };

  const remaining = maxLength - text.length;
  const isNearLimit = remaining < 20;

  return (
    <div className="space-y-2">
      <textarea
        value={text}
        onChange={handleChange}
        disabled={disabled}
        placeholder="Type your answer here..."
        className="w-full min-h-[120px] px-4 py-3 rounded-xl border border-white/10 bg-white/5 glass-surface text-base text-[#0f172a] placeholder:text-[#475569] focus:border-[#00d4ff] focus:ring-4 focus:ring-[#00d4ff]/20 transition resize-none disabled:opacity-60 disabled:cursor-not-allowed"
        aria-label="Short answer input"
      />
      <div className="flex items-center justify-between text-xs">
        <span className="text-[#475569]">
          Press Enter to add line breaks
        </span>
        <span
          className={`font-semibold ${
            isNearLimit ? 'text-[#ffd060]' : 'text-[#334155]'
          }`}
        >
          {remaining} characters remaining
        </span>
      </div>
    </div>
  );
}
