"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { ExpenseForm } from "@/components/expense-form";
import { Button } from "@/components/ui/button";
import { useStore } from "@/lib/store";

export default function ModificaUscitaPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { ledger, editExpense, removeExpense } = useStore();
  const expense = ledger.expenses.find((item) => item.id === params.id);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState(false);

  if (!expense) {
    return (
      <div className="space-y-3">
        <h1 className="text-2xl font-semibold tracking-tight">Uscita non trovata</h1>
        <p className="text-sm text-muted-foreground">Questa riga non è più in cassa.</p>
        <Link href="/uscite" className="inline-flex min-h-11 items-center text-sm font-semibold text-primary">
          Torna alle uscite
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <ExpenseForm
        key={expense.id}
        initial={expense}
        title="Modifica uscita"
        submitLabel="Salva modifiche"
        onSubmit={async (draft) => {
          const result = await editExpense({ ...draft, id: expense.id });
          if (result.ok) router.push("/uscite");
          return result;
        }}
      />
      {confirmDelete ? (
        <div className="space-y-3 border border-foreground bg-warning-bg p-3">
          <p className="text-sm text-warning">Elimino questa uscita. Il resoconto non la conterà più.</p>
          <div className="flex gap-2">
            <Button
              variant="accent"
              className="flex-1"
              disabled={pendingDelete}
              onClick={() => {
                setPendingDelete(true);
                void removeExpense(expense.id).then((result) => {
                  setPendingDelete(false);
                  if (!result.ok) {
                    setMessage(result.message);
                    return;
                  }
                  router.push("/uscite");
                });
              }}
            >
              {pendingDelete ? "Eliminazione" : "Elimina davvero"}
            </Button>
            <Button variant="outline" className="flex-1" onClick={() => setConfirmDelete(false)}>
              Annulla
            </Button>
          </div>
        </div>
      ) : (
        <Button variant="outline" className="w-full" onClick={() => setConfirmDelete(true)}>
          Elimina uscita
        </Button>
      )}
      {message ? (
        <p role="alert" className="text-sm text-warning">
          {message}
        </p>
      ) : null}
    </div>
  );
}
