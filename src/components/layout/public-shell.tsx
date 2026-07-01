import { cn } from "@/lib/utils";
import { Music2 } from "lucide-react";

export function PublicShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-600 via-indigo-700 to-indigo-900">
      <div className="mx-auto min-h-screen max-w-md">
        {children}
      </div>
    </div>
  );
}

export function PublicHeader({
  eventName,
  eventDate,
  coverUrl,
}: {
  eventName: string;
  eventDate: string;
  coverUrl?: string | null;
}) {
  return (
    <div className="relative overflow-hidden rounded-b-3xl bg-indigo-800 shadow-lg">
      {coverUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={coverUrl}
          alt={eventName}
          className="h-44 w-full object-cover"
        />
      ) : (
        <div className="flex h-44 w-full items-center justify-center bg-gradient-to-br from-indigo-500 to-purple-700">
          <Music2 className="size-16 text-white/30" />
        </div>
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-indigo-950/80 via-indigo-950/20 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
        <p className="text-xs font-medium uppercase tracking-wider text-indigo-200">
          ลงทะเบียนนักแสดง
        </p>
        <h1 className="mt-1 text-xl font-bold leading-snug">{eventName}</h1>
        <p className="mt-1 text-sm text-indigo-200">{eventDate}</p>
      </div>
    </div>
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
    <div className={cn("-mt-4 rounded-t-3xl bg-slate-50 px-4 pb-8 pt-6", className)}>
      {children}
    </div>
  );
}
