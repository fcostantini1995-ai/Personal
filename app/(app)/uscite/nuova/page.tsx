"use client";

import { useRouter } from "next/navigation";
import { ExpenseForm } from "@/components/expense-form";
import { useStore } from "@/lib/store";

export default function NuovaUscitaPage() {
  const router = useRouter();
  const { addExpense } = useStore();

  return (
    <ExpenseForm
      title="Nuova uscita"
      submitLabel="Salva uscita"
      onSubmit={async (expense) => {
        const result = await addExpense(expense);
        if (result.ok) router.push("/uscite");
        return result;
      }}
    />
  );
}
