import { execSync } from 'child_process';
import fs from 'fs';

const OWNER = '22emmanueljean-glitch';
const ALLOW_FILE = 'engine.allow';

if (!fs.existsSync(ALLOW_FILE)) {
  console.error('❌ Missing engine.allow');
  process.exit(1);
}

const allow = fs
  .readFileSync(ALLOW_FILE, 'utf8')
  .split('\n')
  .map(l => l.trim())
  .filter(Boolean);

if (!allow.length) {
  console.error('❌ engine.allow is empty');
  process.exit(1);
}

const repos = execSync(
  `gh repo list ${OWNER} --limit 50 --json name --jq '.[].name'`,
  { encoding: 'utf8' }
)
  .split('\n')
  .filter(r => allow.includes(r));

for (const repo of repos) {
  console.log(`\n🔍 ${repo}`);

  let scan;
  try {
    execSync(
      `node scripts/continuer_scan_repo.js ${repo} > /tmp/scan.json`,
      { stdio: 'ignore' }
    );

    scan = JSON.parse(fs.readFileSync('/tmp/scan.json', 'utf8'));
  } catch (e) {
    console.error(`⚠️ ${repo} scan failed — skipping`);
    continue;
  }

  // ---- HARD VALIDATION (THIS WAS MISSING) ----
  if (
    !scan ||
    typeof scan !== 'object' ||
    !scan.signals ||
    typeof scan.signals !== 'object'
  ) {
    console.error(`⚠️ ${repo} invalid scan structure — skipping`);
    continue;
  }

  const repoType = scan.repo_type || 'unknown';
  const signals = scan.signals;

  const hasTests = !!signals.has_tests;
  const hasCI = !!signals.ci_present;
  const hasReadme = !!signals.has_readme;

  // ---- STAGE COMPUTATION ----
  let stage = 0;
  if (hasReadme) stage = 1;
  if (hasTests && hasCI) stage = 2;

  let decided_action = 'NO_OP';

  if (stage === 0) decided_action = 'ADD_SCAFFOLD';
  else if (stage === 1) decided_action = 'ADD_TESTS';
  else if (stage === 2 && repoType === 'node') decided_action = 'ADD_REAL_FEATURE';

  console.log(
    JSON.stringify(
      { repo, repoType, stage, decided_action },
      null,
      2
    )
  );

  try {
    if (decided_action === 'ADD_SCAFFOLD') {
      execSync(`node scripts/continuer_execute_add_scaffold.js ${repo}`, { stdio: 'inherit' });
    } else if (decided_action === 'ADD_TESTS') {
      execSync(`node scripts/continuer_execute_add_tests.js ${repo}`, { stdio: 'inherit' });
    } else if (decided_action === 'ADD_REAL_FEATURE') {
      execSync(`node scripts/continuer_execute_create_real_tool.js ${repo}`, { stdio: 'inherit' });
    } else {
      console.log(`⏭️ no action`);
    }
  } catch (e) {
    console.error(`⚠️ ${repo} action failed — continuing`);
  }
}
