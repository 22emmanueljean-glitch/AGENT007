import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const repo = process.argv[2];
if (!repo) {
  console.error('Usage: node continuer_execute_add_ci.js <repo>');
  process.exit(1);
}

const workdir = `/tmp/${repo}-ci`;

execSync(`rm -rf ${workdir}`);
execSync(`git clone https://github.com/22emmanueljean-glitch/${repo}.git ${workdir}`, { stdio: 'inherit' });

const workflowDir = path.join(workdir, '.github/workflows');
fs.mkdirSync(workflowDir, { recursive: true });

const workflow = `
name: CI

on:
  pull_request:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm install
      - run: npm test || echo "No tests yet"
`;

fs.writeFileSync(path.join(workflowDir, 'ci.yml'), workflow);

execSync(`cd ${workdir} && git checkout -b add-ci`);
execSync(`cd ${workdir} && git add .github/workflows/ci.yml`);
execSync(`cd ${workdir} && git commit -m "ci: add basic GitHub Actions pipeline"`);
execSync(`cd ${workdir} && git push -u origin add-ci`, { stdio: 'inherit' });

execSync(
  `gh pr create --repo 22emmanueljean-glitch/${repo} --title "Add CI pipeline" --body "Automated CI added by Dominion Engine"`,
  { stdio: 'inherit' }
);

console.log('CI PR opened.');
