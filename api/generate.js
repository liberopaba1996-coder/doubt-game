export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 2000,
        messages: [{
          role: 'user',
          content: `Crea un caso investigativo in italiano per il gioco DOUBT. Rispondi SOLO con JSON valido, nessun testo extra, nessun markdown.

Schema JSON esatto:
{
  "id": "CASO #AI",
  "name": "nome del caso originale",
  "victim": {
    "name": "nome vittima",
    "age": "età anni",
    "role": "professione e contesto",
    "cause": "causa di morte specifica",
    "location": "luogo preciso"
  },
  "scene": "descrizione scena del crimine, 2-3 frasi dettagliate",
  "suspects": [
    {
      "name": "nome",
      "role": "ruolo",
      "age": "età anni",
      "motive": "movente dettagliato",
      "alibi": "alibi dichiarato",
      "detail": "dettaglio incriminante o a discarico",
      "icon": "emoji",
      "guilty": false,
      "questions": [
        {"q": "domanda", "a": "risposta convincente"},
        {"q": "domanda", "a": "risposta convincente"},
        {"q": "domanda", "a": "risposta convincente"}
      ]
    },
    {
      "name": "nome",
      "role": "ruolo",
      "age": "età anni",
      "motive": "movente dettagliato",
      "alibi": "alibi dichiarato",
      "detail": "dettaglio incriminante",
      "icon": "emoji",
      "guilty": true,
      "questions": [
        {"q": "domanda", "a": "risposta evasiva o nervosa"},
        {"q": "domanda", "a": "risposta che si contraddice"},
        {"q": "domanda", "a": "risposta che rivela qualcosa"}
      ]
    },
    {
      "name": "nome",
      "role": "ruolo",
      "age": "età anni",
      "motive": "movente dettagliato",
      "alibi": "alibi dichiarato",
      "detail": "dettaglio a discarico",
      "icon": "emoji",
      "guilty": false,
      "questions": [
        {"q": "domanda", "a": "risposta convincente"},
        {"q": "domanda", "a": "risposta convincente"},
        {"q": "domanda", "a": "risposta convincente"}
      ]
    }
  ],
  "envelopes": [
    {"id":"e1","title":"titolo busta","icon":"📋","locked":false,"content":"contenuto 2-3 frasi","evidence":{"icon":"🔍","title":"nome prova","desc":"descrizione prova"}},
    {"id":"e2","title":"titolo busta","icon":"📝","locked":false,"content":"contenuto 2-3 frasi","evidence":{"icon":"👁️","title":"nome prova","desc":"descrizione prova"}},
    {"id":"e3","title":"titolo busta","icon":"📊","locked":false,"content":"contenuto 2-3 frasi","evidence":{"icon":"📄","title":"nome prova","desc":"descrizione prova"}},
    {"id":"e4","title":"titolo busta","icon":"💊","locked":false,"content":"contenuto 2-3 frasi","evidence":{"icon":"🏪","title":"nome prova","desc":"descrizione prova"}}
  ],
  "guiltyIndex": 1
}

Regole:
- Ambientazione italiana tra 1960-2000, contesto insolito (NON un teatro)
- Le prove devono logicamente puntare al colpevole (guiltyIndex sempre 1)
- Il colpevole ha risposte evasive/nervose nelle domande
- Rendilo avvincente e credibile`
        }]
      })
    });

    const data = await response.json();
    if (!response.ok) return res.status(500).json({ error: data });

    const text = data.content.find(b => b.type === 'text')?.text || '';
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return res.status(500).json({ error: 'No JSON in response' });

    const caseData = JSON.parse(jsonMatch[0]);
    res.status(200).json(caseData);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
