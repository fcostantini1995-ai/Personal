import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { after, describe, it } from "node:test";
import { allowedEmails, isAllowedEmail, loginEmails, magicLinkFailure, supabaseConfigured } from "../lib/auth";
import { isIsoDate, todayIso } from "../lib/dates";
import { centsToInput, formatDay, formatEuro, formatMonthYear, formatShort, parseEuro } from "../lib/money";
import {
  addDays,
  canGoForward,
  inRange,
  monthBreakdown,
  monthRange,
  periodTotals,
  rangeFor,
  shiftAnchor,
  weekRange,
  yearRange,
} from "../lib/period";
import {
  KIND_LABEL,
  TERMS_OPTIONS,
  closingTotal,
  dayTotal,
  isPaid,
  termsLabel,
  unregistered,
  type Expense,
  type ExpenseKind,
  type Ledger,
} from "../lib/types";
import { isUuid, parseExpense, resolvePaymentDate, validClosingCents } from "../lib/validate";

function setNodeEnv(value: string | undefined) {
  (process.env as Record<string, string | undefined>).NODE_ENV = value;
}

const owner = "f.costantini1995@gmail.com";
const tester = "francesco90campo@gmail.com";

function expense(partial: Partial<Expense> & Pick<Expense, "id" | "amount" | "documentDate">): Expense {
  return {
    kind: "fattura",
    paymentDate: null,
    invoiceNumber: "1",
    terms: "scarico",
    ...partial,
  };
}

describe("accesso", { concurrency: false }, () => {
  const previousAllowed = process.env.ALLOWED_EMAIL;
  const previousNodeEnv = process.env.NODE_ENV;
  const previousUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const previousKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  after(() => {
    process.env.ALLOWED_EMAIL = previousAllowed;
    setNodeEnv(previousNodeEnv);
    process.env.NEXT_PUBLIC_SUPABASE_URL = previousUrl;
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = previousKey;
  });

  it("tiene i due indirizzi, ignora spazi e doppioni, e rifiuta gli altri", () => {
    process.env.ALLOWED_EMAIL = ` ${owner} , ${tester} , ${owner} `;
    assert.deepEqual(allowedEmails(), [owner, tester]);
    assert.equal(isAllowedEmail(` ${owner.toUpperCase()} `), true);
    assert.equal(isAllowedEmail(tester), true);
    assert.equal(isAllowedEmail("altro@example.com"), false);
    assert.equal(isAllowedEmail(null), false);
    assert.equal(isAllowedEmail(""), false);
  });

  it("in development mostra l'indirizzo di prova, fuori lo nasconde ma lo lascia abilitato", () => {
    process.env.ALLOWED_EMAIL = `${owner},${tester}`;
    setNodeEnv("development");
    assert.deepEqual(loginEmails(), [owner, tester]);
    setNodeEnv("production");
    assert.deepEqual(loginEmails(), [owner]);
    assert.equal(isAllowedEmail(tester), true);
  });

  it("traduce gli errori del magic link senza inviare posta", () => {
    assert.match(magicLinkFailure("redirect not allowed"), /URL Configuration/);
    assert.match(magicLinkFailure("email rate limit exceeded"), /2 email all'ora/);
    assert.match(magicLinkFailure("Signups not allowed for otp"), /creazione di nuovi utenti/);
    assert.match(magicLinkFailure("fetch failed"), /contattare Supabase/);
    assert.match(magicLinkFailure("error sending mail"), /spedire la mail/);
    assert.match(magicLinkFailure("qualcos'altro"), /Riprova tra poco/);
  });

  it("riconosce se Supabase è configurato", () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "";
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "";
    assert.equal(supabaseConfigured(), false);
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "anon";
    assert.equal(supabaseConfigured(), true);
  });

  it("il database abilita gli stessi due indirizzi e condivide le righe", () => {
    const schema = readFileSync(new URL("../supabase/schema.sql", import.meta.url), "utf8");
    for (const email of [owner, tester]) {
      assert.equal(schema.split(email).length - 1, 2);
    }
    assert.match(schema, /unique \(closing_date\)/);
    assert.match(schema, /check \(payment_date is null or payment_date >= document_date\)/);
    assert.match(schema, /amount_cents > 0/);
    assert.match(schema, /cash_cents >= 0/);
    for (const policy of [
      "closings_select",
      "closings_update",
      "closings_delete",
      "expenses_select",
      "expenses_update",
      "expenses_delete",
    ]) {
      assert.match(schema, new RegExp(`create policy ${policy}`));
    }
    assert.match(schema, /grant select, insert, update, delete on public\.closings/);
    assert.match(schema, /grant select, insert, update, delete on public\.expenses/);
  });
});

