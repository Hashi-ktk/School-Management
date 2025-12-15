'use client';

import type { DateRange } from "@/lib/filterUtils";

interface DateRangePickerProps {
  value: DateRange;
  onChange: (range: DateRange) => void;
  className?: string;
}

interface RangeOption {
  value: DateRange;
  label: string;
}

const RANGE_OPTIONS: RangeOption[] = [
  { value: '7d', label: 'Last 7 days' },
  { value: '30d', label: 'Last 30 days' },
  { value: '90d', label: 'Last 90 days' },
  { value: 'all', label: 'All Time' }
];

export default function DateRangePicker({
  value,
  onChange,
  className = ''
}: DateRangePickerProps) {
  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {RANGE_OPTIONS.map((option) => {
        const isActive = value === option.value;

        return (
          <button
            key={option.value}
            onClick={() => onChange(option.value)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition duration-200 ${
              isActive
                ? 'bg-gradient-to-br from-[#00d4ff] to-[#7c3aed] text-white shadow-[0_10px_25px_rgba(0,212,255,0.25)]'
                : 'border border-white/20 text-[#334155] hover:border-[#00d4ff]/60 hover:text-[#00d4ff] hover:shadow-[0_0_15px_rgba(0,212,255,0.15)]'
            }`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
