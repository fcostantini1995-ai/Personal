export function Money({ cents, className = "" }: { cents: number; className?: string }) {
  const formatted = new Intl.NumberFormat("it-IT", {
    style: "currency",
    currency: "EUR",
  }).format(cents / 100);
  return (
    <span className={`font-black tabular-nums tracking-tight ${className}`}>{formatted}</span>
  );
}
