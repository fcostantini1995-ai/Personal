"use server";

import { revalidatePath } from "next/cache";
import { isIsoDate, todayIso } from "@/lib/dates";
import { requireSession } from "@/lib/ledger";
import { KIND_LABEL, TERMS_OPTIONS, type Closing, type Expense, type ExpenseKind, type PaymentTerms } from "@/lib/types";

export type ActionResult = { ok: true } | { ok: false; message: string };

const kinds = new Set<string>(Object.keys(KIND_LABEL));
const terms = new Set<string>(TERMS_OPTIONS);

export async function saveClosing(closing: Closing): Promise<ActionResult> {
  const session = await requireSession();
  if (!session.ok) return session;
  if (!isIsoDate(closing.date) || closing.date > todayIso()) {
    return { ok: false, message: "La data non può essere successiva a oggi." };
  }
  if (!isCents(closing.cash) || !isCents(closing.electronic) || !isCents(closing.drawer)) {
    return { ok: false, message: "Gli importi della chiusura non sono validi." };
  }

  const { error } = await session.supabase.from("closings").upsert(
    {
      user_id: session.user.id,
      closing_date: closing.date,
      cash_cents: closing.cash,
      electronic_cents: closing.electronic,
      drawer_cents: closing.drawer,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "closing_date" },
  );

  if (error) return { ok: false, message: "Non sono riuscito a salvare la chiusura." };
  revalidatePath("/", "layout");
  return { ok: true };
}

export async function saveExpense(expense: Omit<Expense, "id">): Promise<ActionResult> {
  const session = await requireSession();
  if (!session.ok) return session;
  if (!kinds.has(expense.kind)) return { ok: false, message: "Tipo di uscita non valido." };
  if (!terms.has(expense.terms ?? "")) return { ok: false, message: "Tipo di pagamento non valido." };
  if (!isIsoDate(expense.documentDate) || expense.documentDate > todayIso()) {
    return { ok: false, message: "La consegna non può essere successiva a oggi." };
  }
  if (!isCents(expense.amount) || expense.amount <= 0) {
    return { ok: false, message: "Inserisci un importo maggiore di zero." };
  }
  if (expense.paymentDate !== null) {
    if (!isIsoDate(expense.paymentDate) || expense.paymentDate > todayIso() || expense.paymentDate < expense.documentDate) {
      return { ok: false, message: "La data di pagamento non è valida." };
    }
  }
  const invoice = expense.invoiceNumber?.trim() ?? "";
  if (expense.kind === "fattura" && invoice === "") {
    return { ok: false, message: "Inserisci il numero fattura." };
  }

  const { error } = await session.supabase.from("expenses").insert({
    user_id: session.user.id,
    kind: expense.kind as ExpenseKind,
    amount_cents: expense.amount,
    document_date: expense.documentDate,
    payment_date: expense.paymentDate,
    invoice_number: expense.kind === "fattura" ? invoice : null,
    terms: expense.terms as PaymentTerms,
  });

  if (error) return { ok: false, message: "Non sono riuscito a salvare l'uscita." };
  revalidatePath("/", "layout");
  return { ok: true };
}

export async function payExpense(id: string, paymentDate: string): Promise<ActionResult> {
  const session = await requireSession();
  if (!session.ok) return session;
  if (!isIsoDate(paymentDate) || paymentDate > todayIso()) {
    return { ok: false, message: "La data di pagamento non è valida." };
  }

  const { data, error } = await session.supabase
    .from("expenses")
    .update({ payment_date: paymentDate })
    .eq("id", id)
    .is("payment_date", null)
    .lte("document_date", paymentDate)
    .select("id");

  if (error || !data || data.length === 0) {
    return { ok: false, message: "Non sono riuscito a segnare la fattura come pagata." };
  }
  revalidatePath("/", "layout");
  return { ok: true };
}

function isCents(value: number): boolean {
  return Number.isInteger(value) && value >= 0 && value <= 100_000_000_00;
}
