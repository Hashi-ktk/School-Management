'use client';

import { useState } from 'react';

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export default function SearchInput({
  value,
  onChange,
  placeholder = 'Search...',
  className = ''
}: SearchInputProps) {
  const [isFocused, setIsFocused] = useState(false);

  const handleClear = () => {
    onChange('');
  };

  return (
    <div className={`relative ${className}`}>
      <div
        className={`glass-surface rounded-xl border transition duration-200 ${
          isFocused
            ? 'border-[#00d4ff]/60 shadow-[0_0_20px_rgba(0,212,255,0.2)]'
            : 'border-white/10'
        }`}
      >
        <div className="flex items-center">
          <span className="pl-4 text-[#334155]">🔍</span>
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder={placeholder}
            className="flex-1 bg-transparent px-3 py-2.5 text-[#0f172a] placeholder:text-[#94a3b8] focus:outline-none"
          />
          {value && (
            <button
              onClick={handleClear}
              className="pr-4 text-[#334155] hover:text-[#00d4ff] transition duration-200"
              aria-label="Clear search"
            >
              ✕
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