describe("date", () => {
  it("usa il giorno di Roma, anche a cavallo della mezzanotte UTC", () => {
    assert.equal(todayIso(new Date("2026-10-31T22:30:00Z")), "2026-10-31");
    assert.equal(todayIso(new Date("2026-10-31T23:30:00Z")), "2026-11-01");
  });

  it("rifiuta le date impossibili", () => {
    assert.equal(isIsoDate("2026-10-31"), true);
    assert.equal(isIsoDate("2024-02-29"), true);
    assert.equal(isIsoDate("2026-02-29"), false);
    assert.equal(isIsoDate("2026-13-01"), false);
    assert.equal(isIsoDate("31-10-2026"), false);
  });
});

describe("importi", () => {
  it("legge i formati che si digitano in cassa", () => {
    assert.equal(parseEuro("1050"), 105_000);
    assert.equal(parseEuro("1050.50"), 105_050);
    assert.equal(parseEuro("1.050,50"), 105_050);
    assert.equal(parseEuro("1050,5"), 105_050);
    assert.equal(parseEuro(" 1 050,50 "), 105_050);
    assert.equal(parseEuro("-1,50"), -150);
    assert.equal(parseEuro(""), null);
    assert.equal(parseEuro("abc"), null);
    assert.equal(parseEuro("1,234"), null);
  });

  it("fa il giro campo e testo senza perdere i centesimi", () => {
    assert.equal(parseEuro(centsToInput(123_456)), 123_456);
    assert.match(formatEuro(100), /1,00/);
    assert.match(formatEuro(100), /€/);
    assert.match(formatDay("2026-10-31"), /31/);
    assert.match(formatMonthYear("2026-10-01"), /Ottobre 2026/);
    assert.match(formatShort("2026-10-31"), /31/);
  });

  it("la chiusura accetta zero, l'uscita no", () => {
    assert.equal(validClosingCents(0), true);
    assert.equal(validClosingCents(100_000_000_00), true);
    assert.equal(validClosingCents(-1), false);
    assert.equal(validClosingCents(1.5), false);
    assert.equal(validClosingCents(100_000_000_00 + 1), false);
  });
});

describe("cassa", () => {
  it("calcola chiusura, non registrato e totale, anche se il non registrato è negativo", () => {
    const closing = { date: "2026-10-29", cash: 25_000, electronic: 5_000, drawer: 10_000 };
    assert.equal(closingTotal(closing), 30_000);
    assert.equal(unregistered(closing), -15_000);
    assert.equal(dayTotal(closing), 15_000);
  });

  it("un secondo salvataggio è sulla stessa data, non una seconda riga", () => {
    const actions = readFileSync(new URL("../app/actions/ledger.ts", import.meta.url), "utf8");
    assert.match(actions, /onConflict: "closing_date"/);
    assert.equal(actions.split('revalidatePath("/", "layout")').length - 1, 6);
  });
});

