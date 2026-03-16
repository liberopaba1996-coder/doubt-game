export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
 
  const prompt = `Sei un generatore di casi investigativi italiani. Rispondi SOLO con un oggetto JSON, senza markdown, senza backtick, senza testo prima o dopo.
 
Genera un caso murder mystery italiano ambientato tra 1960-2000 in un contesto insolito (non un teatro). Il colpevole e' sempre il sospettato all'indice 1 dell'array.
 
JSON da restituire:
{"id":"CASO #AI","name":"TITOLO CASO","victim":{"name":"Nome Cognome","age":"50 anni","role":"Professione","cause":"Causa morte","location":"Luogo"},"scene":"Descrizione scena 2 frasi.","suspects":[{"name":"Nome1","role":"Ruolo1","age":"45 anni","motive":"Movente1","alibi":"Alibi1","detail":"Dettaglio1","icon":"👔","guilty":false,"questions":[{"q":"Domanda1","a":"Risposta1"},{"q":"Domanda2","a":"Risposta2"},{"q":"Domanda3","a":"Risposta3"}]},{"name":"Nome2","role":"Ruolo2","age":"38 anni","motive":"Movente2","alibi":"Alibi2","detail":"Dettaglio incriminante","icon":"💼","guilty":true,"questions":[{"q":"Domanda1","a":"Risposta evasiva1"},{"q":"Domanda2","a":"Risposta nervosa2"},{"q":"Domanda3","a":"Si contraddice3"}]},{"name":"Nome3","role":"Ruolo3","age":"52 anni","motive":"Movente3","alibi":"Alibi3","detail":"Dettaglio3","icon":"🎭","guilty":false,"questions":[{"q":"Domanda1","a":"Risposta1"},{"q":"Domanda2","a":"Risposta2"},{"q":"Domanda3","a":"Risposta3"}]}],"envelopes":[{"id":"e1","title":"Titolo1","icon":"📋","locked":false,"content":"Contenuto busta 1.","evidence":{"icon":"🔍","title":"Prova1","desc":"Desc prova1"}},{"id":"e2","title":"Titolo2","icon":"📝","locked":false,"content":"Contenuto busta 2.","evidence":{"icon":"👁️","title":"Prova2","desc":"Desc prova2"}},{"id":"e3","title":"Titolo3","icon":"📊","locked":false,"content":"Contenuto busta 3.","evidence":{"icon":"📄","title":"Prova3","desc":"Desc prova3"}},{"id":"e4","title":"Titolo4","icon":"💊","locked":false,"content":"Contenuto busta 4.","evidence":{"icon":"🏪","title":"Prova4","desc":"Desc prova4"}}],"guiltyIndex":1}
 
Sostituisci tutti i valori placeholder con contenuto originale italiano coerente. Le prove devono puntare al colpevole (indice 1). Rispondi SOLO con il JSON.`;
 
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
 
