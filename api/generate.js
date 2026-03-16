export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const prompt = `Crea un caso murder mystery italiano anni 1960-2000. Rispondi SOLO con JSON, niente altro.

{"id":"CASO #","name":"TITOLO CASO","victim":{"name":"Nome Vittima","age":"55 anni","role":"Professione","cause":"Causa morte","location":"Luogo, Citta"},"scene":"Descrizione scena crimine in 2 frasi. Dettagli ambigui.","suspects":[{"name":"Mario Rossi","role":"Socio in affari","age":"48 anni","motive":"Movente forte credibile","alibi":"Alibi con piccola falla","detail":"Dettaglio sospetto ma innocuo","icon":"▣","guilty":false,"questions":[{"q":"Dove era la sera del delitto?","a":"Risposta convincente con dettagli"},{"q":"Che rapporto aveva con la vittima?","a":"Risposta che minimizza tensioni reali"},{"q":"Sa spiegare questo dettaglio?","a":"Spiegazione logica"}]},{"name":"Anna Ferrari","role":"Amante segreta","age":"35 anni","motive":"Movente molto forte","alibi":"Alibi che sembra solido ma ha un errore fatale","detail":"Dettaglio incriminante che sembra banale","icon":"✎","guilty":true,"questions":[{"q":"Dove era la sera del delitto?","a":"Risposta apparentemente convincente ma con contraddizione"},{"q":"Qual era il suo rapporto con la vittima?","a":"Nega cio che sa gia la polizia"},{"q":"Come spiega questa prova?","a":"Risposta nervosa che rivela troppo"}]},{"name":"Giuseppe Conti","role":"Rivale storico","age":"52 anni","motive":"Movente antichissimo molto credibile","alibi":"Alibi solido ma con finestra sospetta","detail":"Elemento che lo fa sembrare il colpevole principale","icon":"▤","guilty":false,"questions":[{"q":"Dove era la sera del delitto?","a":"Risposta aggressiva che nasconde qualcosa di innocente"},{"q":"Perche odiava la vittima?","a":"Ammette odio ma spiega perche non avrebbe ucciso"},{"q":"Cosa sa di questa prova?","a":"Svela un segreto irrilevante al crimine"}]}],"envelopes":[{"id":"e1","title":"Rapporto medico","icon":"▣","locked":false,"content":"Dettagli della morte che possono essere interpretati in due modi diversi.","evidence":{"icon":"⊕","title":"Referto medico","desc":"Elemento ambiguo che non punta a nessuno in particolare"}},{"id":"e2","title":"Testimonianza anonima","icon":"✎","locked":false,"content":"Testimonianza che sembra accusare il sospettato innocente, creata dal vero colpevole.","evidence":{"icon":"◉","title":"Lettera anonima","desc":"Prova costruita per depistare le indagini"}},{"id":"e3","title":"Documento riservato","icon":"▤","locked":true,"content":"La prova nascosta che collega definitivamente il colpevole al crimine.","evidence":{"icon":"▢","title":"Prova chiave","desc":"Elemento che solo il colpevole poteva conoscere"}},{"id":"e4","title":"Movente segreto","icon":"✚","locked":true,"content":"Il vero movente, molto piu profondo di quanto sembri. Rivela la pianificazione.","evidence":{"icon":"⊞","title":"Documento segreto","desc":"Prova della premeditazione"}}],"guiltyIndex":1}

Regole: ambientazione italiana reale (non teatro), nomi italiani, il caso deve essere difficile da risolvere, gli innocenti devono sembrare colpevoli quanto il vero assassino.`;

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
        max_tokens: 2500,
        messages: [{ role: 'user', content: prompt }]
      })
    });

    const data = await response.json();
    if (!response.ok) return res.status(500).json({ error: data });

    let text = data.content.find(b => b.type === 'text')?.text || '';
    text = text.replace(/```json/g, '').replace(/```/g, '').trim();

    const start = text.indexOf('{');
    const end = text.lastIndexOf('}');
    if (start === -1 || end === -1) return res.status(500).json({ error: 'No JSON found', raw: text.slice(0,200) });

    const caseData = JSON.parse(text.slice(start, end + 1));
    if (!caseData.suspects || !caseData.envelopes) return res.status(500).json({ error: 'Invalid structure' });

    res.status(200).json(caseData);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
