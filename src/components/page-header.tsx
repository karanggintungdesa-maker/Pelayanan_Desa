import { cn } from "@/lib/utils";

type PageHeaderProps = {
  title: string;
  description?: string;
  className?: string;
};

export function PageHeader({ title, description, className }: PageHeaderProps) {
  return (
    <div className={cn("mb-12 space-y-3", className)}>
      <div className="flex items-center gap-4">
        <div className="w-2 h-12 bg-accent rounded-full" />
        <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-slate-900 uppercase italic">
          {title}
        </h1>
      </div>
      {description && (
        <p className="text-lg text-slate-500 font-medium pl-6 border-l-2 border-slate-200 leading-relaxed max-w-3xl">
          {description}
        </p>
      )}
    </div>
  );
}