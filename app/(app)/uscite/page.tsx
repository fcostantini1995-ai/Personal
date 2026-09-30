"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Money } from "@/components/money";
import { formatShort } from "@/lib/money";
import { todayIso } from "@/lib/dates";
import { KIND_LABEL, isPaid, termsLabel, type Expense } from "@/lib/types";
import { useStore } from "@/lib/store";

type Filter = "tutte" | "aperte" | "pagate";

export default function UscitePage() {
  const { ledger, markPaid } = useStore();
  const [filter, setFilter] = useState<Filter>("tutte");
  const [notice, setNotice] = useState<{ text: string; ok: boolean } | null>(null);

  const rows = ledger.expenses
    .filter((expense) => {
      if (filter === "aperte") return !isPaid(expense);
      if (filter === "pagate") return isPaid(expense);
      return true;
    })
    .sort((a, b) => b.documentDate.localeCompare(a.documentDate));

  return (
    <div className="space-y-4">
      <div className="flex items-end justify-between gap-3">
        <div>
          <p className="text-sm text-muted-foreground">Uscite</p>
          <h1 className="text-2xl font-semibold tracking-tight">Cosa è uscito</h1>
        </div>
        <Link
          href="/uscite/nuova"
          className="inline-flex min-h-11 cursor-pointer items-center border border-foreground bg-accent px-4 text-xs font-black tracking-[0.14em] text-accent-foreground uppercase"
        >
          Nuova
        </Link>
      </div>
      <div className="flex gap-2" role="group" aria-label="Filtra uscite">
        <FilterButton current={filter} value="tutte" onSelect={setFilter} label="Tutte" />
        <FilterButton current={filter} value="aperte" onSelect={setFilter} label="Da pagare" />
        <FilterButton current={filter} value="pagate" onSelect={setFilter} label="Pagate" />
      </div>
      {notice ? (
        <p role={notice.ok ? "status" : "alert"} className={`text-sm ${notice.ok ? "text-success" : "text-warning"}`}>
          {notice.text}
        </p>
      ) : null}
      <ul className="space-y-3">
        {rows.map((expense) => (
          <li key={expense.id}>
            <ExpenseRow
              expense={expense}
              onPay={async () => {
                const paidOn = todayIso();
                const result = await markPaid(expense.id, paidOn);
                setNotice({
                  ok: result.ok,
                  text: result.ok
                    ? `${expense.invoiceNumber ? `Fattura ${expense.invoiceNumber}` : KIND_LABEL[expense.kind]} pagata il ${formatShort(paidOn)}. Entra nella settimana di oggi.`
                    : result.message,
                });
              }}
            />
          </li>
        ))}
      </ul>
      {rows.length === 0 ? <p className="text-sm text-muted-foreground">Nessuna uscita in questo filtro.</p> : null}
    </div>
  );
}

function FilterButton({
  current,
  value,
  label,
  onSelect,
}: {
  current: Filter;
  value: Filter;
  label: string;
  onSelect: (value: Filter) => void;
}) {
  const selected = current === value;
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={() => onSelect(value)}
      className={`min-h-11 cursor-pointer border border-foreground px-3 text-xs font-black tracking-[0.12em] uppercase transition-colors duration-200 ${
        selected ? "bg-primary text-primary-foreground" : "bg-card text-foreground border border-border"
      }`}
    >
      {label}
    </button>
  );
}

function ExpenseRow({ expense, onPay }: { expense: Expense; onPay: () => void }) {
  const paid = isPaid(expense);
  return (
    <Card>
      <CardContent className="space-y-3 pt-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="font-medium">{KIND_LABEL[expense.kind]}</p>
            <p className="text-sm text-muted-foreground">
              {expense.invoiceNumber ? `Fattura ${expense.invoiceNumber} · ` : ""}
              Consegna {formatShort(expense.documentDate)}
              {expense.terms ? ` · ${termsLabel(expense.terms)}` : ""}
            </p>
          </div>
          <Money cents={expense.amount} className="font-semibold" />
        </div>
        <div className="flex items-center justify-between gap-3">
          <p
            className={`rounded-md px-2 py-1 text-xs font-semibold ${
              paid ? "bg-success-bg text-success" : "bg-warning-bg text-warning"
            }`}
          >
            {paid ? `Pagata ${formatShort(expense.paymentDate ?? "")}` : "Da pagare"}
          </p>
          {!paid ? (
            <Button variant="outline" onClick={onPay}>
              Paga fattura
            </Button>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}
