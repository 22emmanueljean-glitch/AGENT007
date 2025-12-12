import nlp from 'compromise';

export async function POST(req) {
  const { text } = await req.json();

  if (!text || text.length < 100) {
    return new Response(
      JSON.stringify({ error: '≥100 chars' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const doc = nlp(text);
  const sentences = doc.sentences().out('array');

  const keep = sentences.slice(0, 3).join('. ') + '.';
  const caption1 = keep.slice(0, 140) + (keep.length > 140 ? '…' : '');
  const caption2 = keep.slice(0, 240);

  return new Response(
    JSON.stringify({
      script: keep,
      captions: [caption1, caption2],
      hashtags: ['#BuildInPublic', '#CreatorTools', '#DominionEngine']
    }),
    { status: 200, headers: { 'Content-Type': 'application/json' } }
  );
}
