import fs from 'fs';

const input = process.argv[2];
if (!input) {
  console.error('Missing scan JSON');
  process.exit(1);
}

const scan = JSON.parse(fs.readFileSync(input, 'utf8'));
const s = scan.signals || {};

const hasPackage = scan.repo_type === 'node';
const hasTests = !!s.has_tests;
const hasCI = !!s.ci_present;
const hasReadme = !!s.has_readme;

// ---- STAGE COMPUTATION ----
let stage = 0;
if (hasReadme) stage = 1;
if (hasTests && hasCI) stage = 2;
if (s.has_real_feature) stage = 3;
if (s.has_cli_or_api) stage = 4;

// ---- DECISION LOGIC (UTILITY-DRIVEN) ----
let decided_action = 'NO_OP';

if (stage === 0) {
  decided_action = 'ADD_SCAFFOLD';
} 
else if (stage === 1) {
  decided_action = 'ADD_TESTS';
} 
else if (stage === 2 && hasPackage) {
  decided_action = 'ADD_REAL_FEATURE';
} 
else if (stage === 3 && hasPackage) {
  decided_action = 'ADD_API';
} 
else if (stage === 4) {
  decided_action = 'ADD_MONETIZATION';
}

const decision = {
  repo: scan.repo,
  repo_type: scan.repo_type,
  stage,
  decided_action,
  timestamp: new Date().toISOString()
};

console.log(JSON.stringify(decision, null, 2));
