const ARTIFACT_TYPES=['executive outreach','buyer memo','follow-up message','landing-page angle','nurture asset','short-form script'];

const text=(v,fallback='UNKNOWN')=>typeof v==='string'&&v.trim()?v.trim():fallback;
const finite=v=>v!==null&&v!==undefined&&v!==''&&Number.isFinite(Number(v));
const number=(v,fallback=null)=>finite(v)?Number(v):fallback;
const eur=v=>finite(v)?new Intl.NumberFormat('en',{style:'currency',currency:'EUR',maximumFractionDigits:0}).format(Number(v)):'UNKNOWN';
const metric=v=>finite(v)?new Intl.NumberFormat('en',{maximumFractionDigits:1}).format(Number(v)):'UNKNOWN';

function normalizeCase(input={}){
  return {
    company:text(input.company,'the buyer'),
    offer:text(input.offer,'the current offer'),
    buyerPersona:text(input.buyerPersona,'commercial owner'),
    icp:text(input.icp,'target customers'),
    target:number(input.target),
    horizonDays:number(input.horizonDays,90),
    bindingConstraint:text(input.bindingConstraint,'the highest-impact revenue constraint'),
    bindingWhy:text(input.bindingWhy,'The current case indicates this constraint is limiting the commercial target.'),
    plan:text(input.plan,'the minimum sufficient intervention'),
    modeledCost:number(input.modeledCost),
    valueAtStake:number(input.valueAtStake),
    proofMetric:text(input.proofMetric,'the binding metric'),
    proofBaseline:number(input.proofBaseline),
    proofSuccess:number(input.proofSuccess),
    proofDays:number(input.proofDays,14),
    decisionStatus:text(input.decisionStatus,'MODELED DECISION')
  };
}

function commonSections(c){
  const targetLine=c.target===null
    ?`Commercial target: UNKNOWN over ${c.horizonDays} days.`
    :`Commercial target: ${eur(c.target)} over ${c.horizonDays} days.`;
  const valueLine=c.valueAtStake===null
    ?'Modeled value at stake: UNKNOWN until the buyer supplies enough economics and funnel evidence.'
    :`Modeled value at stake: ${eur(c.valueAtStake)} over the current decision horizon. This is planning evidence, not measured realized revenue.`;
  const costLine=c.modeledCost===null
    ?'Modeled intervention cost: UNKNOWN until scope is frozen.'
    :`Modeled intervention cost: ${eur(c.modeledCost)} for the current scenario.`;
  const proofLine=`Proof before scale: move ${c.proofMetric} from ${metric(c.proofBaseline)} to ${metric(c.proofSuccess)} within ${c.proofDays} days. If the metric does not move, stop or redesign before expanding spend.`;
  return [
    {heading:'Diagnosis',body:`${c.company}'s current binding commercial constraint is ${c.bindingConstraint}. ${c.bindingWhy}`},
    {heading:'Economic case',body:`${targetLine} ${valueLine}`},
    {heading:'Recommended move',body:`Current modeled recommendation: ${c.plan}. ${costLine}`},
    {heading:'Proof before scale',body:proofLine},
    {heading:'Next action',body:`Freeze the buyer case, replace assumptions with customer evidence, run the bounded proof, and only scale the intervention if ${c.proofMetric} crosses the success threshold.`}
  ];
}

function buyerMemo(c,sections){
  return `BUYER DECISION MEMO — ${c.company}\n\nDecision status: ${c.decisionStatus}\nBuyer: ${c.buyerPersona}\nOffer: ${c.offer}\nICP: ${c.icp}\n\n${sections.map(s=>`${s.heading.toUpperCase()}\n${s.body}`).join('\n\n')}\n\nEvidence standard: the recommendation, cost and value figures above are modeled planning outputs until customer data and measured proof results replace the assumptions.`;
}
function executiveOutreach(c,sections){
  return `Subject: ${c.company} — a measurable fix for ${c.bindingConstraint}\n\nI mapped the current revenue case around one question: what is the smallest operating change that can materially move the target? The binding constraint is ${c.bindingConstraint}. ${c.bindingWhy}\n\nThe current modeled move is ${c.plan}. ${sections[1].body} ${sections[3].body}\n\nIf useful, the next step is not a generic pitch. We freeze the case with your numbers, run the proof against ${c.proofMetric}, and only expand if the measured result crosses the agreed threshold.`;
}
function followUp(c,sections){
  return `Subject: ${c.company} — next proof step after the revenue review\n\nFollowing the review, the working diagnosis remains ${c.bindingConstraint}. The current modeled recommendation is ${c.plan}.\n\n${sections[1].body}\n\nThe proposed proof is specific: ${sections[3].body}\n\nIf that is the right commercial question, the next action is to freeze the buyer inputs and acceptance threshold, then run the bounded case before committing to a wider implementation.`;
}
function landingAngle(c,sections){
  return `LANDING PAGE ANGLE — ${c.company}\n\nHERO\nStop losing commercial value at ${c.bindingConstraint}.\n\nSUBHEAD\n${c.company} can test ${c.plan} against one measurable proof metric before expanding spend or headcount.\n\nPROOF BLOCK\n${sections[3].body}\n\nECONOMIC BLOCK\n${sections[1].body}\n\nCTA\nRun the buyer case. Freeze the target. Prove the smallest move that works.`;
}
function nurtureAsset(c,sections){
  return `NURTURE SEQUENCE — ${c.company}\n\nMESSAGE 1 — DIAGNOSIS\nThe current revenue case points to ${c.bindingConstraint}. ${c.bindingWhy}\n\nMESSAGE 2 — ECONOMIC REASON\n${sections[1].body}\n\nMESSAGE 3 — SMALLEST MOVE\n${c.plan} is the current modeled intervention. ${sections[2].body}\n\nMESSAGE 4 — PROOF\n${sections[3].body}\n\nMESSAGE 5 — DECISION\nIf the metric clears the threshold, scale the intervention. If it misses, redesign the constraint before spending more.`;
}
function shortForm(c,sections){
  return `HOOK\n${c.company} does not need more random growth activity. The current case says the binding constraint is ${c.bindingConstraint}.\n\nBODY\nThe modeled fix is ${c.plan}. ${sections[1].body}\n\nPROOF\n${sections[3].body}\n\nCLOSE\nFind the leak, prove the smallest move, then scale what survives measurement.`;
}

export function generateRevenueArtifact({artifactType='buyer memo',caseData={}}={}){
  const c=normalizeCase(caseData);
  const normalizedType=ARTIFACT_TYPES.includes(artifactType)?artifactType:'buyer memo';
  const sections=commonSections(c);
  const builders={
    'executive outreach':executiveOutreach,
    'buyer memo':buyerMemo,
    'follow-up message':followUp,
    'landing-page angle':landingAngle,
    'nurture asset':nurtureAsset,
    'short-form script':shortForm
  };
  const copy=builders[normalizedType](c,sections);
  const captions=[copy.slice(0,180)+(copy.length>180?'…':''),copy.slice(0,320)+(copy.length>320?'…':'')];
  const hashtags=normalizedType==='short-form script'?['#RevenueOperations','#RevenueSystems','#SalesAutomation']:[];
  return {
    artifactType:normalizedType,
    title:`${c.company} — ${normalizedType}`,
    summary:`${c.bindingConstraint}: ${c.plan}. Proof on ${c.proofMetric} before scale.`,
    evidenceClass:'MODELED + CUSTOMER-SUPPLIED INPUTS',
    sections,
    copy,
    script:copy,
    captions,
    hashtags
  };
}

export { ARTIFACT_TYPES, normalizeCase };
