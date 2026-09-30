"use client";

import {
  CalendarBlank,
  CashRegister,
  House,
  Receipt,
  SignOut,
} from "@phosphor-icons/react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { type ReactNode } from "react";
import { BrandMark } from "@/components/brand";
import { useStore } from "@/lib/store";
import { createClient } from "@/lib/supabase/client";

const links = [
  { href: "/", label: "Oggi", icon: House },
  { href: "/giornata", label: "Cassa", icon: CashRegister },
  { href: "/uscite", label: "Uscite", icon: Receipt },
  { href: "/periodo", label: "Resoconto", icon: CalendarBlank },
];

export function Shell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { ready } = useStore();

  async function logout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.replace("/login");
    router.refresh();
  }

  if (!ready) {
    return (
      <main className="grid min-h-screen place-items-center px-4">
        <BrandMark size="sm" />
      </main>
    );
  }

  return (
    <div className="min-h-screen md:pl-60">
      <div className="fixed inset-x-0 top-0 z-[60] h-1 bg-primary" aria-hidden="true" />
      <nav
        aria-label="Sezioni"
        className="fixed inset-x-0 bottom-0 z-50 flex border-t border-border bg-card pb-[env(safe-area-inset-bottom)] md:inset-y-0 md:right-auto md:w-60 md:flex-col md:gap-2 md:border-r md:border-t-0 md:px-3 md:py-4 md:pb-4"
      >
        <div className="hidden px-3 pb-4 md:block">
          <BrandMark size="sm" />
        </div>
        {links.map((link) => {
          const active = pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href));
          const Icon = link.icon;
          return (
            <Link
              key={link.href}
              href={link.href}
              aria-current={active ? "page" : undefined}
              className={`flex min-h-12 flex-1 cursor-pointer flex-col items-center justify-center gap-1 text-[0.62rem] font-black tracking-[0.12em] uppercase transition-colors duration-200 md:min-h-11 md:flex-none md:flex-row md:justify-start md:gap-3 md:px-3 md:text-xs ${
                active ? "bg-primary text-primary-foreground" : "text-foreground hover:bg-muted"
              }`}
            >
              <Icon size={22} weight="regular" aria-hidden="true" />
              {link.label}
            </Link>
          );
        })}
      </nav>
      <header className="sticky top-0 z-40 border-b border-border bg-background/95">
        <div className="flex items-center justify-between px-4 py-3 md:px-8">
        <div className="md:hidden">
          <BrandMark size="sm" />
        </div>
        <p className="hidden text-sm text-muted-foreground md:block">
          Un solo accesso · cassa su Supabase
        </p>
        <button
          type="button"
          onClick={() => {
            void logout();
          }}
          className="inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-lg px-3 text-sm font-medium text-muted-foreground transition-colors duration-200 hover:bg-muted hover:text-foreground"
        >
          <SignOut size={18} aria-hidden="true" />
          Esci
        </button>
        </div>
      </header>
      <main className="mx-auto w-full max-w-3xl px-4 pb-28 pt-4 md:px-8 md:pb-12 md:pt-6">{children}</main>
    </div>
  );
}
