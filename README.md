# Pokémon Champions Manager

Applicazione Angular 22 mobile-first per Box, team competitivi, squadre Firestore e recruitment.

## Avvio

1. Requisiti: Node.js 22+, npm 10+.
2. `npm install`
3. Copia la configurazione Web Firebase in `src/environments/environment.ts`.
4. In Firebase abilita **Anonymous Authentication** e crea Firestore.
5. `npm start`

Senza credenziali Firebase l'app resta completamente utilizzabile con localStorage. Per il cloud, pubblica le regole con `firebase deploy --only firestore`.

## Qualità

- `npm run lint`
- `npm run format:check`
- `npm run build`
- `npm run check`

## Vercel

Importa il repository in Vercel. `vercel.json` configura build, output SPA e fallback del router. Nessun segreto Firebase è incluso: sostituisci i placeholder prima del deploy. Le chiavi Web Firebase identificano il progetto ma la sicurezza effettiva è garantita da Authentication e `firestore.rules`.

## Dati e scoring

Il catalogo completo, incluse forme alternate esposte come record Pokémon, viene caricato da PokéAPI e memorizzato nella sessione Angular. Le 14 valutazioni richieste sono curate nella knowledge base. Per gli altri record l'app mostra una stima preliminare derivata dalle statistiche base, chiaramente segnalata nella UI; non è un ranking ufficiale di Pokémon Champions.
