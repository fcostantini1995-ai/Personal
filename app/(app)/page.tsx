"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Money } from "@/components/money";
import { todayIso } from "@/lib/dates";
import { KIND_LABEL, closingTotal, dayTotal, termsLabel, unregistered } from "@/lib/types";
import { formatDay, formatShort } from "@/lib/money";
import { monthRange, periodTotals, weekRange } from "@/lib/period";
import { useStore } from "@/lib/store";

export default function DashboardPage() {
  const { ledger } = useStore();
  const todayDate = todayIso();
  const today = ledger.closings.find((closing) => closing.date === todayDate);
  const week = periodTotals(ledger, weekRange(todayDate));
  const month = periodTotals(ledger, monthRange(todayDate));
  const maxBar = Math.max(week.income, week.paidOut, 1);

  return (
    <div className="space-y-4">
      <div>
        <p className="text-[0.68rem] font-bold tracking-[0.16em]">01 / OGGI</p>
        <h1 className="mt-2 text-4xl">{formatDay(todayDate)}</h1>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        <Card className="bg-primary text-primary-foreground shadow-[6px_6px_0_#2a2118]">
          <CardHeader>
            <CardTitle className="text-sm text-primary-foreground">Oggi</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl text-primary-foreground">
              <Money cents={today ? dayTotal(today) : 0} />
            </p>
            <p className="mt-1 text-sm text-primary-foreground/85">Totale chiusura + Non Registrato</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">Settimana</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">
              <Money cents={week.result} />
            </p>
            <p className="mt-1 text-sm text-muted-foreground">Incassi − uscite pagate</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">Mese</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">
              <Money cents={month.result} />
            </p>
            <p className="mt-1 text-sm text-muted-foreground">Stesso criterio della settimana</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Settimana, incassi e uscite</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Bar label="Incassi" cents={week.income} width={(week.income / maxBar) * 100} tone="primary" />
          <Bar label="Uscite pagate" cents={week.paidOut} width={(week.paidOut / maxBar) * 100} tone="accent" />
        </CardContent>
      </Card>

      {today ? (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Chiusura di oggi</CardTitle>
            <Link href="/giornata" className="min-h-11 cursor-pointer px-1 text-sm font-semibold text-primary">
              Modifica
            </Link>
          </CardHeader>
          <CardContent>
            <dl className="grid grid-cols-2 gap-3 text-sm">
              <Row term="Contanti" cents={today.cash} />
              <Row term="Pagamenti elettronici" cents={today.electronic} />
              <Row term="Totale chiusura" cents={closingTotal(today)} />
              <Row term="Non Registrato" cents={unregistered(today)} />
            </dl>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="pt-4">
            <p className="text-sm">Oggi la cassa non è ancora registrata.</p>
            <Link href="/giornata" className="mt-2 inline-flex min-h-11 items-center text-sm font-semibold text-primary">
              Registra la chiusura
            </Link>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Fatture ancora aperte</CardTitle>
        </CardHeader>
        <CardContent>
          {week.openInvoices.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nessuna fattura da pagare.</p>
          ) : (
            <ul className="space-y-3">
              {week.openInvoices.map((expense) => (
                <li key={expense.id} className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium">
                      {KIND_LABEL[expense.kind]} {expense.invoiceNumber}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Consegna {formatShort(expense.documentDate)} · {termsLabel(expense.terms)} · non sottratta
                    </p>
                  </div>
                  <Money cents={expense.amount} className="text-sm font-semibold" />
                </li>
              ))}
            </ul>
          )}
          <Link href="/uscite" className="mt-3 inline-flex min-h-11 items-center text-sm font-semibold text-primary">
            Vedi le uscite
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}

function Row({ term, cents }: { term: string; cents: number }) {
  return (
    <div>
      <dt className="text-muted-foreground">{term}</dt>
      <dd className="font-medium">
        <Money cents={cents} />
      </dd>
    </div>
  );
}

function Bar({
  label,
  cents,
  width,
  tone,
}: {
  label: string;
  cents: number;
  width: number;
  tone: "primary" | "accent";
}) {
  return (
    <div>
      <div className="mb-1 flex items-baseline justify-between gap-3 text-sm">
        <span>{label}</span>
        <Money cents={cents} className="font-semibold" />
      </div>
      <div className="h-2 rounded-full bg-muted" aria-hidden="true">
        <div
          className={`h-2 rounded-full ${tone === "primary" ? "bg-primary" : "bg-gold"}`}
          style={{ width: `${Math.max(width, 4)}%` }}
        />
      </div>
    </div>
  );
}
