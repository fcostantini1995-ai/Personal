"use server";

import { revalidatePath } from "next/cache";
import { isIsoDate, todayIso } from "@/lib/dates";
import { requireSession } from "@/lib/ledger";
import { isUuid, parseExpense, validClosingCents } from "@/lib/validate";
import type { Closing, Expense } from "@/lib/types";

export type ActionResult = { ok: true } | { ok: false; message: string };

export async function saveClosing(closing: Closing): Promise<ActionResult> {
  const session = await requireSession();
  if (!session.ok) return session;
  if (!isIsoDate(closing.date) || closing.date > todayIso()) {
    return { ok: false, message: "La data non può essere successiva a oggi." };
  }
  if (!validClosingCents(closing.cash) || !validClosingCents(closing.electronic) || !validClosingCents(closing.drawer)) {
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

export async function deleteClosing(date: string): Promise<ActionResult> {
  const session = await requireSession();
  if (!session.ok) return session;
  if (!isIsoDate(date) || date > todayIso()) {
    return { ok: false, message: "La data non può essere successiva a oggi." };
  }

  const { data, error } = await session.supabase
    .from("closings")
    .delete()
    .eq("closing_date", date)
    .select("id");

  if (error || !data || data.length === 0) {
    return { ok: false, message: "Non sono riuscito a eliminare la chiusura." };
  }
  revalidatePath("/", "layout");
  return { ok: true };
}

export async function saveExpense(expense: Omit<Expense, "id">): Promise<ActionResult> {
  const session = await requireSession();
  if (!session.ok) return session;
  const parsed = parseExpense(expense);
  if (!parsed.ok) return parsed;

  const { error } = await session.supabase.from("expenses").insert({
    user_id: session.user.id,
    ...parsed.row,
  });

  if (error) return { ok: false, message: "Non sono riuscito a salvare l'uscita." };
  revalidatePath("/", "layout");
  return { ok: true };
}

export async function updateExpense(expense: Expense): Promise<ActionResult> {
  const session = await requireSession();
  if (!session.ok) return session;
  if (!isUuid(expense.id)) return { ok: false, message: "Uscita non valida." };
  const parsed = parseExpense(expense);
  if (!parsed.ok) return parsed;

  const { data, error } = await session.supabase
    .from("expenses")
    .update(parsed.row)
    .eq("id", expense.id)
    .select("id");

  if (error || !data || data.length === 0) {
    return { ok: false, message: "Non sono riuscito a modificare l'uscita." };
  }
  revalidatePath("/", "layout");
  return { ok: true };
}

export async function deleteExpense(id: string): Promise<ActionResult> {
  const session = await requireSession();
  if (!session.ok) return session;
  if (!isUuid(id)) return { ok: false, message: "Uscita non valida." };

  const { data, error } = await session.supabase.from("expenses").delete().eq("id", id).select("id");

  if (error || !data || data.length === 0) {
    return { ok: false, message: "Non sono riuscito a eliminare l'uscita." };
  }
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

