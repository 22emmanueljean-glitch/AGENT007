import { execSync } from 'child_process';

const repos = execSync(
  `gh repo list 22emmanueljean-glitch --limit 20 --json name --jq '.[].name'`,
  { encoding: 'utf8' }
)
  .split('\n')
  .filter(Boolean);

for (const repo of repos) {
  try {
    console.log(`\n🔍 Scanning ${repo}`);

    execSync(
      `node scripts/continuer_scan_repo.js ${repo} > /tmp/scan.json`,
      { stdio: 'inherit' }
    );

    const decision = execSync(
      `node scripts/continuer_decide_action.js /tmp/scan.json`,
      { encoding: 'utf8' }
    );

    console.log(decision);

    const action = JSON.parse(decision).decided_action;

    if (action === 'ADD_SCAFFOLD') {
      execSync(`node scripts/continuer_execute_add_scaffold.js ${repo}`, { stdio: 'inherit' });
    } else if (action === 'ADD_TESTS') {
      execSync(`node scripts/continuer_execute_add_tests.js ${repo}`, { stdio: 'inherit' });
    } else if (action === 'ADD_CI') {
      execSync(`node scripts/continuer_execute_add_ci.js ${repo}`, { stdio: 'inherit' });
    } else {
      console.log(`⏭️ No action for ${repo}`);
    }

  } catch (err) {
    console.error(`⚠️ Error on ${repo}`, err.message);
  }
}
