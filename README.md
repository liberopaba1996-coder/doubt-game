# DOUBT — Giochi Investigativi

## Deploy su Vercel

### 1. Installa Vercel CLI
```
npm install -g vercel
```

### 2. Carica il progetto
```
cd doubt-game
vercel
```
Segui le istruzioni: scegli un nome progetto (es. `doubt-game`), conferma tutto.

### 3. Aggiungi la API Key
Vai su https://vercel.com → il tuo progetto → **Settings** → **Environment Variables**

Aggiungi:
- **Name:** `ANTHROPIC_API_KEY`
- **Value:** la tua API key (quella nuova che hai creato)
- **Environment:** Production, Preview, Development

### 4. Rideploy
```
vercel --prod
```

### 5. Condividi
Il link sarà tipo: `https://doubt-game.vercel.app`
Chiunque può aprirlo da telefono o PC senza installare nulla.

## Struttura
```
doubt-game/
├── api/
│   └── generate.js     ← backend sicuro che chiama Anthropic
├── public/
│   └── index.html      ← il gioco completo
└── vercel.json         ← configurazione Vercel
```
