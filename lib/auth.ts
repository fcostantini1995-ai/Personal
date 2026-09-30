export function allowedEmails(): string[] {
  const raw = process.env.ALLOWED_EMAIL ?? "";
  const emails = raw
    .split(",")
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);
  return [...new Set(emails)];
}

export function isAllowedEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  return allowedEmails().includes(email.trim().toLowerCase());
}

export function magicLinkFailure(message: string): string {
  const text = message.toLowerCase();
  if (text.includes("redirect") || text.includes("not allowed")) {
    return "Supabase rifiuta il ritorno all'app. In URL Configuration il Site URL deve essere http://127.0.0.1:3456 e tra i Redirect URLs deve esserci http://127.0.0.1:3456/auth/callback.";
  }
  if (text.includes("rate limit")) {
    return "La posta di Supabase accetta 2 email all'ora per tutto il progetto. Il tetto di quest'ora è già pieno. Riprova fra un'ora.";
  }
  if (text.includes("signup")) {
    return "La creazione di nuovi utenti è spenta. In Authentication, provider Email, riaccendila e salva.";
  }
  if (text.includes("fetch failed") || text.includes("network") || text.includes("enotfound")) {
    return "Non riesco a contattare Supabase da questo computer. Riprova tra poco.";
  }
  if (text.includes("sending") || text.includes("smtp") || text.includes("mail")) {
    return "Supabase non è riuscito a spedire la mail. Controlla che il provider Email sia acceso.";
  }
  return "Non sono riuscito a inviare il link. Riprova tra poco.";
}

export function supabaseConfigured(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}
