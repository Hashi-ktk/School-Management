'use client';

import Card from "@/components/ui/Card";
import type { PerformanceDistribution } from "@/types";

interface PerformanceDistributionChartProps {
  distribution: PerformanceDistribution[];
  totalStudents: number;
}

export default function PerformanceDistributionChart({
  distribution,
  totalStudents
}: PerformanceDistributionChartProps) {

  if (totalStudents === 0) {
    return (
      <Card>
        <h3 className="text-lg font-bold text-[#0f172a] mb-4">Learning Level Distribution</h3>
        <p className="text-sm text-[#334155]">No student data available yet.</p>
      </Card>
    );
  }

  return (
    <Card>
      <div className="mb-5">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#334155]">Analytics</p>
        <h3 className="text-xl font-bold text-[#0f172a]">Learning Level Distribution</h3>
        <p className="text-sm text-[#334155]">Performance breakdown across {totalStudents} students</p>
      </div>

      {/* Visual Bar Chart */}
      <div className="mb-6">
        <div className="flex h-12 rounded-xl overflow-hidden border border-white/10">
          {distribution.map((tier, idx) => (
            tier.count > 0 && (
              <div
                key={tier.tier}
                className="relative group transition-all duration-300 hover:opacity-90"
                style={{
                  width: `${tier.percentage}%`,
                  backgroundColor: tier.color,
                }}
              >
                <div className="absolute inset-0 flex items-center justify-center text-white font-bold text-sm opacity-0 group-hover:opacity-100 transition-opacity">
                  {tier.percentage}%
                </div>
              </div>
            )
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="space-y-3">
        {distribution.map(tier => (
          <div
            key={tier.tier}
            className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10"
          >
            <div className="flex items-center gap-3">
              <div
                className="h-10 w-10 rounded-lg grid place-content-center text-xl ring-2"
                style={{
                  backgroundColor: `${tier.color}20`,
                  color: tier.color,
                  borderColor: `${tier.color}40`
                }}
              >
                {tier.icon}
              </div>
              <div>
                <p className="font-semibold text-[#0f172a]">{tier.tier}</p>
                <p className="text-xs text-[#334155]">
                  {tier.tier === 'Proficient' && '80-100% average'}
                  {tier.tier === 'Developing' && '60-79% average'}
                  {tier.tier === 'Needs Support' && 'Below 60% average'}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-[#0f172a]">{tier.count}</p>
              <p className="text-xs text-[#334155]">{tier.percentage}%</p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
