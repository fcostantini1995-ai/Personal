# Contabile — design system

Mockup di un'app a utente singolo per chiusura di cassa e uscite. Non è una landing.

## Scelte verificate

Ricerche `ui-ux-pro-max` del 30 settembre 2026.

| Fonte | Esito | Uso |
|---|---|---|
| `--design-system` «enterprise / cashbook» | Pattern Enterprise Gateway e Hero + Features + CTA | Scartati: sono pagine di marketing, non l'app dopo il login |
| `--domain product` «finance dashboard mobile» | Personal Finance Tracker e Banking: Financial Dashboard, Minimalism & Swiss Style | Adottato come stile |
| Stesso product search | Glassmorphism + OLED come stile primario del tracker personale | Scartato sui form di importo: il vetro abbassa il contrasto dei numeri |
| `--design-system` seconda query, token colore | Primary `#2563EB`, accent `#EA580C`, background `#F8FAFC`, foreground `#1E293B`, muted `#475569` | Adottati. Testo sull'accento: nero, come da token `on-accent` |
| Prima query, tipografia dashboard | Fira Sans + Fira Code | Fira Sans per il testo, Fira Code solo per gli importi |
| `--domain chart` KPI | Gauge e bullet richiedono un obiettivo | Non usati: qui non c'è un target. Confronto incassi/uscite con cifre e barre etichettate |
| `--domain ux` form | Riepilogo errori in testa, focus sul riepilogo, errori sul campo, label vere | Adottato su login, giornata e nuova uscita |
| `--domain ux` touch | Bersagli ampi, almeno 8px tra i controlli | Adottato |
| `--stack html-tailwind` | Una sola navigazione, `z-50` sul fisso, padding `px-4 md:px-8` | Adottato: la stessa nav è in basso sul telefono e a sinistra da `md` |

Dial richiesti in ricerca: variance 4, motion 2, density 7. Niente coreografia GSAP: il motion da landing non si applica a un gestionale.

## Token

| Ruolo | Valore |
|---|---|
| Primary | `#2563EB` |
| On primary | `#FFFFFF` |
| Accent / CTA | `#EA580C` |
| On accent | `#000000` |
| Background | `#F8FAFC` |
| Foreground | `#1E293B` |
| Card | `#FFFFFF` |
| Muted | `#E9EFF8` |
| Muted foreground | `#475569` |
| Border | `#E2E8F0` |
| Destructive | `#DC2626` |
| Success (testo su fondo chiaro) | `#166534` / `#DCFCE7` |
| Warning (testo su fondo chiaro) | `#92400E` / `#FEF3C7` |
| Ring | `#2563EB` |

Lo stato non è mai solo colore: «Pagata» e «Da pagare» sono scritti.

## Layout

Mobile first. Contenuto in una colonna, `max-w-3xl` da tablet in su. Nav fissa in basso con quattro voci (Oggi, Cassa, Uscite, Mese), altezza di tocco almeno 44px. Da 768px la stessa nav diventa colonna sinistra. Icone Phosphor outline, `aria-hidden` quando c'è il testo. Transizioni 200ms su colore e opacità. `prefers-reduced-motion: reduce` azzera le transizioni.
