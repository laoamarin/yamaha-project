"use client";

import { RegistrationFloatingField } from "@/components/event/RegistrationFloatingField";
import { createClient } from "@/lib/supabase/client";
import {
  formatDateTime,
  formatStudentName,
  lastStudentStorageKey,
  normalizeSearchQuery,
} from "@/lib/event-utils";
import { PublicBody, PublicHeader, PublicShell } from "@/components/layout/public-shell";
import { formatEventDate } from "@/lib/format";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { LinkButton } from "@/components/ui/link-button";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { Event, ExtraField, Registration, Student } from "@/types/database";
import {
  ArrowLeft,
  Award,
  CheckCircle2,
  Loader2,
  Music2,
  Search,
  UserRound,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

type Props = {
  event: Event;
};

export function EventRegistration({ event }: Props) {
  const supabase = useMemo(() => createClient(), []);

  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [results, setResults] = useState<Student[]>([]);
  const [searching, setSearching] = useState(false);
  const [selected, setSelected] = useState<Student | null>(null);
  const [registration, setRegistration] = useState<Registration | null>(null);
  const [loadingStudent, setLoadingStudent] = useState(false);
  const [extraData, setExtraData] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), 300);
    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    if (!debouncedQuery.trim()) {
      setResults([]);
      return;
    }

    const normalized = normalizeSearchQuery(debouncedQuery);
    if (!normalized) {
      setResults([]);
      return;
    }

    let cancelled = false;
    setSearching(true);

    supabase
      .from("students")
      .select("*")
      .eq("event_id", event.id)
      .ilike("search_name", `%${normalized}%`)
      .limit(20)
      .then(({ data, error: searchError }) => {
        if (cancelled) return;
        if (searchError) {
          setError(searchError.message);
          setResults([]);
        } else {
          setResults(data ?? []);
        }
        setSearching(false);
      });

    return () => {
      cancelled = true;
    };
  }, [debouncedQuery, event.id, supabase]);

  const loadStudent = useCallback(
    async (student: Student) => {
      setSelected(student);
      setError(null);
      setExtraData({});
      setShowSuccess(false);
      setLoadingStudent(true);

      localStorage.setItem(lastStudentStorageKey(event.qr_token), student.id);

      const { data, error: regError } = await supabase
        .from("registrations")
        .select("*")
        .eq("student_id", student.id)
        .eq("event_id", event.id)
        .maybeSingle();

      if (regError) {
        setError(regError.message);
        setRegistration(null);
      } else {
        setRegistration(data);
      }
      setLoadingStudent(false);
    },
    [event.id, event.qr_token, supabase]
  );

  useEffect(() => {
    const savedId = localStorage.getItem(
      lastStudentStorageKey(event.qr_token)
    );
    if (!savedId) return;

    supabase
      .from("students")
      .select("*")
      .eq("id", savedId)
      .eq("event_id", event.id)
      .maybeSingle()
      .then(({ data }) => {
        if (data) loadStudent(data);
      });
  }, [event.id, event.qr_token, loadStudent, supabase]);

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    if (!selected) return;

    const fields = event.extra_fields as ExtraField[];
    for (const field of fields) {
      if (field.required && !extraData[field.key]?.trim()) {
        setError(`กรุณากรอก ${field.label}`);
        return;
      }
    }

    setSubmitting(true);
    setError(null);

    const { data, error: insertError } = await supabase
      .from("registrations")
      .insert({
        student_id: selected.id,
        event_id: event.id,
        extra_data: extraData,
      })
      .select()
      .single();

    setSubmitting(false);

    if (insertError) {
      setError(insertError.message);
      return;
    }

    setRegistration(data);
    setShowSuccess(true);
  }

  function handleClearSelection() {
    setSelected(null);
    setRegistration(null);
    setExtraData({});
    setError(null);
    setShowSuccess(false);
  }

  const eventDate = formatEventDate(event.event_date);
  const queryTrimmed = query.trim();
  const showSearchHint =
    !selected &&
    queryTrimmed.length > 0 &&
    queryTrimmed.length < 2 &&
    !searching;
  const showEmptySearch =
    !selected &&
    debouncedQuery &&
    !searching &&
    results.length === 0 &&
    normalizeSearchQuery(debouncedQuery);

  return (
    <PublicShell>
      <PublicHeader
        eventName={event.name}
        eventDate={eventDate}
        coverUrl={event.cover_image_url}
      />
      <PublicBody className={cn(!selected && "pb-8", selected && !registration && !loadingStudent && "pb-32")}>
        {!selected ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="search" className="text-sm font-semibold text-foreground">
                ค้นหาชื่อนักเรียน
              </Label>
              <div className="relative">
                <Search className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-yamaha-purple/60" />
                <Input
                  id="search"
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="พิมพ์ชื่อ นามสกุล หรือชื่อเล่น"
                  autoFocus
                  className="h-14 rounded-2xl border-2 border-yamaha-purple-muted bg-white pl-12 text-base shadow-yamaha-soft focus-visible:border-yamaha-purple focus-visible:ring-4 focus-visible:ring-yamaha-purple/15"
                />
              </div>
              {searching && (
                <p className="flex items-center gap-2 px-1 text-sm text-muted-foreground">
                  <Loader2 className="size-4 animate-spin text-yamaha-purple" />
                  กำลังค้นหา...
                </p>
              )}
            </div>

            {!queryTrimmed && !searching && (
              <div className="rounded-2xl border border-dashed border-yamaha-purple-muted bg-yamaha-purple-pale/50 px-4 py-8 text-center">
                <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-full bg-yamaha-purple/10 text-yamaha-purple">
                  <Search className="size-5" />
                </div>
                <p className="text-sm font-medium text-foreground">
                  ค้นหาชื่อลูกของคุณ
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  พิมพ์อย่างน้อย 2 ตัวอักษรเพื่อค้นหา
                </p>
              </div>
            )}

            {showSearchHint && (
              <p className="rounded-xl bg-yamaha-purple-pale px-4 py-3 text-center text-sm text-yamaha-purple-dark">
                พิมพ์อย่างน้อย 2 ตัวอักษรเพื่อค้นหา
              </p>
            )}

            {results.length > 0 && (
              <ul className="space-y-2">
                {results.map((student) => (
                  <li key={student.id}>
                    <button
                      type="button"
                      onClick={() => loadStudent(student)}
                      className={cn(
                        "flex min-h-[52px] w-full items-start gap-3 rounded-2xl border-2 border-yamaha-purple-muted bg-white p-4 text-left shadow-sm transition-colors",
                        "active:border-yamaha-purple active:bg-yamaha-purple-pale",
                        "hover:border-yamaha-purple/40 hover:bg-yamaha-purple-pale/60"
                      )}
                    >
                      <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-yamaha-purple/10 text-yamaha-purple">
                        {student.instrument ? (
                          <Music2 className="size-5" />
                        ) : (
                          <UserRound className="size-5" />
                        )}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block font-semibold text-foreground">
                          {formatStudentName(student)}
                        </span>
                        <span className="mt-1.5 flex flex-wrap gap-1.5">
                          {student.instrument && (
                            <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600">
                              {student.instrument}
                            </span>
                          )}
                          {student.teacher_name && (
                            <span className="inline-flex rounded-full bg-yamaha-purple-pale px-2.5 py-0.5 text-xs font-medium text-yamaha-purple">
                              ครู {student.teacher_name}
                            </span>
                          )}
                        </span>
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}

            {showEmptySearch && (
              <p className="rounded-2xl border border-dashed border-yamaha-purple-muted py-10 text-center text-sm text-muted-foreground">
                ไม่พบชื่อ &quot;{debouncedQuery}&quot;
              </p>
            )}

            {error && (
              <Alert variant="destructive" className="rounded-2xl">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </div>
        ) : (
          <div className="space-y-5">
            <Button
              variant="ghost"
              size="sm"
              className="-ml-2 h-11 min-h-[44px] px-2 text-yamaha-purple hover:bg-yamaha-purple-pale hover:text-yamaha-purple-dark"
              onClick={handleClearSelection}
            >
              <ArrowLeft className="size-4" />
              ค้นหาใหม่
            </Button>

            <div className="rounded-2xl border-2 border-yamaha-purple-muted bg-yamaha-purple-pale/40 p-4 shadow-yamaha-soft">
              <div className="flex items-start gap-3">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
                  <CheckCircle2 className="size-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
                    เลือกแล้ว
                  </p>
                  <h2 className="mt-0.5 text-lg font-bold leading-snug text-foreground">
                    {formatStudentName(selected)}
                  </h2>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {selected.instrument && (
                      <span className="inline-flex rounded-full bg-white px-2.5 py-0.5 text-xs font-medium text-slate-600">
                        {selected.instrument}
                      </span>
                    )}
                    {selected.teacher_name && (
                      <span className="inline-flex rounded-full bg-yamaha-purple/10 px-2.5 py-0.5 text-xs font-medium text-yamaha-purple">
                        ครู {selected.teacher_name}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {loadingStudent && (
              <div className="space-y-3">
                <Skeleton className="h-4 w-3/4 rounded-xl" />
                <Skeleton className="h-24 w-full rounded-2xl" />
              </div>
            )}

            {!loadingStudent && registration && (
              <div className="space-y-4">
                <Alert className="rounded-2xl border-emerald-200 bg-emerald-50 text-emerald-900">
                  <CheckCircle2 className="text-emerald-600" />
                  <AlertDescription>
                    <p className="font-semibold">ลงทะเบียนแล้ว</p>
                    <p className="mt-1 text-sm opacity-80">
                      เมื่อ {formatDateTime(registration.registered_at)}
                    </p>
                    {Object.keys(registration.extra_data).length > 0 && (
                      <dl className="mt-3 space-y-1.5 text-sm">
                        {(event.extra_fields as ExtraField[]).map((field) =>
                          registration.extra_data[field.key] ? (
                            <div key={field.key} className="flex gap-2">
                              <dt className="opacity-70">{field.label}:</dt>
                              <dd className="font-medium">
                                {registration.extra_data[field.key]}
                              </dd>
                            </div>
                          ) : null
                        )}
                      </dl>
                    )}
                  </AlertDescription>
                </Alert>

                {event.certificates_released && (
                  <LinkButton
                    className="h-12 w-full rounded-2xl bg-yamaha-purple text-base font-semibold text-white hover:bg-yamaha-purple-dark"
                    size="lg"
                    href={`/event/${event.qr_token}/certificate/${selected.id}`}
                  >
                    <Award className="size-5" />
                    ดูเกียรติบัตร
                  </LinkButton>
                )}
              </div>
            )}

            {!loadingStudent && !registration && (
              <>
                <form
                  id="register-form"
                  onSubmit={handleRegister}
                  className="space-y-4"
                >
                  <p className="text-sm font-medium text-muted-foreground">
                    กรุณากรอกข้อมูลเพื่อยืนยันการลงทะเบียน
                  </p>

                  {(event.extra_fields as ExtraField[]).map((field) => (
                    <RegistrationFloatingField
                      key={field.key}
                      id={field.key}
                      label={field.label}
                      required={field.required}
                      type={field.key === "phone" ? "tel" : "text"}
                      value={extraData[field.key] ?? ""}
                      onChange={(value) =>
                        setExtraData((prev) => ({
                          ...prev,
                          [field.key]: value,
                        }))
                      }
                      helperText={
                        field.key === "phone"
                          ? "ใช้สำหรับติดต่อกรณีจำเป็น"
                          : undefined
                      }
                    />
                  ))}

                  {error && (
                    <Alert variant="destructive" className="rounded-2xl">
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}
                </form>

                <div className="fixed inset-x-0 bottom-0 z-20 border-t border-yamaha-purple-muted bg-white/95 px-4 py-4 pb-[max(1rem,env(safe-area-inset-bottom))] backdrop-blur-sm">
                  <div className="mx-auto max-w-md">
                    <Button
                      type="submit"
                      form="register-form"
                      disabled={submitting}
                      className="h-14 w-full rounded-2xl bg-yamaha-purple text-base font-semibold text-white shadow-yamaha-soft hover:bg-yamaha-purple-dark disabled:opacity-70"
                    >
                      {submitting ? (
                        <>
                          <Loader2 className="size-5 animate-spin" />
                          กำลังบันทึก...
                        </>
                      ) : (
                        "ยืนยันลงทะเบียน"
                      )}
                    </Button>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </PublicBody>

      <Dialog open={showSuccess} onOpenChange={setShowSuccess}>
        <DialogContent className="rounded-2xl sm:max-w-sm">
          <DialogHeader className="items-center text-center">
            <div className="mb-2 flex size-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
              <CheckCircle2 className="size-9" />
            </div>
            <DialogTitle className="text-xl">ลงทะเบียนสำเร็จ!</DialogTitle>
            <DialogDescription className="text-base">
              {selected && formatStudentName(selected)}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="sm:justify-center">
            <Button
              onClick={() => setShowSuccess(false)}
              className="h-12 w-full rounded-2xl bg-yamaha-purple hover:bg-yamaha-purple-dark sm:w-auto"
            >
              ตกลง
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PublicShell>
  );
}
