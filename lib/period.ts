import { dayTotal, isPaid, type Closing, type Expense, type Ledger } from "./types";

export type Range = { start: string; end: string; label: string };

function parse(iso: string): Date {
  const [year, month, day] = iso.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function iso(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function weekRange(anchor: string): Range {
  const date = parse(anchor);
  const mondayOffset = (date.getDay() + 6) % 7;
  const start = new Date(date);
  start.setDate(date.getDate() - mondayOffset);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  return {
    start: iso(start),
    end: iso(end),
    label: "Settimana lunedì–domenica",
  };
}

export function monthRange(anchor: string): Range {
  const date = parse(anchor);
  const start = new Date(date.getFullYear(), date.getMonth(), 1);
  const end = new Date(date.getFullYear(), date.getMonth() + 1, 0);
  return {
    start: iso(start),
    end: iso(end),
    label: "Mese civile",
  };
}

export function yearRange(anchor: string): Range {
  const date = parse(anchor);
  const start = new Date(date.getFullYear(), 0, 1);
  const end = new Date(date.getFullYear(), 11, 31);
  return {
    start: iso(start),
    end: iso(end),
    label: "Anno civile",
  };
}

export type ReportMode = "settimana" | "mese" | "anno";

export function rangeFor(mode: ReportMode, anchor: string): Range {
  if (mode === "settimana") return weekRange(anchor);
  if (mode === "mese") return monthRange(anchor);
  return yearRange(anchor);
}

export function addDays(anchor: string, delta: number): string {
  const date = parse(anchor);
  date.setDate(date.getDate() + delta);
  return iso(date);
}

export function shiftAnchor(anchor: string, mode: ReportMode, delta: number): string {
  const date = parse(anchor);
  if (mode === "settimana") date.setDate(date.getDate() + delta * 7);
  else if (mode === "mese") date.setMonth(date.getMonth() + delta);
  else date.setFullYear(date.getFullYear() + delta);
  return iso(date);
}

export function canGoForward(anchor: string, mode: ReportMode, today: string): boolean {
  const next = shiftAnchor(anchor, mode, 1);
  return rangeFor(mode, next).start <= today;
}

export function inRange(date: string, range: Range): boolean {
  return date >= range.start && date <= range.end;
}

export type PeriodTotals = {
  income: number;
  paidOut: number;
  result: number;
  closings: Closing[];
  paid: Expense[];
  openInvoices: Expense[];
};

export function periodTotals(ledger: Ledger, range: Range): PeriodTotals {
  const closings = ledger.closings
    .filter((closing) => inRange(closing.date, range))
    .sort((a, b) => a.date.localeCompare(b.date));
  const income = closings.reduce((sum, closing) => sum + dayTotal(closing), 0);
  const paid = ledger.expenses
    .filter((expense) => expense.paymentDate && inRange(expense.paymentDate, range))
    .sort((a, b) => (a.paymentDate ?? "").localeCompare(b.paymentDate ?? ""));
  const paidOut = paid.reduce((sum, expense) => sum + expense.amount, 0);
  const openInvoices = ledger.expenses
    .filter(
      (expense) =>
        expense.kind === "fattura" && !isPaid(expense) && expense.documentDate <= range.end,
    )
    .sort((a, b) => b.documentDate.localeCompare(a.documentDate));
  return {
    income,
    paidOut,
    result: income - paidOut,
    closings,
    paid,
    openInvoices,
  };
}

export type MonthRow = {
  label: string;
  income: number;
  paidOut: number;
  result: number;
};

export function monthBreakdown(ledger: Ledger, range: Range): MonthRow[] {
  const year = parse(range.start).getFullYear();
  const rows: MonthRow[] = [];
  for (let month = 0; month < 12; month += 1) {
    const start = new Date(year, month, 1);
    const end = new Date(year, month + 1, 0);
    const totals = periodTotals(ledger, {
      start: iso(start),
      end: iso(end),
      label: "",
    });
    if (totals.closings.length === 0 && totals.paid.length === 0) continue;
    const label = new Intl.DateTimeFormat("it-IT", { month: "long" }).format(start);
    rows.push({
      label: label.charAt(0).toUpperCase() + label.slice(1),
      income: totals.income,
      paidOut: totals.paidOut,
      result: totals.result,
    });
  }
  return rows;
}
