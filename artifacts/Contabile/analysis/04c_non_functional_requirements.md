# non_functional_requirements

Fonte: [00_intervista.md](00_intervista.md). Sono solo condizioni di qualità ricavabili dall'intervista. Non ci sono tempi di risposta, uptime, autenticazione o obblighi normativi dichiarati.

## quality_areas

| quality_area_id | quality_area_name | area_description | related_br_ids |
|---|---|---|---|
| <a id="qa-001"></a>QA-001 | Calcolo automatico | I totali che oggi la titolare somma a mano devono uscire dai dati inseriti. | [BR-003](01_business_requirements.md#br-003); [BR-007](01_business_requirements.md#br-007); [BR-008](01_business_requirements.md#br-008); [BR-009](01_business_requirements.md#br-009) |
| <a id="qa-002"></a>QA-002 | Stesso criterio tra settimana e mese | La rendicontazione mensile non introduce una seconda regola di chiusura. | [BR-007](01_business_requirements.md#br-007); [BR-008](01_business_requirements.md#br-008) |
| <a id="qa-003"></a>QA-003 | Unicità dell'applicazione | Inserimento e lettura dei totali stanno in una sola app. | [BR-009](01_business_requirements.md#br-009) |
| <a id="qa-004"></a>QA-004 | Tracciabilità delle uscite | Fatture e merce senza fattura restano riconoscibili e non si confondono. | [BR-004](01_business_requirements.md#br-004); [BR-005](01_business_requirements.md#br-005); [BR-006](01_business_requirements.md#br-006) |

## requirement_catalog

| nfr_id | quality_area_id | requirement_name | target_or_condition | applies_when | rationale |
|---|---|---|---|---|---|
| <a id="nfr-001"></a>NFR-001 | [QA-001](#qa-001) | Totali senza chiusura manuale | Dato un insieme di chiusure giornaliere e di uscite inserite, il totale di giorno, settimana e mese è prodotto dall'applicazione. La titolare non deve risommare gli stessi importi fuori dall'app. | Consultazione della dashboard e delle chiusure di periodo | La cliente oggi fa la chiusura settimanale a mano. Traccia [BR-007](01_business_requirements.md#br-007) e [BR-009](01_business_requirements.md#br-009). |
| <a id="nfr-002"></a>NFR-002 | [QA-001](#qa-001) | Formula del totale giornaliero | Per ogni giorno registrato, il totale incassato finale mostrato è uguale al totale della chiusura più la voce Non Registrato di quel giorno. | Ogni chiusura giornaliera completa | È la definizione di totale data dalla cliente. Traccia [BR-003](01_business_requirements.md#br-003). |
| <a id="nfr-003"></a>NFR-003 | [QA-002](#qa-002) | Criterio unico di periodo | La rendicontazione di un mese usa la stessa regola della chiusura di una settimana: somma degli incassi giornalieri del periodo meno uscite effettive del periodo. Una fattura non pagata non riduce né la settimana né il mese finché non risulta pagata. | Confronto tra un totale settimanale e il totale del mese che contiene quella settimana | La cliente chiede esplicitamente lo stesso criterio. Traccia [BR-007](01_business_requirements.md#br-007) e [BR-008](01_business_requirements.md#br-008). |
| <a id="nfr-004"></a>NFR-004 | [QA-003](#qa-003) | Una sola applicazione | Inserire una chiusura di cassa, inserire un'uscita e leggere i totali non richiede un secondo strumento. | Uso ordinario della titolare | È la richiesta di «app unica». Traccia [BR-009](01_business_requirements.md#br-009). |
| <a id="nfr-005"></a>NFR-005 | [QA-004](#qa-004) | Fattura riconducibile | Ogni fornitura con fattura resta consultabile con numero fattura, data e importo, e con l'indicazione se è pagata subito allo scarico oppure a 15, 30 o 60 giorni. | Verifica di una fornitura dopo la registrazione | Sono i dati che la cliente annota oggi. Traccia [BR-004](01_business_requirements.md#br-004). |
| <a id="nfr-006"></a>NFR-006 | [QA-004](#qa-004) | Merce senza fattura distinta e non rinviabile | Una voce di merce senza fattura non è presentata come fattura fornitore e risulta pagata subito, senza un termine a 15, 30 o 60 giorni. | Registrazione di un acquisto senza fattura, per esempio al mercato | La cliente tiene traccia di queste voci proprio perché sono diverse dalle fatture. Traccia [BR-005](01_business_requirements.md#br-005). |
| <a id="nfr-007"></a>NFR-007 | [QA-004](#qa-004) | Quattro costi persone distinti | F24 del titolare, contributi del collaboratore, costo della busta paga e ritenuta d'acconto dell'occasionale restano quattro uscite distinguibili. | Registrazione e rilettura di un costo del personale | La cliente li descrive come quattro casi diversi. Traccia [BR-006](01_business_requirements.md#br-006). |
