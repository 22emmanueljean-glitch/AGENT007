import test from 'node:test';
import assert from 'node:assert/strict';
import { generateRevenueArtifact } from '../lib/revenue-artifact.js';

const baseCase={
  company:'Northstar Systems',
  offer:'enterprise revenue platform',
  buyerPersona:'CRO',
  icp:'B2B SaaS 100–1000 employees',
  target:500000,
  horizonDays:90,
  bindingConstraint:'Lead response latency',
  bindingWhy:'Qualified inbound waits too long before first human or automated response.',
  plan:'Instant qualification + routed follow-up',
  modeledCost:4200,
  valueAtStake:118000,
  proofMetric:'median response minutes',
  proofBaseline:1140,
  proofSuccess:15,
  proofDays:14,
  decisionStatus:'TARGET PASS'
};

test('buyer memo is a structured decision artifact, not an echo',()=>{
  const out=generateRevenueArtifact({artifactType:'buyer memo',caseData:baseCase});
  assert.equal(out.artifactType,'buyer memo');
  assert.match(out.title,/Northstar Systems/i);
  assert.match(out.summary,/Lead response latency/i);
  assert.match(out.copy,/€118,000|118,000/);
  assert.match(out.copy,/Instant qualification/i);
  assert.match(out.copy,/median response minutes/i);
  assert.match(out.copy,/14 days/i);
  assert.match(out.copy,/modeled/i);
  assert.ok(Array.isArray(out.sections) && out.sections.length>=5);
  assert.ok(out.copy.length>350);
  assert.doesNotMatch(out.copy,/BuildInPublic|CreatorTools|DominionEngine/);
});

test('changing the buyer case changes the diagnosis and recommendation',()=>{
  const a=generateRevenueArtifact({artifactType:'buyer memo',caseData:baseCase});
  const b=generateRevenueArtifact({artifactType:'buyer memo',caseData:{...baseCase,bindingConstraint:'Opportunity-to-win conversion',bindingWhy:'Late-stage opportunities stall after proposal.',plan:'Proposal follow-up + proof asset',proofMetric:'opportunity-to-win %',proofBaseline:11,proofSuccess:18}});
  assert.notEqual(a.copy,b.copy);
  assert.match(b.copy,/Opportunity-to-win conversion/i);
  assert.match(b.copy,/Proposal follow-up/i);
  assert.match(b.copy,/opportunity-to-win/i);
});

test('artifact types produce distinct buyer-ready outputs',()=>{
  const types=['executive outreach','buyer memo','follow-up message','landing-page angle','nurture asset','short-form script'];
  const outputs=types.map(artifactType=>generateRevenueArtifact({artifactType,caseData:baseCase}).copy);
  assert.equal(new Set(outputs).size,types.length);
  for(const copy of outputs){
    assert.match(copy,/Northstar Systems/i);
    assert.match(copy,/Lead response latency/i);
  }
});

test('missing economics stay unknown instead of becoming fake savings',()=>{
  const out=generateRevenueArtifact({artifactType:'buyer memo',caseData:{...baseCase,valueAtStake:null,modeledCost:null}});
  assert.match(out.copy,/UNKNOWN/i);
  assert.doesNotMatch(out.copy,/€0/);
});
