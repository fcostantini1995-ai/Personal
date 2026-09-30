# business_analysis

Fonte: [00_intervista.md](00_intervista.md). Requisiti di business soltanto: esiti e bisogni, non comportamento di sistema.

## business_requirements

| br_id | br_name | br_description | stakeholder_list |
|---|---|---|---|
| <a id="br-001"></a>BR-001 | Incassi giornalieri da chiusura di cassa | Ogni giorno la titolare deve poter annotare il totale incassato dalla chiusura di cassa, con il dettaglio di quanto è in Contanti e quanto è in Pagamenti Elettronici. | Titolare |
| <a id="br-002"></a>BR-002 | Voce di incasso Non Registrato | La titolare deve poter segnare una voce di incasso chiamata Non Registrato, pari al contante in cassa meno il contante registrato dalla chiusura di cassa. | Titolare |
| <a id="br-003"></a>BR-003 | Totale incassato finale del giorno | Il totale incassato finale del giorno è il totale della chiusura di cassa più la voce Non Registrato. | Titolare |
| <a id="br-004"></a>BR-004 | Forniture con fattura | Quando arriva un fornitore con merce e fattura, la titolare accetta la merce e paga subito allo scarico oppure a 15, 30 o 60 giorni, registrando numero fattura, data e importo. | Titolare; Fornitore |
| <a id="br-005"></a>BR-005 | Merce senza fattura | La titolare tiene traccia anche della merce senza fattura, per esempio presa al mercato. Questo tipo di spesa si paga subito, senza rinvii. | Titolare |
| <a id="br-006"></a>BR-006 | Utenze, affitto e costo del personale | Tra le uscite rientrano le bollette (utenze), l'affitto e il costo delle persone indicate: F24 del titolare non dipendente effettivo; contributi del dipendente con contratto di collaborazione; tutto ciò che va segnato per il dipendente con busta paga regolare; ritenuta d'acconto del dipendente occasionale. | Titolare; Dipendente in collaborazione; Dipendente con busta paga; Dipendente occasionale |
| <a id="br-007"></a>BR-007 | Chiusura settimanale sulle uscite effettive | La chiusura settimanale somma tutti gli incassi giornalieri e sottrae le spese che sono uscite effettive del periodo. Le fatture non pagate si sottraggono nel totale della settimana in cui vengono pagate. | Titolare |
| <a id="br-008"></a>BR-008 | Rendicontazione mensile con lo stesso criterio | La rendicontazione mensile usa lo stesso criterio della chiusura settimanale. | Titolare |
| <a id="br-009"></a>BR-009 | Unica app e totali senza chiusura manuale | La titolare vuole un'unica app in cui inserire chiusure giornaliere e uscite, e vedere i totali calcolati in automatico in una dashboard, al posto della chiusura settimanale fatta a mano. | Titolare |

## list_of_roles

| role_id | role_name | role_description |
|---|---|---|
| <a id="role-001"></a>role-001 | Titolare | Persona che annota chiusure di cassa e uscite e che oggi fa la chiusura settimanale manuale. Non è un dipendente effettivo: per sé deve segnare l'F24. È l'unica persona che, nella fonte, inserisce i dati. |
| <a id="role-002"></a>role-002 | Fornitore | Soggetto che arriva con merce e, quando c'è, con fattura. Non risulta utilizzatore dell'app. |
| <a id="role-003"></a>role-003 | Dipendente in collaborazione | Dipendente con contratto di collaborazione, per il quale la titolare deve poter caricare i contributi. Non risulta utilizzatore dell'app. |
| <a id="role-004"></a>role-004 | Dipendente con busta paga | Dipendente con busta paga regolare, per il quale la titolare deve segnare tutto. Non risulta utilizzatore dell'app. |
| <a id="role-005"></a>role-005 | Dipendente occasionale | Dipendente occasionale pagato in ritenuta d'acconto. Non risulta utilizzatore dell'app. |
