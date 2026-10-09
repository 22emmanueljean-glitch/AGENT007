import nlp from 'compromise';
import { generateRevenueArtifact } from '../../../lib/revenue-artifact.js';

const json=(body,status=200)=>new Response(JSON.stringify(body),{status,headers:{'Content-Type':'application/json'}});

export async function POST(req) {
  const body=await req.json();
  const text=typeof body?.text==='string'?body.text.trim():'';

  if (!text || text.length < 100) return json({ error: '≥100 chars' },400);

  if(body?.caseData && typeof body.caseData==='object'){
    const artifact=generateRevenueArtifact({artifactType:body.artifactType,caseData:body.caseData});
    return json({
      artifact,
      script:artifact.script,
      captions:artifact.captions,
      hashtags:artifact.hashtags,
      evidence:artifact.evidenceClass
    });
  }

  const doc = nlp(text);
  const sentences = doc.sentences().out('array');
  const keep = sentences
    .slice(0, 3)
    .map(s => s.replace(/\.+$/, '').trim())
    .join('. ') + '.';

  const caption1 = keep.slice(0, 140) + (keep.length > 140 ? '…' : '');
  const caption2 = keep.slice(0, 240);

  return json({
    script: keep,
    captions: [caption1, caption2],
    hashtags: ['#BuildInPublic', '#CreatorTools', '#DominionEngine']
  });
}
