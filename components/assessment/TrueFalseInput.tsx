'use client';

import { useState } from 'react';

interface TrueFalseInputProps {
  selectedValue?: number;
  onChange: (value: number) => void;
  disabled?: boolean;
}

export default function TrueFalseInput({
  selectedValue,
  onChange,
  disabled = false,
}: TrueFalseInputProps) {
  const [selected, setSelected] = useState<number | undefined>(selectedValue);

  const handleSelect = (value: number) => {
    if (disabled) return;
    setSelected(value);
    onChange(value);
  };

  const options = [
    { value: 0, label: 'True', icon: '✓', color: 'from-[#00ff88] to-[#00d4ff]' },
    { value: 1, label: 'False', icon: '✗', color: 'from-[#ff6b6b] to-[#ffd060]' },
  ];

  return (
    <div className="grid grid-cols-2 gap-4" role="radiogroup">
      {options.map((option) => {
        const isSelected = selected === option.value;
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => handleSelect(option.value)}
            disabled={disabled}
            className={`group relative px-6 py-8 rounded-2xl border-2 transition-all ${
              isSelected
                ? `bg-gradient-to-br ${option.color} border-transparent shadow-[0_10px_40px_rgba(0,212,255,0.4)]`
                : 'glass-surface border-white/20 hover:border-white/40 hover:shadow-lg'
            } ${disabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer hover:-translate-y-1'}`}
            role="radio"
            aria-checked={isSelected}
            aria-label={option.label}
          >
            <div className="flex flex-col items-center gap-3">
              <div
                className={`text-5xl transition-transform ${
                  isSelected ? 'scale-110' : 'group-hover:scale-105'
                } ${isSelected ? 'text-white' : 'text-[#0f172a]'}`}
              >
                {option.icon}
              </div>
              <span
                className={`text-2xl font-bold ${
                  isSelected ? 'text-white' : 'text-[#0f172a]'
                }`}
              >
                {option.label}
              </span>
            </div>

            {isSelected && (
              <div className="absolute top-3 right-3 h-6 w-6 rounded-full bg-white flex items-center justify-center">
                <div className="h-3 w-3 rounded-full bg-gradient-to-br from-[#00d4ff] to-[#7c3aed]" />
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}
