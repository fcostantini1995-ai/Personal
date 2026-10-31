"use client";

import { useEffect, useRef, useState } from "react";
import { DayStepper } from "@/components/day-stepper";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FieldError, Input, Label, Select } from "@/components/ui/field";
import { centsToInput, parseEuro } from "@/lib/money";
import { todayIso } from "@/lib/dates";
import { KIND_LABEL, TERMS_LABEL, TERMS_OPTIONS, type Expense, type ExpenseKind, type PaymentTerms } from "@/lib/types";
import type { ActionResult } from "@/app/actions/ledger";

const kinds = Object.keys(KIND_LABEL) as ExpenseKind[];

export function ExpenseForm({
  initial,
  title,
  submitLabel,
  onSubmit,
}: {
  initial?: Expense;
  title: string;
  submitLabel: string;
  onSubmit: (expense: Omit<Expense, "id">) => Promise<ActionResult>;
}) {
  const today = todayIso();
  const [kind, setKind] = useState<ExpenseKind>(initial?.kind ?? "fattura");
  const [amount, setAmount] = useState(initial ? centsToInput(initial.amount) : "");
  const [documentDate, setDocumentDate] = useState(initial?.documentDate ?? today);
  const [invoiceNumber, setInvoiceNumber] = useState(initial?.invoiceNumber ?? "");
  const [paid, setPaid] = useState(initial?.paymentDate != null);
  const [terms, setTerms] = useState<PaymentTerms>(initial?.terms ?? "scarico");
  const [errors, setErrors] = useState<{ amount?: string; invoice?: string; date?: string }>({});
  const [pending, setPending] = useState(false);
  const summaryRef = useRef<HTMLDivElement>(null);

  async function onFormSubmit(event: React.FormEvent) {
    event.preventDefault();
    const next: { amount?: string; invoice?: string; date?: string } = {};
    const cents = parseEuro(amount);
    if (cents === null || cents <= 0) next.amount = "Inserisci un importo maggiore di zero.";
    if (!documentDate) next.date = "Inserisci la data di consegna.";
    else if (documentDate > today) next.date = "La consegna non può essere successiva a oggi.";
    if (kind === "fattura" && invoiceNumber.trim() === "") {
      next.invoice = "Inserisci il numero fattura.";
    }
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    const previousPayment = initial?.paymentDate ?? null;
    let paymentDate: string | null = null;
    if (paid) {
      paymentDate =
        previousPayment && previousPayment >= documentDate && previousPayment <= today
          ? previousPayment
          : today;
    }

    setPending(true);
    const result = await onSubmit({
      kind,
      amount: cents ?? 0,
      documentDate,
      paymentDate,
      invoiceNumber: kind === "fattura" ? invoiceNumber.trim() : undefined,
      terms,
    });
    setPending(false);
    if (!result.ok) setErrors({ amount: result.message });
  }

  const errorItems = [
    errors.amount ? { href: "#amount", text: errors.amount } : null,
    errors.date ? { href: "#document-date", text: errors.date } : null,
    errors.invoice ? { href: "#invoice", text: errors.invoice } : null,
  ].filter((item): item is { href: string; text: string } => item !== null);
  const errorKey = errorItems.map((item) => item.href).join("|");

  useEffect(() => {
    if (errorKey) summaryRef.current?.focus();
  }, [errorKey]);

  return (
    <div className="space-y-4">
      <DayStepper date={documentDate} today={today} onChange={setDocumentDate} label={title} />
      <form onSubmit={onFormSubmit} className="space-y-4" noValidate>
        {errorItems.length > 0 ? (
          <div
            ref={summaryRef}
            tabIndex={-1}
            role="alert"
            aria-labelledby="uscita-error-title"
            className="bg-warning-bg px-3 py-3 text-sm text-warning"
          >
            <h2 id="uscita-error-title" className="font-semibold">
              Controlla i campi
            </h2>
            <ul className="mt-2 space-y-1">
              {errorItems.map((item) => (
                <li key={item.href}>
                  <a href={item.href} className="underline">
                    {item.text}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
        <Card>
          <CardHeader>
            <CardTitle>Tipo e importo</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="kind">Tipo</Label>
              <Select id="kind" value={kind} onChange={(event) => setKind(event.target.value as ExpenseKind)}>
                {kinds.map((item) => (
                  <option key={item} value={item}>
                    {KIND_LABEL[item]}
                  </option>
                ))}
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="amount">Importo</Label>
              <Input
                id="amount"
                inputMode="decimal"
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
                aria-invalid={Boolean(errors.amount)}
                aria-describedby={errors.amount ? "amount-error" : undefined}
              />
              <FieldError id="amount-error">{errors.amount}</FieldError>
            </div>
            <div className="space-y-2">
              <Label htmlFor="document-date">Data di consegna merce</Label>
              <Input
                id="document-date"
                type="date"
                max={today}
                value={documentDate}
                onChange={(event) => setDocumentDate(event.target.value)}
                aria-invalid={Boolean(errors.date)}
                aria-describedby="date-hint"
              />
              <p id="date-hint" className="text-sm text-muted-foreground">
                Giorno in cui arriva la merce. Puoi tornare a un giorno passato se non l&apos;hai segnata.
              </p>
              <FieldError id="date-error">{errors.date}</FieldError>
            </div>
            {kind === "fattura" ? (
              <div className="space-y-2">
                <Label htmlFor="invoice">Numero fattura</Label>
                <Input
                  id="invoice"
                  value={invoiceNumber}
                  onChange={(event) => setInvoiceNumber(event.target.value)}
                  aria-invalid={Boolean(errors.invoice)}
                />
                <FieldError id="invoice-error">{errors.invoice}</FieldError>
              </div>
            ) : null}
            <div className="space-y-2">
              <span className="text-sm font-medium text-foreground">Stato</span>
              <label htmlFor="paid" className="flex min-h-11 cursor-pointer items-center gap-3">
                <input
                  id="paid"
                  type="checkbox"
                  checked={paid}
                  onChange={(event) => setPaid(event.target.checked)}
                  className="size-5 accent-primary"
                  aria-describedby="paid-hint"
                />
                <span className="text-sm font-medium">{paid ? "Pagato" : "Da pagare"}</span>
              </label>
              <p id="paid-hint" className="text-sm text-muted-foreground">
                {paid
                  ? "Se era già pagata resta nella data di pagamento. Se la segni ora, entra nel giorno di oggi."
                  : "Resta da pagare e non entra nel resoconto."}
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="terms">Tipo pagamento</Label>
              <Select id="terms" value={terms} onChange={(event) => setTerms(event.target.value as PaymentTerms)}>
                {TERMS_OPTIONS.map((item) => (
                  <option key={item} value={item}>
                    {TERMS_LABEL[item]}
                  </option>
                ))}
              </Select>
            </div>
          </CardContent>
        </Card>
        <Button type="submit" variant="accent" className="w-full" disabled={pending}>
          {pending ? "Salvataggio" : submitLabel}
        </Button>
      </form>
    </div>
  );
}
