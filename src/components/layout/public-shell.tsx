import { cn } from "@/lib/utils";
import { Calendar, Music2 } from "lucide-react";

export function PublicShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-100">
      <div className="mx-auto min-h-screen max-w-md border-x border-slate-200 bg-white shadow-sm">
        {children}
      </div>
    </div>
  );
}

export function PublicHeader({
  eventName,
  eventDate,
  coverUrl,
  label = "ลงทะเบียนนักแสดง",
}: {
  eventName: string;
  eventDate: string;
  coverUrl?: string | null;
  label?: string;
}) {
  return (
    <header className="border-b border-slate-200">
      {coverUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={coverUrl}
          alt={eventName}
          className="h-36 w-full object-cover"
        />
      ) : (
        <div className="flex h-28 items-center justify-center bg-slate-50">
          <Music2 className="size-10 text-slate-300" />
        </div>
      )}
      <div className="px-5 py-4">
        <p className="text-xs font-medium uppercase tracking-wide text-indigo-600">
          {label}
        </p>
        <h1 className="mt-1 text-lg font-semibold leading-snug text-slate-900">
          {eventName}
        </h1>
        <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
          <Calendar className="size-3.5 shrink-0" />
          {eventDate}
        </p>
      </div>
    </header>
  );
}

export function PublicBody({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <main className={cn("px-4 py-5 sm:px-5", className)}>{children}</main>
  );
}
