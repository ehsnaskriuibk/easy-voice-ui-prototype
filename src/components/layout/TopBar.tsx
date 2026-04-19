interface TopBarProps {
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
  children?: React.ReactNode;
}

export function TopBar({ title, subtitle, right, children }: TopBarProps) {
  return (
    <header className="h-14 bg-white border-b border-slate-200/80 px-6 flex items-center justify-between flex-shrink-0">
      <div className="flex items-center gap-3 min-w-0">
        <h1 className="text-base font-medium text-slate-900 truncate">{title}</h1>
        {subtitle && <span className="text-sm text-slate-400 truncate">{subtitle}</span>}
        {children}
      </div>
      {right && <div className="flex items-center gap-3 flex-shrink-0">{right}</div>}
    </header>
  );
}
