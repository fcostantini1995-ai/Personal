"use client";

import { useRouter } from "next/navigation";
import { createContext, useContext, useMemo, type ReactNode } from "react";
import { payExpense, saveClosing, saveExpense, type ActionResult } from "@/app/actions/ledger";
import type { Closing, Expense, Ledger } from "@/lib/types";

type StoreValue = {
  ready: boolean;
  ledger: Ledger;
  upsertClosing: (closing: Closing) => Promise<ActionResult>;
  addExpense: (expense: Omit<Expense, "id">) => Promise<ActionResult>;
  markPaid: (id: string, paymentDate: string) => Promise<ActionResult>;
};

const StoreContext = createContext<StoreValue | null>(null);

export function LedgerProvider({ ledger, children }: { ledger: Ledger; children: ReactNode }) {
  const router = useRouter();

  const value = useMemo<StoreValue>(
    () => ({
      ready: true,
      ledger,
      upsertClosing: async (closing) => {
        const result = await saveClosing(closing);
        if (result.ok) router.refresh();
        return result;
      },
      addExpense: async (expense) => {
        const result = await saveExpense(expense);
        if (result.ok) router.refresh();
        return result;
      },
      markPaid: async (id, paymentDate) => {
        const result = await payExpense(id, paymentDate);
        if (result.ok) router.refresh();
        return result;
      },
    }),
    [ledger, router],
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore(): StoreValue {
  const value = useContext(StoreContext);
  if (!value) throw new Error("useStore fuori da LedgerProvider");
  return value;
}
