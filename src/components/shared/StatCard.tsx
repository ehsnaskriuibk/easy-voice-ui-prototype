import { TrendingUp, TrendingDown } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: number;
  sub?: string;
}

export function StatCard({ label, value, icon, trend, sub }: StatCardProps) {
  const isPositive = (trend ?? 0) >= 0;

  return (
    <div className="bg-white rounded-xl border border-slate-200/80 p-5 flex items-start justify-between">
      <div className="flex items-start gap-4">
        <div className="w-11 h-11 rounded-xl bg-teal-50 flex items-center justify-center text-teal-600 flex-shrink-0">
          {icon}
        </div>
        <div>
          <p className="text-2xl font-semibold text-slate-900 leading-tight">{value}</p>
          <p className="text-sm text-slate-500 mt-0.5">{label}</p>
          {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
        </div>
      </div>
      {trend !== undefined && (
        <div className={`flex items-center gap-1 text-xs font-medium ${isPositive ? 'text-emerald-600' : 'text-red-500'}`}>
          {isPositive ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
          {isPositive ? '+' : ''}{trend}%
        </div>
      )}
    </div>
  );
}
