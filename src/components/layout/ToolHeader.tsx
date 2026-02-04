import { LucideIcon } from 'lucide-react';

interface ToolHeaderProps {
  title: string;
  icon: LucideIcon;
}

export function ToolHeader({ title, icon: Icon }: ToolHeaderProps) {
  return (
    <div className="flex items-center justify-between border-b border-border bg-background px-4 py-3">
      <div className="flex items-center gap-2">
        <Icon className="h-5 w-5 text-muted-foreground" />
        <h1 className="text-lg font-semibold text-foreground">{title}</h1>
      </div>
      <div className="flex items-center gap-2">
        {/* Placeholder for future Share button */}
      </div>
    </div>
  );
}
