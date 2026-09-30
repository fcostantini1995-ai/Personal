import { BrandMark } from "@/components/brand";
import { allowedEmails } from "@/lib/auth";
import { LoginForm } from "./login-form";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ errore?: string }>;
}) {
  const { errore } = await searchParams;
  const emails = allowedEmails();

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center px-4 py-10">
      <p className="mb-5 flex items-center gap-3 text-[0.68rem] font-bold tracking-[0.16em]">
        <span className="h-0.5 w-8 bg-primary" aria-hidden="true" />
        PESCARA · VIA RAFFAELLO SANZIO 22
      </p>
      <BrandMark size="lg" />
      <h1 className="mt-8 text-5xl">Entra in cassa</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Scegli a chi inviare il link. Non c&apos;è password.
      </p>
      <LoginForm emails={emails} errore={errore} />
      <p className="mt-6 text-xs leading-5 text-muted-foreground">
        L&apos;accesso e i movimenti passano da Supabase. Il link arriva solo all&apos;indirizzo scelto.
      </p>
    </main>
  );
}
