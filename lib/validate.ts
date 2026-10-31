import { isIsoDate, todayIso } from "./dates";
import { KIND_LABEL, TERMS_OPTIONS, type Expense, type ExpenseKind, type PaymentTerms } from "./types";

const kinds = new Set<string>(Object.keys(KIND_LABEL));
const terms = new Set<string>(TERMS_OPTIONS);
const maxCents = 100_000_000_00;

export function validClosingCents(value: number): boolean {
  return Number.isInteger(value) && value >= 0 && value <= maxCents;
}

export function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
}

export function parseExpense(
  expense: Omit<Expense, "id">,
):
  | {
      ok: true;
      row: {
        kind: ExpenseKind;
        amount_cents: number;
        document_date: string;
        payment_date: string | null;
        invoice_number: string | null;
        terms: PaymentTerms;
      };
    }
  | { ok: false; message: string } {
  if (!kinds.has(expense.kind)) return { ok: false, message: "Tipo di uscita non valido." };
  if (!terms.has(expense.terms ?? "")) return { ok: false, message: "Tipo di pagamento non valido." };
  if (!isIsoDate(expense.documentDate) || expense.documentDate > todayIso()) {
    return { ok: false, message: "La consegna non può essere successiva a oggi." };
  }
  if (!Number.isInteger(expense.amount) || expense.amount <= 0 || expense.amount > maxCents) {
    return { ok: false, message: "Inserisci un importo maggiore di zero." };
  }
  if (expense.paymentDate !== null) {
    if (
      !isIsoDate(expense.paymentDate) ||
      expense.paymentDate > todayIso() ||
      expense.paymentDate < expense.documentDate
    ) {
      return { ok: false, message: "La data di pagamento non è valida." };
    }
  }
  const invoice = expense.invoiceNumber?.trim() ?? "";
  if (expense.kind === "fattura" && invoice === "") {
    return { ok: false, message: "Inserisci il numero fattura." };
  }

  return {
    ok: true,
    row: {
      kind: expense.kind as ExpenseKind,
      amount_cents: expense.amount,
      document_date: expense.documentDate,
      payment_date: expense.paymentDate,
      invoice_number: expense.kind === "fattura" ? invoice : null,
      terms: expense.terms as PaymentTerms,
    },
  };
}

/** Se resta da pagare, esce dai totali. Se era già pagata in una data ancora valida, quella data non si sposta. */
export function resolvePaymentDate(input: {
  paid: boolean;
  documentDate: string;
  previousPayment: string | null;
  today: string;
}): string | null {
  if (!input.paid) return null;
  const previous = input.previousPayment;
  if (previous && previous >= input.documentDate && previous <= input.today) return previous;
  return input.today;
}
