"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { magicLinkFailure } from "@/lib/auth";
import { createClient } from "@/lib/supabase/client";
import { canSendMagicLink } from "./actions";

const errorCopy: Record<string, string> = {
  indirizzo: "Questo accesso non è abilitato.",
  link: "Il link non è più valido. Inviarne un altro, e apri solo l'ultimo messaggio.",
  browser: "Apri il link nello stesso browser in cui hai premuto Invia il link.",
};

export function LoginForm({ emails, errore }: { emails: string[]; errore?: string }) {
  const [pending, setPending] = useState(false);
  const [sentTo, setSentTo] = useState<string | null>(null);
  const [selected, setSelected] = useState(emails[0] ?? "");
  const [message, setMessage] = useState<string | null>(errore ? errorCopy[errore] ?? null : null);
  const summaryRef = useRef<HTMLDivElement>(null);
  const sending = useRef(false);

  useEffect(() => {
    if (message) summaryRef.current?.focus();
  }, [message]);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (sending.current) return;
    sending.current = true;
    setPending(true);
    setMessage(null);
    const allowed = await canSendMagicLink(selected);
    if (!allowed.ok) {
      sending.current = false;
      setPending(false);
      setSentTo(null);
      setMessage(allowed.message);
      return;
    }

    const origin = window.location.origin;
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email: allowed.email,
      options: {
        emailRedirectTo: `${origin}/auth/callback`,
        shouldCreateUser: true,
      },
    });
    sending.current = false;
    setPending(false);
    if (error) {
      setSentTo(null);
      setMessage(magicLinkFailure(error.message));
      return;
    }
    setSentTo(allowed.email);
  }

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle>Magic link</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-4" noValidate>
          {message ? (
            <div
              ref={summaryRef}
              tabIndex={-1}
              role="alert"
              aria-labelledby="login-error-title"
              className="bg-warning-bg px-3 py-3 text-sm text-warning"
            >
              <h2 id="login-error-title" className="font-semibold">
                Accesso non riuscito
              </h2>
              <p className="mt-1">{message}</p>
            </div>
          ) : null}
          {sentTo ? (
            <p role="status" className="text-sm text-success">
              Controlla la posta di {sentTo} e apri l&apos;ultimo link in questo stesso browser.
            </p>
          ) : (
            <p className="text-sm text-muted-foreground">
              {emails.length
                ? "Il link di accesso viene inviato solo all'indirizzo selezionato."
                : "Configura ALLOWED_EMAIL prima di inviare il link."}
            </p>
          )}
          <fieldset className="space-y-2" disabled={emails.length === 0}>
            <legend className="text-sm font-semibold">Invia il link a</legend>
            {emails.map((address) => (
              <label
                key={address}
                className="flex min-h-11 cursor-pointer items-center gap-3 border border-foreground bg-card px-3 text-sm"
              >
                <input
                  type="radio"
                  name="destinatario"
                  value={address}
                  checked={selected === address}
                  onChange={() => setSelected(address)}
                  className="size-4 accent-primary"
                />
                <span className="font-semibold">{address}</span>
              </label>
            ))}
          </fieldset>
          <Button type="submit" variant="accent" className="w-full" disabled={pending || !selected}>
            {pending ? "Invio in corso" : "Invia il link"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
