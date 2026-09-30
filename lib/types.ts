export type ExpenseKind =
  | "fattura"
  | "merce_senza_fattura"
  | "bolletta"
  | "affitto"
  | "f24"
  | "contributi"
  | "busta_paga"
  | "ritenuta";

export type PaymentTerms = "scarico" | "7" | "10" | "15" | "30";

export type Closing = {
  date: string;
  cash: number;
  electronic: number;
  drawer: number;
};

export type Expense = {
  id: string;
  kind: ExpenseKind;
  amount: number;
  documentDate: string;
  paymentDate: string | null;
  invoiceNumber?: string;
  terms?: PaymentTerms;
};

export type Ledger = {
  closings: Closing[];
  expenses: Expense[];
};

export const KIND_LABEL: Record<ExpenseKind, string> = {
  fattura: "Fattura fornitore",
  merce_senza_fattura: "Merce senza fattura",
  bolletta: "Bolletta utenze",
  affitto: "Affitto",
  f24: "F24 titolare",
  contributi: "Contributi collaborazione",
  busta_paga: "Busta paga",
  ritenuta: "Ritenuta d'acconto",
};

export function closingTotal(closing: Closing): number {
  return closing.cash + closing.electronic;
}

export function unregistered(closing: Closing): number {
  return closing.drawer - closing.cash;
}

export function dayTotal(closing: Closing): number {
  return closingTotal(closing) + unregistered(closing);
}

export function isPaid(expense: Expense): boolean {
  return expense.paymentDate !== null;
}

export const TERMS_OPTIONS: PaymentTerms[] = ["scarico", "7", "10", "15", "30"];

export const TERMS_LABEL: Record<PaymentTerms, string> = {
  scarico: "Allo scarico",
  "7": "A 7 giorni",
  "10": "A 10 giorni",
  "15": "A 15 giorni",
  "30": "A 30 giorni",
};

export function termsLabel(terms?: string): string {
  if (!terms || terms === "subito" || terms === "scarico") return TERMS_LABEL.scarico;
  if (terms === "7" || terms === "10" || terms === "15" || terms === "30") return TERMS_LABEL[terms];
  return `A ${terms} giorni`;
}
