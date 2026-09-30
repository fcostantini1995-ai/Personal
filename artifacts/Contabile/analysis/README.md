# Analisi Contabile — indice

Fase ENGenius: **ANALYSIS** (bozza locale, categoria equivalente `ANALYSIS_DRAFT`).
Progetto: `Contabile`.
DocMind non è disponibile: gli artefatti sono solo su filesystem.
Fonte unica: [00_intervista.md](00_intervista.md).

Non esistevano documenti `CONCEPT_DRAFT`, quindi la fase non era bloccata. Il planner di ANALYSIS accetta come sorgente un brief o un'intervista. La fase CONCEPT, con il suo giro di domande, non è stata eseguita.

## Artefatti

| File | Contenuto |
|---|---|
| [00_intervista.md](00_intervista.md) | Trascrizione usata come sorgente, più ciò che la fonte non dice |
| [01_business_requirements.md](01_business_requirements.md) | 9 bisogni di business e 5 ruoli |
| [02_functional_requirements.md](02_functional_requirements.md) | 5 aree e 17 requisiti funzionali |
| [03_features.md](03_features.md) | 9 capacità |
| [04_use_cases.md](04_use_cases.md) | 9 casi d'uso |
| [04b_scenarios.md](04b_scenarios.md) | 15 scenari e i passi |
| [04c_non_functional_requirements.md](04c_non_functional_requirements.md) | 4 aree di qualità e 7 requisiti non funzionali |

## Tracciabilità

Bisogno di business (BR) → requisito funzionale (FR), passando dall'area → capacità (Feature) → caso d'uso → scenario.

I requisiti non funzionali non aggiungono funzioni: fissano come il calcolo, l'unicità dell'app e la distinzione tra le uscite devono reggere.

Catena usata nei controlli: ogni FR sta in un'area che punta a BR esistenti; ogni feature punta a BR, FR e ruoli esistenti; ogni caso d'uso punta a feature e FR esistenti; ogni scenario punta a un caso d'uso e a feature esistenti; ogni NFR punta a BR esistenti.

## Stato

Bozza. I punti aperti sono nella sintesi, non sono stati trasformati in requisiti.