describe("uscite", () => {
  const today = todayIso();
  const yesterday = addDays(today, -1);

  function draft(partial: Partial<Expense> = {}) {
    return expense({
      id: "00000000-0000-4000-8000-000000000001",
      amount: 100,
      documentDate: yesterday,
      paymentDate: null,
      invoiceNumber: "ABC",
      terms: "scarico" as const,
      ...partial,
    });
  }

  it("accetta tutti i tipi e tiene l'ordine dei pagamenti", () => {
    assert.deepEqual(TERMS_OPTIONS, ["scarico", "7", "10", "15", "30"]);
    assert.deepEqual(Object.keys(KIND_LABEL), [
      "fattura",
      "merce_senza_fattura",
      "bolletta",
      "affitto",
      "f24",
      "contributi",
      "busta_paga",
      "ritenuta",
    ]);
    for (const kind of Object.keys(KIND_LABEL) as ExpenseKind[]) {
      const parsed = parseExpense(draft({ kind, invoiceNumber: kind === "fattura" ? "9" : undefined }));
      assert.equal(parsed.ok, true, kind);
    }
    assert.equal(termsLabel("subito"), "Allo scarico");
    assert.equal(termsLabel("15"), "A 15 giorni");
  });

  it("blocca importo, data, numero fattura e pagamento incoerenti", () => {
    assert.equal(parseExpense(draft({ amount: 0 })).ok, false);
    assert.equal(parseExpense(draft({ amount: -1 })).ok, false);
    assert.equal(parseExpense(draft({ amount: 1.5 })).ok, false);
    assert.equal(parseExpense(draft({ documentDate: addDays(today, 1) })).ok, false);
    assert.equal(parseExpense(draft({ documentDate: "2026-02-31" })).ok, false);
    assert.equal(parseExpense(draft({ kind: "fattura", invoiceNumber: "  " })).ok, false);
    assert.equal(parseExpense(draft({ terms: undefined })).ok, false);
    assert.equal(parseExpense(draft({ kind: "sconosciuto" as ExpenseKind })).ok, false);
    assert.equal(parseExpense(draft({ paymentDate: addDays(yesterday, -1) })).ok, false);
    assert.equal(parseExpense(draft({ paymentDate: addDays(today, 1) })).ok, false);
  });

  it("una fattura tiene il numero, le altre uscite lo scartano", () => {
    const invoice = parseExpense(draft({ invoiceNumber: " 42 " }));
    assert.equal(invoice.ok, true);
    if (invoice.ok) assert.equal(invoice.row.invoice_number, "42");
    const goods = parseExpense(draft({ kind: "merce_senza_fattura", invoiceNumber: "non serve" }));
    assert.equal(goods.ok, true);
    if (goods.ok) assert.equal(goods.row.invoice_number, null);
  });

  it("pagare oggi entra nel periodo di oggi, togliere il pagato lo fa uscire", () => {
    assert.equal(
      resolvePaymentDate({ paid: false, documentDate: yesterday, previousPayment: yesterday, today }),
      null,
    );
    assert.equal(
      resolvePaymentDate({ paid: true, documentDate: yesterday, previousPayment: null, today }),
      today,
    );
    assert.equal(
      resolvePaymentDate({ paid: true, documentDate: yesterday, previousPayment: yesterday, today }),
      yesterday,
    );
    assert.equal(
      resolvePaymentDate({ paid: true, documentDate: today, previousPayment: yesterday, today }),
      today,
    );
  });

  it("Paga fattura aggiorna solo una riga ancora aperta, con consegna non successiva", () => {
    const actions = readFileSync(new URL("../app/actions/ledger.ts", import.meta.url), "utf8");
    assert.match(actions, /\.is\("payment_date", null\)/);
    assert.match(actions, /\.lte\("document_date", paymentDate\)/);
    assert.equal(isUuid("00000000-0000-4000-8000-000000000001"), true);
    assert.equal(isUuid("non-è-un-id"), false);
    assert.equal(isPaid(expense({ id: "a", amount: 1, documentDate: yesterday, paymentDate: today })), true);
    assert.equal(isPaid(expense({ id: "a", amount: 1, documentDate: yesterday, paymentDate: null })), false);
  });
});

