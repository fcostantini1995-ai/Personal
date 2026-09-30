<!-- IMPACT-META
schema: 1
mode: how
step: precondition
commit: n/a
commit_short: n/a
branch: n/a
worktree: n/a
baseline_date: n/a
generated_at: 2026-09-30T14:45:00+02:00
-->
# IMPACT — precondizione non soddisfatta - Progetto Contabile

> **Baseline commit:** `n/a` · il progetto non è un repository git, quindi non esiste un baseline su cui la modalità `update` possa fare un diff.

## Esito

La pipeline IMPACT non è stata eseguita.

IMPACT `how` e `what-process` ricostruiscono architettura e processi **dal codice**. In `/Users/francescocampo/Documents/PROGETTI/Contabile` non c'è un progetto riconoscibile: niente `package.json`, `pom.xml`, sorgenti o altra struttura applicativa. La cartella, prima di questa analisi, era vuota.

Non è stato chiesto un path alternativo che contenga codice. Produrre `docs/00_deep_dive.md` o un processo con colonna «sorgente nel codice» avrebbe significato inventare un sistema che non esiste. Quei file non sono stati creati.

## Cosa non è stato selezionato

La skill `how` chiede uno scenario (FULL, BROWNFIELD, AUDIT, ONBOARDING, PRE-REFACTORING) oppure una fase. Senza codice nessuno di questi scenari produce un risultato verificabile. La scelta dello scenario resta aperta per quando esisterà un'implementazione.

## Come si combina con ENGenius

L'intervista è stata analizzata con ENGenius ANALYSIS. Quel materiale è un modello **in avanti** (cosa la cliente fa oggi e cosa l'app deve fare), non un reverse engineering.

Quando ci sarà codice, IMPACT potrà ripartire da `HOW_00` e confrontare l'implementazione con gli artefatti in `artifacts/Contabile/analysis/`.
