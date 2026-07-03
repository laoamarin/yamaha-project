"use client";

import { cn } from "@/lib/utils";
import { Calendar } from "lucide-react";
import { useState } from "react";

export function PublicShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-yamaha-purple-pale">
      <div className="mx-auto min-h-screen max-w-md bg-white shadow-yamaha-soft">
        {children}
      </div>
    </div>
  );
}

function YamahaBrandMark({ className }: { className?: string }) {
  const [logoFailed, setLogoFailed] = useState(false);

  if (!logoFailed) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src="/yamaha-logo.png"
        alt="Yamaha Music School Phuket"
        className={cn("h-9 w-auto object-contain", className)}
        onError={() => setLogoFailed(true)}
      />
    );
  }

  return (
    <div className={cn("leading-tight text-white", className)}>
      <p className="text-lg font-bold tracking-wide">YAMAHA</p>
      <p className="text-[11px] font-medium tracking-wider opacity-90">
        Music School Phuket
      </p>
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
    <header className="relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-yamaha-purple via-yamaha-purple-light to-yamaha-purple-dark" />
      {coverUrl && (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={coverUrl}
            alt=""
            aria-hidden
            className="absolute inset-0 size-full object-cover opacity-25 mix-blend-overlay"
          />
        </>
      )}
      <div className="absolute -right-8 -top-8 size-40 rounded-full bg-white/10 blur-2xl" />
      <div className="absolute -bottom-12 -left-6 size-32 rounded-full bg-white/5 blur-xl" />

      <div className="relative px-5 pb-6 pt-5">
        <div className="mb-5 flex items-center justify-between gap-3">
          <YamahaBrandMark />
          <span className="rounded-full bg-white/15 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-white/95 backdrop-blur-sm">
            {label}
          </span>
        </div>

        <h1 className="text-2xl font-bold leading-tight tracking-tight text-white">
          {eventName}
        </h1>
        <p className="mt-2 flex items-center gap-2 text-sm font-medium text-white/85">
          <Calendar className="size-4 shrink-0" />
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
