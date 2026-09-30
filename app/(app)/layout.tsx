import { Shell } from "@/components/shell";
import { loadLedger } from "@/lib/ledger";
import { LedgerProvider } from "@/lib/store";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const loaded = await loadLedger();

  if (!loaded.ok) {
    return (
      <main className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center px-4">
        <h1 className="text-4xl">Cassa non disponibile</h1>
        <p className="mt-3 text-sm text-muted-foreground">{loaded.message}</p>
      </main>
    );
  }

  return (
    <LedgerProvider ledger={loaded.ledger}>
      <Shell>{children}</Shell>
    </LedgerProvider>
  );
}
