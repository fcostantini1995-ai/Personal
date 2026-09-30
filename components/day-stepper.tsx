"use client";

import { CaretLeft, CaretRight } from "@phosphor-icons/react";
import { addDays } from "@/lib/period";

export function DayStepper({
  date,
  today,
  onChange,
  label,
}: {
  date: string;
  today: string;
  onChange: (next: string) => void;
  label: string;
}) {
  const valid = /^\d{4}-\d{2}-\d{2}$/.test(date);
  const forward = valid && addDays(date, 1) <= today;
  const [year, month, day] = valid ? date.split("-").map(Number) : [];
  const title = valid
    ? new Intl.DateTimeFormat("it-IT", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      }).format(new Date(year, (month ?? 1) - 1, day))
    : "Scegli un giorno";

  return (
    <div>
      <p className="text-sm text-muted-foreground">{label}</p>
      <div className="mt-1 flex items-center gap-2">
        <button
          type="button"
          aria-label="Giorno precedente"
          disabled={!valid}
          onClick={() => onChange(addDays(date, -1))}
          className="inline-flex min-h-11 min-w-11 shrink-0 cursor-pointer items-center justify-center border border-border bg-card transition-colors duration-200 hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40"
        >
          <CaretLeft size={20} aria-hidden="true" />
        </button>
        <h1 className="min-w-0 flex-1 text-center text-2xl">{title}</h1>
        <button
          type="button"
          aria-label="Giorno successivo"
          disabled={!forward}
          onClick={() => onChange(addDays(date, 1))}
          className="inline-flex min-h-11 min-w-11 shrink-0 cursor-pointer items-center justify-center border border-border bg-card transition-colors duration-200 hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40"
        >
          <CaretRight size={20} aria-hidden="true" />
        </button>
      </div>
      {date === today ? null : (
        <button
          type="button"
          onClick={() => onChange(today)}
          className="mt-2 min-h-11 cursor-pointer text-sm font-semibold text-primary"
        >
          Torna a oggi
        </button>
      )}
    </div>
  );
}
