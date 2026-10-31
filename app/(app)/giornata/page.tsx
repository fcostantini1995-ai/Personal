"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { DayStepper } from "@/components/day-stepper";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FieldError, Input, Label } from "@/components/ui/field";
import { Money } from "@/components/money";
import { centsToInput, parseEuro } from "@/lib/money";
import { todayIso } from "@/lib/dates";
import { useStore } from "@/lib/store";

type Errors = Partial<Record<"cash" | "electronic" | "drawer", string>>;

export default function GiornataPage() {
  const { ready, ledger, upsertClosing, removeClosing } = useStore();
  const today = todayIso();
  const [date, setDate] = useState(today);
  const [cash, setCash] = useState("");
  const [electronic, setElectronic] = useState("");
  const [drawer, setDrawer] = useState("");
  const [errors, setErrors] = useState<Errors>({});
  const [saved, setSaved] = useState(false);
  const [removed, setRemoved] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [pendingDelete, setPendingDelete] = useState(false);
  const loadedFor = useRef<string | null>(null);

  useEffect(() => {
    if (!ready || loadedFor.current === date) return;
    const dayChanged = loadedFor.current !== null;
    loadedFor.current = date;
    const existingClosing = ledger.closings.find((closing) => closing.date === date);
    setCash(existingClosing ? centsToInput(existingClosing.cash) : "");
    setElectronic(existingClosing ? centsToInput(existingClosing.electronic) : "");
    setDrawer(existingClosing ? centsToInput(existingClosing.drawer) : "");
    setErrors({});
    setConfirmDelete(false);
    if (dayChanged) {
      setSaved(false);
      setRemoved(false);
      setSaveError(null);
    }
  }, [ready, date, ledger.closings]);
  const summaryRef = useRef<HTMLDivElement>(null);

  const preview = useMemo(() => {
    const cashCents = parseEuro(cash);
    const electronicCents = parseEuro(electronic);
    const drawerCents = parseEuro(drawer);
    if (cashCents === null || electronicCents === null || drawerCents === null) return null;
    const chiusura = cashCents + electronicCents;
    const nonRegistrato = drawerCents - cashCents;
    return {
      chiusura,
      nonRegistrato,
      finale: chiusura + nonRegistrato,
    };
  }, [cash, electronic, drawer]);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    const next: Errors = {};
    if (parseEuro(cash) === null) next.cash = "Inserisci l'importo dei contanti.";
    if (parseEuro(electronic) === null) next.electronic = "Inserisci l'importo dei pagamenti elettronici.";
    if (parseEuro(drawer) === null) next.drawer = "Inserisci il contante fisico in cassa.";
    setErrors(next);
    if (Object.keys(next).length > 0) {
      setSaved(false);
      return;
    }
    const result = await upsertClosing({
      date,
      cash: parseEuro(cash) ?? 0,
      electronic: parseEuro(electronic) ?? 0,
      drawer: parseEuro(drawer) ?? 0,
    });
    if (!result.ok) {
      setSaved(false);
      setSaveError(result.message);
      return;
    }
    setSaveError(null);
    setRemoved(false);
    setSaved(true);
  }

  const existing = ledger.closings.some((closing) => closing.date === date);

  async function onDelete() {
    setPendingDelete(true);
    const result = await removeClosing(date);
    setPendingDelete(false);
    setConfirmDelete(false);
    if (!result.ok) {
      setSaveError(result.message);
      return;
    }
    loadedFor.current = null;
    setCash("");
    setElectronic("");
    setDrawer("");
    setSaved(false);
    setRemoved(true);
    setSaveError(null);
  }

  const errorItems = [
    errors.cash ? { href: "#cash", text: errors.cash } : null,
    errors.electronic ? { href: "#electronic", text: errors.electronic } : null,
    errors.drawer ? { href: "#drawer", text: errors.drawer } : null,
  ].filter((item): item is { href: string; text: string } => item !== null);
  const errorKey = errorItems.map((item) => item.href).join("|");

  useEffect(() => {
    if (errorKey) summaryRef.current?.focus();
  }, [errorKey]);

  return (
    <div className="space-y-4">
      <DayStepper date={date} today={today} onChange={setDate} label="Chiusura di cassa" />
      {existing ? (
        <p className="text-sm text-muted-foreground">
          Questa giornata è già salvata. I campi mostrano quei valori e puoi correggerli.
        </p>
      ) : (
        <p className="text-sm text-muted-foreground">
          Nessuna chiusura per questo giorno. Inseriscila anche se te ne accorgi dopo.
        </p>
      )}
      <form onSubmit={onSubmit} className="space-y-4" noValidate>
        {errorItems.length > 0 ? (
          <div
            ref={summaryRef}
            tabIndex={-1}
            role="alert"
            aria-labelledby="cassa-error-title"
            className="bg-warning-bg px-3 py-3 text-sm text-warning"
          >
            <h2 id="cassa-error-title" className="font-semibold">
              Controlla i campi
            </h2>
            <ul className="mt-2 space-y-1">
              {errorItems.map((item) => (
                <li key={item.href}>
                  <a href={item.href} className="underline">
                    {item.text}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
        <Card>
          <CardHeader>
            <CardTitle>Dalla chiusura cassa</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="cash">Contanti</Label>
              <Input
                id="cash"
                inputMode="decimal"
                value={cash}
                onChange={(event) => setCash(event.target.value)}
                aria-invalid={Boolean(errors.cash)}
                aria-describedby={errors.cash ? "cash-error" : undefined}
              />
              <FieldError id="cash-error">{errors.cash}</FieldError>
            </div>
            <div className="space-y-2">
              <Label htmlFor="electronic">Pagamenti elettronici</Label>
              <Input
                id="electronic"
                inputMode="decimal"
                value={electronic}
                onChange={(event) => setElectronic(event.target.value)}
                aria-invalid={Boolean(errors.electronic)}
                aria-describedby={errors.electronic ? "electronic-error" : undefined}
              />
              <FieldError id="electronic-error">{errors.electronic}</FieldError>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Contante fisico</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Label htmlFor="drawer">Contante in cassa</Label>
            <Input
              id="drawer"
              inputMode="decimal"
              value={drawer}
              onChange={(event) => setDrawer(event.target.value)}
              aria-invalid={Boolean(errors.drawer)}
              aria-describedby="drawer-hint"
            />
            <p id="drawer-hint" className="text-sm text-muted-foreground">
              Non Registrato = contante in cassa − contanti della chiusura. Può essere negativo.
            </p>
            <FieldError id="drawer-error">{errors.drawer}</FieldError>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Totali calcolati</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <Line label="Totale chiusura" cents={preview?.chiusura} />
            <Line label="Non Registrato" cents={preview?.nonRegistrato} />
            <p className="flex items-baseline justify-between gap-3 pt-2 text-base font-semibold">
              <span>Totale incassato finale</span>
              {preview ? <Money cents={preview.finale} /> : <span className="text-muted-foreground">-</span>}
            </p>
          </CardContent>
        </Card>
        <Button type="submit" variant="accent" className="w-full">
          Salva la giornata
        </Button>
        {saveError ? (
          <p role="alert" className="text-sm text-warning">
            {saveError}
          </p>
        ) : null}
        {saved ? (
          <p role="status" className="text-sm text-success">
            Chiusura salvata. Il resoconto di questa data usa questo totale.
          </p>
        ) : null}
        {removed ? (
          <p role="status" className="text-sm text-success">
            Chiusura eliminata. Il resoconto non conta più questo giorno. Puoi inserirla di nuovo.
          </p>
        ) : null}
        {existing && confirmDelete ? (
          <div className="space-y-3 border border-foreground bg-warning-bg p-3">
            <p className="text-sm text-warning">Elimino la chiusura di questo giorno. I totali del periodo si aggiornano.</p>
            <div className="flex gap-2">
              <Button variant="accent" className="flex-1" disabled={pendingDelete} onClick={() => void onDelete()}>
                {pendingDelete ? "Eliminazione" : "Elimina davvero"}
              </Button>
              <Button variant="outline" className="flex-1" onClick={() => setConfirmDelete(false)}>
                Annulla
              </Button>
            </div>
          </div>
        ) : null}
        {existing && !confirmDelete ? (
          <Button type="button" variant="outline" className="w-full" onClick={() => setConfirmDelete(true)}>
            Elimina chiusura
          </Button>
        ) : null}
      </form>
    </div>
  );
}

function Line({ label, cents }: { label: string; cents?: number }) {
  return (
    <p className="flex items-baseline justify-between gap-3">
      <span className="text-muted-foreground">{label}</span>
      {cents === undefined ? <span className="text-muted-foreground">-</span> : <Money cents={cents} className="font-medium" />}
    </p>
  );
}
