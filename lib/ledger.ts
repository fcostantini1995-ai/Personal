import { isAllowedEmail } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import type { Closing, Expense, ExpenseKind, Ledger, PaymentTerms } from "@/lib/types";

type ClosingRow = {
  closing_date: string;
  cash_cents: number;
  electronic_cents: number;
  drawer_cents: number;
};

type ExpenseRow = {
  id: string;
  kind: ExpenseKind;
  amount_cents: number;
  document_date: string;
  payment_date: string | null;
  invoice_number: string | null;
  terms: PaymentTerms;
};

export type LedgerResult = { ok: true; ledger: Ledger } | { ok: false; message: string };

export async function loadLedger(): Promise<LedgerResult> {
  const session = await requireSession();
  if (!session.ok) return session;

  const [closingsResult, expensesResult] = await Promise.all([
    session.supabase
      .from("closings")
      .select("closing_date, cash_cents, electronic_cents, drawer_cents")
      .order("closing_date", { ascending: true }),
    session.supabase
      .from("expenses")
      .select("id, kind, amount_cents, document_date, payment_date, invoice_number, terms")
      .order("document_date", { ascending: false }),
  ]);

  if (closingsResult.error || expensesResult.error) {
    return {
      ok: false,
      message: "Non riesco a leggere la cassa. Controlla che lo schema sia stato eseguito su Supabase.",
    };
  }

  const closings = ((closingsResult.data ?? []) as ClosingRow[]).map(
    (row): Closing => ({
      date: row.closing_date,
      cash: row.cash_cents,
      electronic: row.electronic_cents,
      drawer: row.drawer_cents,
    }),
  );
  const expenses = ((expensesResult.data ?? []) as ExpenseRow[]).map(
    (row): Expense => ({
      id: row.id,
      kind: row.kind,
      amount: row.amount_cents,
      documentDate: row.document_date,
      paymentDate: row.payment_date,
      invoiceNumber: row.invoice_number ?? undefined,
      terms: row.terms,
    }),
  );

  return { ok: true, ledger: { closings, expenses } };
}

export async function requireSession() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || !isAllowedEmail(user.email)) {
    return { ok: false as const, message: "Sessione non valida." };
  }
  return { ok: true as const, supabase, user };
}
