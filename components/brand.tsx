export function BrandMark({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const box = size === "lg" ? "size-14 text-base" : "size-10 text-xs";
  const name = size === "lg" ? "text-sm" : "text-[0.68rem]";
  return (
    <div className="flex items-center gap-3">
      <span
        className={`grid ${box} shrink-0 place-items-center border border-primary bg-primary font-black tracking-tight text-primary-foreground`}
      >
        PP
      </span>
      <p className="leading-none">
        <span className={`block font-black tracking-[0.16em] ${name}`}>PASTA & PASTE</span>
        <span className="mt-1 block text-[0.62rem] font-bold tracking-[0.22em]">GASTRONOMIA</span>
      </p>
    </div>
  );
}
