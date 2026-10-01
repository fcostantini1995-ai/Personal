"use client";

import { CaretLeft, CaretRight, DownloadSimple } from "@phosphor-icons/react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Money } from "@/components/money";
import { formatMonthYear, formatShort } from "@/lib/money";
import {
  canGoForward,
  inRange,
  monthBreakdown,
  periodTotals,
  rangeFor,
  shiftAnchor,
  type ReportMode,
} from "@/lib/period";
import { todayIso } from "@/lib/dates";
import { dayTotal, KIND_LABEL } from "@/lib/types";
import { useStore } from "@/lib/store";

const modes: { id: ReportMode; label: string }[] = [
  { id: "settimana", label: "Settimana" },
  { id: "mese", label: "Mese" },
  { id: "anno", label: "Anno" },
];

export default function PeriodoPage() {
  const { ledger } = useStore();
  const today = todayIso();
  const [mode, setMode] = useState<ReportMode>("mese");
  const [anchor, setAnchor] = useState(today);
  const range = rangeFor(mode, anchor);
  const totals = periodTotals(ledger, range);
  const months = mode === "anno" ? monthBreakdown(ledger, range) : [];
  const forward = canGoForward(anchor, mode, today);
  const current = inRange(today, range);
  const title =
    mode === "anno"
      ? range.start.slice(0, 4)
      : mode === "mese"
        ? formatMonthYear(range.start)
        : `${formatShort(range.start)} – ${formatShort(range.end)}`;

  return (
    <div className="space-y-4">
      <div>
        <p className="text-sm text-muted-foreground">Resoconto · {range.label}</p>
        <div className="mt-1 flex items-center gap-2 print:justify-center">
          <button
            type="button"
            aria-label="Periodo precedente"
            onClick={() => setAnchor(shiftAnchor(anchor, mode, -1))}
            className="inline-flex min-h-11 min-w-11 cursor-pointer items-center justify-center border border-border bg-card transition-colors duration-200 hover:bg-muted print:hidden"
          >
            <CaretLeft size={20} aria-hidden="true" />
          </button>
          <h1 className="min-w-0 flex-1 text-center text-2xl font-semibold tracking-tight">{title}</h1>
          <button
            type="button"
            aria-label="Periodo successivo"
            disabled={!forward}
            onClick={() => setAnchor(shiftAnchor(anchor, mode, 1))}
            className="inline-flex min-h-11 min-w-11 cursor-pointer items-center justify-center border border-border bg-card transition-colors duration-200 hover:bg-muted print:hidden disabled:cursor-not-allowed disabled:opacity-40"
          >
            <CaretRight size={20} aria-hidden="true" />
          </button>
        </div>
        {current ? null : (
          <button
            type="button"
            onClick={() => setAnchor(today)}
            className="mt-2 min-h-11 cursor-pointer text-sm font-semibold text-primary print:hidden"
          >
            Torna a oggi
          </button>
        )}
      </div>
      <div className="flex gap-2 print:hidden" role="tablist" aria-label="Tipo di resoconto">
        {modes.map((item) => (
          <Tab
            key={item.id}
            selected={mode === item.id}
            onClick={() => setMode(item.id)}
            label={item.label}
          />
        ))}
      </div>
      <Button
        type="button"
        variant="outline"
        className="w-full print:hidden"
        onClick={() => downloadReport(`Resoconto ${modes.find((item) => item.id === mode)?.label ?? ""} ${title}`)}
      >
        <DownloadSimple size={18} aria-hidden="true" />
        Scarica PDF
      </Button>
      <Card>
        <CardHeader>
          <CardTitle>Risultato</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <IncomeLines
            cash={totals.cash}
            electronic={totals.electronic}
            unregistered={totals.unregistered}
            income={totals.income}
            paidOut={totals.paidOut}
            paidLabel="Uscite pagate nel periodo"
          />
          <p className="flex items-baseline justify-between gap-3 border-t border-border pt-3 text-xl font-semibold">
            <span>Totale</span>
            <Money cents={totals.result} />
          </p>
          <p className="text-sm text-muted-foreground">
            Stesso criterio di settimana e mese: le fatture non pagate restano fuori.
          </p>
        </CardContent>
      </Card>
      {mode === "anno" ? (
        <Card>
          <CardHeader>
            <CardTitle>Mesi con movimenti</CardTitle>
          </CardHeader>
          <CardContent>
            {months.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nessun movimento in questo anno.</p>
            ) : (
              <ul className="space-y-3">
                {months.map((month) => (
                  <li key={month.label} className="border-b border-border pb-3 last:border-0 last:pb-0">
                    <p className="text-sm font-semibold">{month.label}</p>
                    <div className="mt-1 space-y-1">
                      <IncomeLines
                        cash={month.cash}
                        electronic={month.electronic}
                        unregistered={month.unregistered}
                        income={month.income}
                        paidOut={month.paidOut}
                        paidLabel="Uscite pagate"
                      />
                    </div>
                    <p className="mt-2 flex justify-between gap-3 border-t border-border pt-2 text-sm font-medium">
                      <span>Totale</span>
                      <Money cents={month.result} />
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Giorni nel periodo</CardTitle>
          </CardHeader>
          <CardContent>
            {totals.closings.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nessuna chiusura in questo periodo.</p>
            ) : (
              <ul className="space-y-2">
                {totals.closings.map((closing) => (
                  <li key={closing.date} className="flex items-baseline justify-between gap-3 text-sm">
                    <span>{formatShort(closing.date)}</span>
                    <Money cents={dayTotal(closing)} className="font-medium" />
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      )}
      <Card>
        <CardHeader>
          <CardTitle>Uscite pagate</CardTitle>
        </CardHeader>
        <CardContent>
          {totals.paid.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nessun pagamento in questo periodo.</p>
          ) : (
            <ul className="space-y-2">
              {totals.paid.map((expense) => (
                <li key={expense.id} className="flex items-baseline justify-between gap-3 text-sm">
                  <span>
                    {KIND_LABEL[expense.kind]}
                    {expense.invoiceNumber ? ` ${expense.invoiceNumber}` : ""}
                  </span>
                  <Money cents={expense.amount} className="font-medium" />
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Fatture aperte, non sottratte</CardTitle>
        </CardHeader>
        <CardContent>
          {totals.openInvoices.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nessuna fattura aperta in questo periodo.</p>
          ) : (
            <ul className="space-y-2">
              {totals.openInvoices.map((expense) => (
                <li key={expense.id} className="flex items-baseline justify-between gap-3 text-sm">
                  <span>{expense.invoiceNumber} · da pagare</span>
                  <Money cents={expense.amount} className="font-medium" />
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function Tab({
  selected,
  label,
  onClick,
}: {
  selected: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={selected}
      onClick={onClick}
      className={`min-h-11 flex-1 cursor-pointer border border-foreground px-3 text-xs font-black tracking-[0.12em] uppercase transition-colors duration-200 ${
        selected ? "bg-primary text-primary-foreground" : "border border-border bg-card"
      }`}
    >
      {label}
    </button>
  );
}

function downloadReport(filename: string) {
  const previous = document.title;
  document.title = filename;
  const restore = () => {
    document.title = previous;
    window.removeEventListener("afterprint", restore);
  };
  window.addEventListener("afterprint", restore);
  window.print();
}

function IncomeLines({
  cash,
  electronic,
  unregistered,
  income,
  paidOut,
  paidLabel,
}: {
  cash: number;
  electronic: number;
  unregistered: number;
  income: number;
  paidOut: number;
  paidLabel: string;
}) {
  return (
    <>
      <Line label="Contante da chiusura cassa" cents={cash} />
      <Line label="Pagamenti elettronici da chiusura cassa" cents={electronic} />
      <Line label="Contante non registrato" cents={unregistered} />
      <Line label="Incassi" cents={income} tone="income" divided />
      <Line label={paidLabel} cents={paidOut} tone="expense" />
    </>
  );
}

function Line({
  label,
  cents,
  tone = "plain",
  divided = false,
}: {
  label: string;
  cents: number;
  tone?: "plain" | "income" | "expense";
  divided?: boolean;
}) {
  const toneClass =
    tone === "income" ? "font-semibold text-success" : tone === "expense" ? "font-semibold text-primary" : "";
  return (
    <p
      className={`flex items-baseline justify-between gap-3 text-sm ${divided ? "mt-1 border-t border-border pt-3" : ""} ${toneClass}`}
    >
      <span className={tone === "plain" ? "text-muted-foreground" : undefined}>{label}</span>
      <Money cents={cents} className="font-medium" />
    </p>
  );
}
