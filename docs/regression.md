# Regressione

`npm test` esegue `tests/regression.test.mts`. Non scrive sul database, non invia email, non ha bisogno di una sessione. Copre le regole della cassa. Si rilancia a ogni intervento, e si aggiorna nello stesso intervento se una regola cambia.

Il giro in browser resta per quello che il test non vede: una schermata si apre, la sezione attiva è quella giusta, Elimina chiede conferma, Scarica PDF apre la stampa senza navigazione. Si fa solo se l'intervento tocca quella schermata. Una riga di prova si chiama `TEST-REGRESSIONE`, si cancella prima di chiudere, e i totali di settimana e mese tornano quelli di partenza.

## Cosa asserisce la suite

Accesso. I due indirizzi sono abilitati, gli altri no. In development compaiono entrambi nella scelta, fuori si vede solo il titolare. L'indirizzo di prova resta comunque autorizzato. Gli errori del link hanno il testo giusto, compreso il tetto di 2 email all'ora. Lo schema condivide le righe fra i due accessi e consente modifica e cancellazione.

Cassa. Non Registrato è contante fisico meno contanti, anche negativo. Il totale del giorno è chiusura più Non Registrato. Lo zero è un importo valido. Una data ha una sola chiusura, e un nuovo salvataggio la corregge. Il giorno è quello di Roma.

Uscite. Gli otto tipi passano. L'ordine dei pagamenti è allo scarico, 7, 10, 15, 30. Importo zero o non intero, consegna futura, fattura senza numero, pagamento prima della consegna o dopo oggi: il salvataggio rifiuta. Le uscite che non sono fatture non tengono il numero. Segnare pagata una riga nuova la mette a oggi. Se era già pagata in una data ancora valida, quella data resta. Togliere Pagato la toglie dai totali. Paga fattura agisce solo su una riga ancora aperta, con consegna non successiva al pagamento.

Resoconto. La settimana è lunedì-domenica. Mese e anno sono civili. Non si avanza oltre il periodo che contiene oggi. Incassi è la somma di contante, elettronici e non registrato. Il totale è incassi meno uscite pagate. Un pagamento conta nella data di pagamento, non in quella di consegna. Le fatture aperte con consegna entro la fine del periodo restano in elenco e non si sottraggono. Le altre uscite aperte non stanno in quell'elenco. Togliere una chiusura o un pagamento ricalcola il periodo. L'anno salta i mesi vuoti. La stampa nasconde navigazione, schede e il pulsante.
