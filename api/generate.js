export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const prompt = `Sei un autore di gialli italiani. Crea un caso murder mystery complesso e ambiguo. Rispondi SOLO con JSON valido senza markdown.

REGOLE FONDAMENTALI:
- Il colpevole (guiltyIndex=1) deve avere UN solo indizio diretto contro di lui, nascosto tra prove fuorvianti
- Gli altri sospettati devono sembrare ALTRETTANTO colpevoli con moventi forti e dettagli sospetti
- Le risposte del colpevole devono sembrare plausibili, non ovviamente evasive
- Almeno una busta deve contenere un falso indizio che punta a un innocente
- Il caso deve essere ambientato in Italia tra 1960-2000, in un contesto insolito (non teatro, non ufficio generico)
- Usa nomi italiani realistici

JSON:
{"id":"CASO #","name":"TITOLO","victim":{"name":"Nome Cognome","age":"XX anni","role":"Professione","cause":"Causa morte specifica","location":"Luogo preciso"},"scene":"Descrizione dettagliata scena 2-3 frasi con dettagli ambigui.","suspects":[{"name":"Nome1","role":"Ruolo1","age":"XX anni","motive":"Movente forte e credibile","alibi":"Alibi parzialmente verificabile","detail":"Dettaglio sospetto ma innocuo","icon":"▣","guilty":false,"questions":[{"q":"Domanda diretta","a":"Risposta credibile ma con piccola incongruenza"},{"q":"Domanda sull alibi","a":"Risposta dettagliata e convincente"},{"q":"Domanda sul movente","a":"Risposta che minimizza ma non nega"}]},{"name":"Nome2","role":"Ruolo2","age":"XX anni","motive":"Movente forte","alibi":"Alibi che non regge all esame attento","detail":"Dettaglio incriminante apparentemente banale","icon":"✎","guilty":true,"questions":[{"q":"Domanda sul movente","a":"Risposta che sembra convincente ma contiene un errore fatale"},{"q":"Domanda sull alibi","a":"Risposta dettagliata con un piccolo elemento impossibile"},{"q":"Domanda sulla vittima","a":"Risposta che rivela conoscenza di un dettaglio che solo il colpevole potrebbe sapere"}]},{"name":"Nome3","role":"Ruolo3","age":"XX anni","motive":"Movente molto forte, quasi più convincente del colpevole","alibi":"Alibi solido ma con finestra temporale sospetta","detail":"Dettaglio che sembra incriminante ma è innocente","icon":"▤","guilty":false,"questions":[{"q":"Domanda sul movente","a":"Risposta aggressiva che sembra nascondere qualcosa"},{"q":"Domanda sul dettaglio sospetto","a":"Spiegazione logica del dettaglio"},{"q":"Domanda sulla vittima","a":"Risposta che rivela un segreto irrilevante al crimine"}]}],"envelopes":[{"id":"e1","title":"Titolo busta 1","icon":"▣","locked":false,"content":"Contenuto che aggiunge ambiguità al caso, non punta direttamente al colpevole.","evidence":{"icon":"⊕","title":"Nome prova","desc":"Descrizione che può essere interpretata in due modi"}},{"id":"e2","title":"Titolo busta 2","icon":"✎","locked":false,"content":"Falso indizio che punta all innocente, creato apposta dal colpevole.","evidence":{"icon":"◉","title":"Nome prova fuorviante","desc":"Prova che sembra accusare un innocente"}},{"id":"e3","title":"Titolo busta 3","icon":"▤","locked":true,"content":"L unico indizio diretto contro il colpevole, nascosto e difficile da trovare.","evidence":{"icon":"▢","title":"Prova chiave","desc":"Dettaglio che inchioda definitivamente il colpevole"}},{"id":"e4","title":"Titolo busta 4","icon":"✚","locked":true,"content":"Contesto che spiega il movente profondo e rivela la pianificazione del crimine.","evidence":{"icon":"⊞","title":"Nome prova","desc":"Descrizione che completa il quadro"}}],"guiltyIndex":1}

Sostituisci tutti i placeholder con contenuto originale italiano. Il caso deve mettere in dubbio il giocatore fino all'ultimo.`;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 2000,
        messages: [{ role: 'user', content: prompt }]
      })
    });

    const data = await response.json();
    if (!response.ok) return res.status(500).json({ error: data });

    let text = data.content.find(b => b.type === 'text')?.text || '';
    text = text.replace(/```json/g, '').replace(/```/g, '').trim();

    const start = text.indexOf('{');
    const end = text.lastIndexOf('}');
    if (start === -1 || end === -1) return res.status(500).json({ error: 'No JSON found' });

    const caseData = JSON.parse(text.slice(start, end + 1));
    if (!caseData.suspects || !caseData.envelopes) return res.status(500).json({ error: 'Invalid structure' });

    res.status(200).json(caseData);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
