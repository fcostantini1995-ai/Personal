"use server";

import { isAllowedEmail, supabaseConfigured } from "@/lib/auth";

export type MagicLinkResult = { ok: true; email: string } | { ok: false; message: string };

export async function canSendMagicLink(email: string): Promise<MagicLinkResult> {
  const recipient = email.trim().toLowerCase();
  if (!isAllowedEmail(recipient)) {
    return { ok: false, message: "Questo indirizzo non è abilitato." };
  }
  if (!supabaseConfigured()) {
    return { ok: false, message: "Supabase non è ancora configurato: mancano URL e chiave anon." };
  }
  return { ok: true, email: recipient };
}
