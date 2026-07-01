"use client";

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
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import type { Event, ExtraField, Registration, Student } from "@/types/database";
import {
  ArrowLeft,
  Award,
  CheckCircle2,
  Loader2,
  Search,
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

  return (
    <PublicShell>
      <PublicHeader
        eventName={event.name}
        eventDate={eventDate}
        coverUrl={event.cover_image_url}
      />
      <PublicBody>
        {!selected ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="search" className="text-sm font-medium">
                ค้นหาชื่อนักเรียน
              </Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="search"
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="พิมพ์ชื่อ นามสกุล หรือชื่อเล่น"
                  autoFocus
                  className="h-11 pl-9"
                />
              </div>
              {searching && (
                <p className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Loader2 className="size-3 animate-spin" />
                  กำลังค้นหา...
                </p>
              )}
            </div>

            {results.length > 0 && (
              <ul className="divide-y divide-slate-200 overflow-hidden rounded-lg border border-slate-200 bg-white">
                {results.map((student) => (
                  <li key={student.id}>
                    <button
                      type="button"
                      onClick={() => loadStudent(student)}
                      className="flex w-full flex-col gap-0.5 px-4 py-3 text-left transition-colors hover:bg-slate-50"
                    >
                      <span className="font-medium text-slate-900">
                        {formatStudentName(student)}
                      </span>
                      {(student.instrument || student.teacher_name) && (
                        <span className="text-xs text-muted-foreground">
                          {[student.instrument, student.teacher_name && `ครู ${student.teacher_name}`]
                            .filter(Boolean)
                            .join(" · ")}
                        </span>
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            )}

            {debouncedQuery && !searching && results.length === 0 && (
              <p className="rounded-lg border border-dashed border-slate-200 py-8 text-center text-sm text-muted-foreground">
                ไม่พบชื่อ &quot;{debouncedQuery}&quot;
              </p>
            )}

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <Button
              variant="ghost"
              size="sm"
              className="-ml-2 h-8 px-2 text-muted-foreground"
              onClick={handleClearSelection}
            >
              <ArrowLeft className="size-4" />
              ค้นหาใหม่
            </Button>

            <div>
              <h2 className="text-lg font-semibold leading-snug text-slate-900">
                {formatStudentName(selected)}
              </h2>
              {selected.teacher_name && (
                <p className="mt-0.5 text-sm text-muted-foreground">
                  ครูผู้สอน: {selected.teacher_name}
                </p>
              )}
            </div>

            {loadingStudent && (
              <div className="space-y-3">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-20 w-full" />
              </div>
            )}

            {!loadingStudent && registration && (
              <div className="space-y-4">
                <Alert className="border-emerald-200 bg-emerald-50 text-emerald-900">
                  <CheckCircle2 className="text-emerald-600" />
                  <AlertDescription>
                    <p className="font-medium">ลงทะเบียนแล้ว</p>
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
                    className="w-full"
                    size="lg"
                    href={`/event/${event.qr_token}/certificate/${selected.id}`}
                  >
                    <Award className="size-4" />
                    ดูเกียรติบัตร
                  </LinkButton>
                )}
              </div>
            )}

            {!loadingStudent && !registration && (
              <form onSubmit={handleRegister} className="space-y-4">
                <Separator />
                <p className="text-sm text-muted-foreground">
                  กรุณากรอกข้อมูลเพื่อยืนยันการลงทะเบียน
                </p>

                {(event.extra_fields as ExtraField[]).map((field) => (
                  <div key={field.key} className="space-y-2">
                    <Label htmlFor={field.key}>
                      {field.label}
                      {field.required && (
                        <span className="ml-0.5 text-destructive">*</span>
                      )}
                    </Label>
                    <Input
                      id={field.key}
                      type={field.key === "phone" ? "tel" : "text"}
                      value={extraData[field.key] ?? ""}
                      onChange={(e) =>
                        setExtraData((prev) => ({
                          ...prev,
                          [field.key]: e.target.value,
                        }))
                      }
                      required={field.required}
                      className="h-11"
                    />
                  </div>
                ))}

                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <Button
                  type="submit"
                  disabled={submitting}
                  className="h-11 w-full"
                  size="lg"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      กำลังบันทึก...
                    </>
                  ) : (
                    "ยืนยันลงทะเบียน"
                  )}
                </Button>
              </form>
            )}
          </div>
        )}
      </PublicBody>

      <Dialog open={showSuccess} onOpenChange={setShowSuccess}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader className="items-center text-center">
            <div className="mb-2 flex size-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
              <CheckCircle2 className="size-8" />
            </div>
            <DialogTitle>ลงทะเบียนสำเร็จ!</DialogTitle>
            <DialogDescription>
              {selected && formatStudentName(selected)}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="sm:justify-center">
            <Button onClick={() => setShowSuccess(false)} className="w-full sm:w-auto">
              ตกลง
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PublicShell>
  );
}
