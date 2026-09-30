# scenario_catalog

Fonte: [00_intervista.md](00_intervista.md), [02_functional_requirements.md](02_functional_requirements.md), [03_features.md](03_features.md), [04_use_cases.md](04_use_cases.md).

## scenarios

| scenario_id | uc_id | scenario_name | scenario_type | related_feature_ids | trigger | expected_outcome | exception_notes |
|---|---|---|---|---|---|---|---|
| <a id="scn-001"></a>SCN-001 | [UC-001](04_use_cases.md#uc-001) | Chiusura del giorno con Contanti, elettronici e Non Registrato | Main | [FEAT-001](03_features.md#feat-001); [FEAT-002](03_features.md#feat-002) | Chiusura di cassa della giornata disponibile | Totale incassato finale = totale della chiusura + Non Registrato | Non Registrato usa il contante registrato dalla chiusura, non il totale comprensivo dei Pagamenti Elettronici |
| <a id="scn-002"></a>SCN-002 | [UC-002](04_use_cases.md#uc-002) | Fornitura pagata allo scarico | Main | [FEAT-003](03_features.md#feat-003) | Fornitore con merce e fattura, pagamento immediato | Fattura tracciata e uscita effettiva nel periodo dello scarico | — |
| <a id="scn-003"></a>SCN-003 | [UC-002](04_use_cases.md#uc-002) | Fornitura da pagare a 15, 30 o 60 giorni | Alternate | [FEAT-003](03_features.md#feat-003) | Fornitore con merce e fattura, pagamento differito | Fattura tracciata e non ancora uscita effettiva | Finché non è pagata non si sottrae dalla settimana corrente |
| <a id="scn-004"></a>SCN-004 | [UC-003](04_use_cases.md#uc-003) | Merce senza fattura pagata subito | Main | [FEAT-004](03_features.md#feat-004) | Merce senza fattura, per esempio dal mercato | Voce tracciata come spesa pagata subito, senza rinvio | Non si applicano i termini 15/30/60, riservati alla fattura |
| <a id="scn-005"></a>SCN-005 | [UC-004](04_use_cases.md#uc-004) | Caricare una bolletta utenze | Main | [FEAT-005](03_features.md#feat-005) | La titolare registra una bolletta | La bolletta è un'uscita | La fonte non descrive un pagamento differito per le bollette |
| <a id="scn-006"></a>SCN-006 | [UC-004](04_use_cases.md#uc-004) | Caricare l'affitto | Alternate | [FEAT-005](03_features.md#feat-005) | La titolare registra l'affitto | L'affitto è un'uscita | La fonte non descrive un pagamento differito per l'affitto |
| <a id="scn-007"></a>SCN-007 | [UC-005](04_use_cases.md#uc-005) | Segnare l'F24 del titolare | Main | [FEAT-006](03_features.md#feat-006) | La titolare registra l'F24 proprio | L'F24 è un'uscita del titolare non dipendente effettivo | Non va classificata come busta paga |
| <a id="scn-008"></a>SCN-008 | [UC-005](04_use_cases.md#uc-005) | Caricare i contributi del collaboratore | Alternate | [FEAT-006](03_features.md#feat-006) | La titolare registra i contributi del contratto di collaborazione | I contributi sono un'uscita distinta | Riferiti al dipendente in collaborazione, non all'F24 del titolare |
| <a id="scn-009"></a>SCN-009 | [UC-005](04_use_cases.md#uc-005) | Segnare il costo della busta paga | Alternate | [FEAT-006](03_features.md#feat-006) | La titolare registra il dipendente con busta paga regolare | Il costo di busta paga è un'uscita | La fonte dice «tutto» e non elenca le voci: lo scenario non ne aggiunge |
| <a id="scn-010"></a>SCN-010 | [UC-005](04_use_cases.md#uc-005) | Segnare la ritenuta d'acconto | Alternate | [FEAT-006](03_features.md#feat-006) | La titolare registra il pagamento dell'occasionale | La ritenuta d'acconto è un'uscita | Riferita al dipendente occasionale |
| <a id="scn-011"></a>SCN-011 | [UC-006](04_use_cases.md#uc-006) | Pagare una fattura già registrata | Main | [FEAT-003](03_features.md#feat-003); [FEAT-007](03_features.md#feat-007) | La fattura a 15, 30 o 60 giorni viene pagata | L'importo diventa uscita effettiva della settimana di pagamento | Non era stato sottratto nelle settimane in cui risultava non pagata |
| <a id="scn-012"></a>SCN-012 | [UC-007](04_use_cases.md#uc-007) | Chiudere la settimana | Main | [FEAT-007](03_features.md#feat-007); [FEAT-009](03_features.md#feat-009) | La titolare chiede la chiusura settimanale | Totale = somma incassi giornalieri − uscite effettive della settimana | Sostituisce la chiusura manuale |
| <a id="scn-013"></a>SCN-013 | [UC-007](04_use_cases.md#uc-007) | Settimana con fatture ancora non pagate | Alternate | [FEAT-003](03_features.md#feat-003); [FEAT-007](03_features.md#feat-007) | Nella settimana ci sono fatture registrate e non pagate | Quelle fatture non riducono il totale della settimana | Si sottrarranno nella settimana del pagamento |
| <a id="scn-014"></a>SCN-014 | [UC-008](04_use_cases.md#uc-008) | Rendicontare il mese | Main | [FEAT-008](03_features.md#feat-008); [FEAT-009](03_features.md#feat-009) | La titolare chiede la rendicontazione mensile | Totale mensile con lo stesso criterio della settimana | Le fatture non pagate si sottraggono nel mese in cui vengono pagate |
| <a id="scn-015"></a>SCN-015 | [UC-009](04_use_cases.md#uc-009) | Leggere i totali in dashboard | Main | [FEAT-009](03_features.md#feat-009) | La titolare consulta i totali nell'app | I totali mostrati sono calcolati dai dati di chiusure e uscite inseriti | L'inserimento e la dashboard stanno nella stessa app |

## scenario_steps

| scenario_id | step_id | step_order | actor_id | action | system_response |
|---|---|---|---|---|---|
| [SCN-001](#scn-001) | STEP-001 | 1 | [role-001](01_business_requirements.md#role-001) | Annota il totale della chiusura di cassa, il dettaglio Contanti e il dettaglio Pagamenti Elettronici | Registra la chiusura del giorno con i due dettagli |
| [SCN-001](#scn-001) | STEP-002 | 2 | [role-001](01_business_requirements.md#role-001) | Segna Non Registrato come contante in cassa meno contante registrato dalla chiusura | Registra la voce Non Registrato |
| [SCN-001](#scn-001) | STEP-003 | 3 | System | Calcola il totale incassato finale | Totale incassato finale = totale della chiusura + Non Registrato |
| [SCN-002](#scn-002) | STEP-004 | 1 | [role-002](01_business_requirements.md#role-002) | Consegna merce e fattura | — |
| [SCN-002](#scn-002) | STEP-005 | 2 | [role-001](01_business_requirements.md#role-001) | Accetta la merce e registra numero fattura, data e importo | Crea la fornitura con fattura |
| [SCN-002](#scn-002) | STEP-006 | 3 | [role-001](01_business_requirements.md#role-001) | Indica il pagamento subito, allo scarico della merce | Marca l'importo come uscita effettiva del periodo in cui avviene lo scarico |
| [SCN-003](#scn-003) | STEP-007 | 1 | [role-002](01_business_requirements.md#role-002) | Consegna merce e fattura | — |
| [SCN-003](#scn-003) | STEP-008 | 2 | [role-001](01_business_requirements.md#role-001) | Accetta la merce e registra numero fattura, data e importo | Crea la fornitura con fattura |
| [SCN-003](#scn-003) | STEP-009 | 3 | [role-001](01_business_requirements.md#role-001) | Indica il pagamento a 15, 30 o 60 giorni | Conserva la fattura come non pagata e non la sottrae dalle uscite effettive correnti |
| [SCN-004](#scn-004) | STEP-010 | 1 | [role-001](01_business_requirements.md#role-001) | Registra la voce di merce senza fattura e l'importo | Distingue la voce da una fornitura con fattura |
| [SCN-004](#scn-004) | STEP-011 | 2 | System | Applica il pagamento immediato, senza rinvio | Considera l'importo un'uscita effettiva del momento del pagamento e non propone i termini 15/30/60 |
| [SCN-005](#scn-005) | STEP-012 | 1 | [role-001](01_business_requirements.md#role-001) | Carica una bolletta delle utenze tra le uscite | Registra la bolletta come uscita |
| [SCN-005](#scn-005) | STEP-013 | 2 | System | Rende la bolletta disponibile per i totali di periodo | La bolletta si sottrae nel periodo in cui è un'uscita effettiva |
| [SCN-006](#scn-006) | STEP-014 | 1 | [role-001](01_business_requirements.md#role-001) | Carica l'affitto tra le uscite | Registra l'affitto come uscita |
| [SCN-006](#scn-006) | STEP-015 | 2 | System | Rende l'affitto disponibile per i totali di periodo | L'affitto si sottrae nel periodo in cui è un'uscita effettiva |
| [SCN-007](#scn-007) | STEP-016 | 1 | [role-001](01_business_requirements.md#role-001) | Segna l'F24 del titolare | Registra un'uscita F24, non una busta paga |
| [SCN-007](#scn-007) | STEP-017 | 2 | System | Include l'F24 tra le uscite | L'importo si sottrae nel periodo in cui è un'uscita effettiva |
| [SCN-008](#scn-008) | STEP-018 | 1 | [role-001](01_business_requirements.md#role-001) | Carica i contributi del dipendente con contratto di collaborazione | Registra un'uscita contributi collegata a quel rapporto |
| [SCN-008](#scn-008) | STEP-019 | 2 | System | Include i contributi tra le uscite | L'importo si sottrae nel periodo in cui è un'uscita effettiva |
| [SCN-009](#scn-009) | STEP-020 | 1 | [role-001](01_business_requirements.md#role-001) | Segna il costo del dipendente con busta paga regolare | Registra l'uscita di busta paga con ciò che la titolare indica, senza voci aggiunte dalla fonte |
| [SCN-009](#scn-009) | STEP-021 | 2 | System | Include il costo tra le uscite | L'importo si sottrae nel periodo in cui è un'uscita effettiva |
| [SCN-010](#scn-010) | STEP-022 | 1 | [role-001](01_business_requirements.md#role-001) | Segna il pagamento del dipendente occasionale in ritenuta d'acconto | Registra un'uscita di ritenuta d'acconto |
| [SCN-010](#scn-010) | STEP-023 | 2 | System | Include la ritenuta tra le uscite | L'importo si sottrae nel periodo in cui è un'uscita effettiva |
| [SCN-011](#scn-011) | STEP-024 | 1 | [role-001](01_business_requirements.md#role-001) | Registra il pagamento della fattura che era a 15, 30 o 60 giorni | Segna la fattura come pagata nella data del pagamento |
| [SCN-011](#scn-011) | STEP-025 | 2 | System | Imputa l'importo alla settimana del pagamento | Sottrae l'importo da quella settimana e non dalle settimane precedenti |
| [SCN-012](#scn-012) | STEP-026 | 1 | [role-001](01_business_requirements.md#role-001) | Chiede la chiusura della settimana | Apre il totale settimanale calcolato |
| [SCN-012](#scn-012) | STEP-027 | 2 | System | Somma gli incassi giornalieri della settimana | Ottiene il totale incassato del periodo |
| [SCN-012](#scn-012) | STEP-028 | 3 | System | Sottrae le uscite effettive della settimana | Presenta chiusura = incassi − uscite effettive |
| [SCN-013](#scn-013) | STEP-029 | 1 | System | Rileva fatture registrate nella settimana e ancora non pagate | Le esclude dalle uscite effettive |
| [SCN-013](#scn-013) | STEP-030 | 2 | System | Calcola la chiusura senza quelle fatture | Il totale di settimana non ne è ridotto; l'importo resterà da sottrarre nella settimana del pagamento |
| [SCN-014](#scn-014) | STEP-031 | 1 | [role-001](01_business_requirements.md#role-001) | Chiede la rendicontazione del mese | Apre il totale mensile calcolato |
| [SCN-014](#scn-014) | STEP-032 | 2 | System | Somma gli incassi giornalieri del mese e sottrae le uscite effettive del mese | Presenta il mese con lo stesso criterio della settimana, fatture non pagate escluse fino al pagamento |
| [SCN-015](#scn-015) | STEP-033 | 1 | [role-001](01_business_requirements.md#role-001) | Apre la dashboard nella stessa app in cui inserisce i dati | Mostra i totali |
| [SCN-015](#scn-015) | STEP-034 | 2 | System | Ricalcola i totali dalle chiusure giornaliere e dalle uscite inserite | I totali visibili non richiedono una somma manuale |
