import test from 'node:test';
import assert from 'node:assert/strict';
import { POST } from '../app/api/shortify/route.js';

const caseData={
  company:'Northstar Systems',offer:'enterprise revenue platform',buyerPersona:'CRO',icp:'B2B SaaS',
  target:500000,horizonDays:90,bindingConstraint:'Lead response latency',bindingWhy:'Inbound demand waits too long.',
  plan:'Instant qualification + routed follow-up',modeledCost:4200,valueAtStake:118000,
  proofMetric:'median response minutes',proofBaseline:1140,proofSuccess:15,proofDays:14,decisionStatus:'TARGET PASS'
};

test('POST accepts structured revenue case and returns buyer artifact plus legacy fields',async()=>{
  const req=new Request('https://agent007.test/api/shortify',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({
    text:'Northstar Systems is reviewing a buyer-specific revenue case. The current analysis identifies lead response latency as the binding commercial constraint and proposes a bounded proof before scale.',
    artifactType:'buyer memo',caseData
  })});
  const res=await POST(req);
  assert.equal(res.status,200);
  const out=await res.json();
  assert.equal(out.artifact.artifactType,'buyer memo');
  assert.match(out.artifact.copy,/Northstar Systems/i);
  assert.match(out.artifact.copy,/Lead response latency/i);
  assert.match(out.artifact.copy,/median response minutes/i);
  assert.equal(out.script,out.artifact.script);
  assert.deepEqual(out.captions,out.artifact.captions);
  assert.deepEqual(out.hashtags,out.artifact.hashtags);
  assert.doesNotMatch(JSON.stringify(out),/BuildInPublic|CreatorTools|DominionEngine/);
});

test('POST keeps text-only callers working',async()=>{
  const req=new Request('https://agent007.test/api/shortify',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({text:'This is a sufficiently long source passage for the backward compatible Agent007 path. It contains more than one hundred characters and should still return a concise script when no structured revenue case is supplied.'})});
  const res=await POST(req);
  assert.equal(res.status,200);
  const out=await res.json();
  assert.equal(typeof out.script,'string');
  assert.ok(out.script.length>40);
  assert.ok(Array.isArray(out.captions));
});
