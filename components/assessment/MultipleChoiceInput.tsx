'use client';

import { useState } from 'react';

interface MultipleChoiceInputProps {
  options: string[];
  selectedValue?: number;
  onChange: (value: number) => void;
  disabled?: boolean;
}

export default function MultipleChoiceInput({
  options,
  selectedValue,
  onChange,
  disabled = false,
}: MultipleChoiceInputProps) {
  const [selected, setSelected] = useState<number | undefined>(selectedValue);

  const handleSelect = (index: number) => {
    if (disabled) return;
    setSelected(index);
    onChange(index);
  };

  return (
    <div className="space-y-3" role="radiogroup">
      {options.map((option, index) => {
        const isSelected = selected === index;
        return (
          <button
            key={index}
            type="button"
            onClick={() => handleSelect(index)}
            disabled={disabled}
            className={`w-full text-left px-4 py-4 rounded-xl border transition-all ${
              isSelected
                ? 'bg-gradient-to-br from-[#00d4ff]/20 to-[#7c3aed]/20 border-[#00d4ff] ring-2 ring-[#00d4ff]/30 shadow-[0_0_20px_rgba(0,212,255,0.3)]'
                : 'glass-surface border-white/10 hover:border-[#00d4ff]/50 hover:bg-white/5'
            } ${disabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
            role="radio"
            aria-checked={isSelected}
            aria-label={`Option ${String.fromCharCode(65 + index)}: ${option}`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`flex-shrink-0 h-6 w-6 rounded-full border-2 flex items-center justify-center transition-all ${
                  isSelected
                    ? 'border-[#00d4ff] bg-[#00d4ff]'
                    : 'border-white/30 bg-transparent'
                }`}
              >
                {isSelected && (
                  <div className="h-2 w-2 rounded-full bg-white" />
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-xs text-[#00d4ff]">
                    {String.fromCharCode(65 + index)}
                  </span>
                  <span className="text-base font-medium text-[#0f172a]">
                    {option}
                  </span>
                </div>
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
