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
      <main className="grid min-h-dvh place-items-center px-4">
        <BrandMark size="sm" />
      </main>
    );
  }

  return (
    <div className="min-h-dvh print:pl-0 md:pl-60">
      <a
        href="#contenuto"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[90] focus:bg-primary focus:px-3 focus:py-2 focus:text-sm focus:font-semibold focus:text-primary-foreground"
      >
        Vai al contenuto
      </a>
      <div className="fixed inset-x-0 top-0 z-[60] h-1 bg-primary print:hidden" aria-hidden="true" />
      <nav
        aria-label="Sezioni"
        className="fixed inset-x-0 bottom-0 z-50 flex border-t border-border bg-card pb-[env(safe-area-inset-bottom)] print:hidden md:inset-y-0 md:right-auto md:w-60 md:flex-col md:gap-2 md:border-r md:border-t-0 md:px-3 md:py-4 md:pb-4"
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
      <header className="sticky top-0 z-40 border-b border-border bg-background/95 print:hidden">
        <div className="flex items-center justify-between px-4 py-3 md:px-8">
        <div className="md:hidden">
          <BrandMark size="sm" />
        </div>
        <p className="hidden text-sm text-muted-foreground md:block">Pescara, Via Raffaello Sanzio 22</p>
        <button
          type="button"
          onClick={() => {
            void logout();
          }}
          className="inline-flex min-h-11 cursor-pointer items-center gap-2 border border-transparent px-3 text-sm font-semibold text-muted-foreground transition-[transform,background-color,color] duration-200 hover:border-foreground hover:bg-card hover:text-foreground active:translate-y-px"
        >
          <SignOut size={18} aria-hidden="true" />
          Esci
        </button>
        </div>
      </header>
      <main id="contenuto" className="mx-auto w-full max-w-3xl px-4 pb-28 pt-5 print:max-w-none print:px-0 print:pb-0 print:pt-0 md:px-8 md:pb-12 md:pt-8 lg:max-w-4xl">{children}</main>
    </div>
  );
}
