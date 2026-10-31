# Piano di regressione

Cassa di Pasta & Paste. Due accessi, un solo libro. I totali non sono salvati: si ricalcolano dalle chiusure e dalle uscite pagate.

Esegui questo piano in locale, dentro una sessione già aperta, sul server di sviluppo del repository (la root, non `mockup/`). La data di riferimento è oggi in Europe/Rome. Non si va oltre oggi.

Dopo ogni intervento aggiorna le suite il cui comportamento è cambiato. Non aggiungere controlli per funzioni che non esistono.

## Pulizia

- Una riga di prova ha un numero fattura riconoscibile, per esempio `TEST-REGRESSIONE`, importo piccolo, data di oggi.
- Una chiusura di prova si fa solo su un giorno che non ha già una chiusura. Se oggi è vuoto, usa oggi. Salva, controlla, elimina.
- Prima di chiudere il giro, la riga di prova non compare più in Uscite né nel resoconto, e il giorno di prova non compare tra i giorni del mese.
- Annota i totali di mese e settimana prima della prova e confrontali dopo la cancellazione. Devono tornare uguali.

## Fumo

Da fare a ogni intervento, anche solo visivo.

- Oggi, Cassa, Uscite e Resoconto si aprono e la sezione attiva è segnata.
- I quattro totali visibili restano coerenti tra loro: il risultato di Oggi per settimana e mese coincide con il Resoconto dello stesso periodo.
- Il resoconto mese mostra le tre righe di incasso (contante da chiusura, pagamenti elettronici, contante non registrato), poi Incassi, Uscite pagate, Totale.
- Le fatture aperte compaiono in elenco e non entrano nel totale.
- Su telefono la barra in basso non copre l'ultimo controllo. Su desktop la navigazione è a sinistra.
- Non parte nessuno scroll orizzontale della pagina.

## Accesso

- In locale la scelta dell'indirizzo include anche l'indirizzo di prova. Fuori da development quell'indirizzo non è in elenco, ma resta abilitato.
- Un indirizzo fuori elenco non entra.
- Non inviare un link solo per provare questa suite se il tetto orario è già stato usato.

## Cassa

- Un giorno vuoto dice che la chiusura non c'è. Salvando Contanti, Elettronici e contante fisico, il giorno risulta già salvato.
- Non Registrato è contante fisico meno contanti. Può essere negativo. Il totale del giorno è chiusura più Non Registrato.
- Riaprire il giorno mostra gli importi salvati. Un secondo salvataggio corregge la stessa data, non ne crea un'altra.
- Elimina chiusura chiede conferma. Dopo, i campi sono vuoti e il giorno si può salvare di nuovo.
- Il giorno successivo a oggi è disabilitato.

## Uscite

- Nuova uscita: senza importo, senza data, o senza numero se è una fattura, il salvataggio si ferma e dice quale campo manca.
- Una fattura da pagare non entra nel resoconto. Paga fattura la segna pagata oggi e da quel momento entra nel periodo di oggi.
- Modifica cambia importo, consegna, numero, stato e tipo di pagamento. Togliere Pagato la toglie dai totali pagati.
- Elimina chiede conferma. La riga sparisce dall'elenco e dal resoconto.
- Le uscite che non sono fatture stanno nella stessa lista e hanno le stesse azioni.
- I tipi di pagamento restano, in quest'ordine: allo scarico, 7, 10, 15, 30 giorni.

## Resoconto

- Settimana, mese e anno si aprono. Il periodo successivo a quello che contiene oggi è disabilitato. Torna a oggi riporta al periodo corrente.
- La settimana è lunedì-domenica.
- Nel mese e nell'anno, Incassi è la somma delle tre righe. Totale è Incassi meno Uscite pagate.
- Un pagamento entra nel periodo della data di pagamento, non della consegna.
- Scarica PDF apre la stampa del browser. In quella vista non si vedono navigazione, schede e il pulsante.

## Dopo una modifica ai calcoli

Oltre alla suite toccata, rileggi mese e settimana e confronta almeno un giorno noto: il suo importo in elenco è il totale del giorno, e la somma delle tre righe di incasso del periodo coincide con Incassi.