describe("resoconto", () => {
  const today = todayIso();

  it("la settimana è lunedì-domenica e non si va oltre oggi", () => {
    const week = weekRange("2026-10-31");
    assert.deepEqual(week, { start: "2026-10-26", end: "2026-11-01", label: "Settimana lunedì–domenica" });
    assert.equal(weekRange("2026-10-26").start, "2026-10-26");
    assert.equal(weekRange("2026-11-01").start, "2026-10-26");
    assert.equal(monthRange("2026-10-31").start, "2026-10-01");
    assert.equal(monthRange("2026-10-31").end, "2026-10-31");
    assert.equal(yearRange("2026-07-01").start, "2026-01-01");
    assert.equal(yearRange("2026-07-01").end, "2026-12-31");
    for (const mode of ["settimana", "mese", "anno"] as const) {
      assert.equal(canGoForward(today, mode, today), false);
      assert.equal(inRange(today, rangeFor(mode, today)), true);
    }
    assert.equal(canGoForward(addDays(today, -7), "settimana", today), true);
    const previousMonth = addDays(monthRange(today).start, -1);
    assert.equal(canGoForward(previousMonth, "mese", today), true);
    assert.equal(canGoForward(`${Number(today.slice(0, 4)) - 1}-06-15`, "anno", today), true);
    assert.equal(shiftAnchor("2026-01-15", "mese", -1), "2025-12-15");
    assert.equal(addDays("2026-10-31", 1), "2026-11-01");
  });

  it("somma le tre righe, esclude le aperte e usa la data di pagamento", () => {
    const ledger: Ledger = {
      closings: [
        { date: "2026-09-30", cash: 12_300, electronic: 18_100, drawer: 30_300 },
        { date: "2026-10-01", cash: 6_100, electronic: 11_300, drawer: 18_100 },
        { date: "2026-10-29", cash: 4_000, electronic: 2_000, drawer: 1_000 },
      ],
      expenses: [
        expense({ id: "open", amount: 9_100, documentDate: "2026-10-23", paymentDate: null, invoiceNumber: "Aperta" }),
        expense({
          id: "future-doc",
          amount: 5_000,
          documentDate: "2026-11-02",
          paymentDate: null,
          invoiceNumber: "Dopo",
        }),
        expense({
          id: "paid-october",
          amount: 4_000,
          documentDate: "2026-09-01",
          paymentDate: "2026-10-02",
          invoiceNumber: "Pagata",
        }),
        expense({
          id: "paid-september",
          amount: 8_000,
          documentDate: "2026-10-01",
          paymentDate: "2026-09-30",
          invoiceNumber: "Settembre",
        }),
        expense({
          id: "goods",
          kind: "merce_senza_fattura",
          amount: 1_000,
          documentDate: "2026-10-04",
          paymentDate: null,
          invoiceNumber: undefined,
        }),
      ],
    };
    const october = periodTotals(ledger, monthRange("2026-10-15"));
    assert.equal(october.cash, 6_100 + 4_000);
    assert.equal(october.electronic, 11_300 + 2_000);
    assert.equal(october.unregistered, (18_100 - 6_100) + (1_000 - 4_000));
    assert.equal(october.income, october.cash + october.electronic + october.unregistered);
    assert.equal(october.paidOut, 4_000);
    assert.equal(october.result, october.income - october.paidOut);
    assert.deepEqual(october.closings.map((closing) => closing.date), ["2026-10-01", "2026-10-29"]);
    assert.deepEqual(october.paid.map((item) => item.id), ["paid-october"]);
    assert.deepEqual(october.openInvoices.map((item) => item.id), ["open"]);
    assert.equal(dayTotal(october.closings[0]), 6_100 + 11_300 + (18_100 - 6_100));

    const withoutDay = periodTotals(
      { ...ledger, closings: ledger.closings.filter((closing) => closing.date !== "2026-10-29") },
      monthRange("2026-10-15"),
    );
    assert.equal(withoutDay.income, october.income - dayTotal(ledger.closings[2]));

    const unpaid = periodTotals(
      {
        ...ledger,
        expenses: ledger.expenses.map((item) => (item.id === "paid-october" ? { ...item, paymentDate: null } : item)),
      },
      monthRange("2026-10-15"),
    );
    assert.equal(unpaid.paidOut, 0);
    assert.deepEqual(unpaid.openInvoices.map((item) => item.id), ["open", "paid-october"]);
  });

  it("l'anno elenca solo i mesi con movimenti e ripete la stessa somma", () => {
    const ledger: Ledger = {
      closings: [{ date: "2026-09-30", cash: 100, electronic: 200, drawer: 100 }],
      expenses: [
        expense({ id: "oct", amount: 50, documentDate: "2026-10-01", paymentDate: "2026-10-03", invoiceNumber: "M" }),
      ],
    };
    const rows = monthBreakdown(ledger, yearRange("2026-06-01"));
    assert.deepEqual(rows.map((row) => row.label), ["Settembre", "Ottobre"]);
    const september = periodTotals(ledger, monthRange("2026-09-01"));
    assert.equal(rows[0].income, september.income);
    assert.equal(rows[0].result, september.result);
    assert.equal(rows[1].paidOut, 50);
    assert.equal(rows[1].income, 0);
  });

  it("la stampa nasconde navigazione, schede e il pulsante PDF", () => {
    const shell = readFileSync(new URL("../components/shell.tsx", import.meta.url), "utf8");
    const report = readFileSync(new URL("../app/(app)/periodo/page.tsx", import.meta.url), "utf8");
    const css = readFileSync(new URL("../app/globals.css", import.meta.url), "utf8");
    assert.match(shell, /aria-label="Sezioni"[\s\S]*print:hidden/);
    assert.match(shell, /<header[\s\S]*print:hidden/);
    assert.match(report, /print:hidden" role="tablist"/);
    assert.match(report, /Scarica PDF/);
    assert.match(report, /print:hidden/);
    assert.match(css, /print-color-adjust: exact/);
    assert.match(shell, /href: "\/"/);
    assert.match(shell, /Cassa/);
    assert.match(shell, /Uscite/);
    assert.match(shell, /Resoconto/);
  });
});
