import https from 'https';

const token = process.env.GITHUB_TOKEN;
if (!token) {
  console.error('Missing GITHUB_TOKEN');
  process.exit(1);
}

const owner = '22emmanueljean-glitch';
const repo = process.argv[2];

if (!repo) {
  console.error('Usage: node continuer_scan_repo.js <repo>');
  process.exit(1);
}

function gh(path) {
  return new Promise((resolve, reject) => {
    const req = https.request(
      {
        hostname: 'api.github.com',
        path,
        headers: {
          'User-Agent': 'Dominion-Engine',
          'Authorization': `token ${token}`,
          'Accept': 'application/vnd.github+json'
        }
      },
      res => {
        let data = '';
        res.on('data', c => (data += c));
        res.on('end', () => {
          try {
            resolve(JSON.parse(data));
          } catch {
            resolve(null);
          }
        });
      }
    );
    req.on('error', reject);
    req.end();
  });
}

(async () => {
  const issues = (await gh(`/repos/${owner}/${repo}/issues?state=open`)) || [];
  const contentsRaw = await gh(`/repos/${owner}/${repo}/contents`);

  const contents = Array.isArray(contentsRaw) ? contentsRaw : [];

  const files = contents.map(f => (f.name || '').toLowerCase());

  const hasTests =
    contents.some(f =>
      f.type === 'dir' &&
      (f.name === 'test' || f.name === '__tests__')
    ) || files.some(f => f.includes('test'));

  const hasCI =
    contents.some(f => f.name === '.github') ||
    files.includes('.github');

  let repo_type = 'unknown';
  if (files.includes('package.json')) repo_type = 'node';
  else if (files.includes('readme.md')) repo_type = 'initialized';

  const report = {
    repo,
    repo_type,
    signals: {
      has_tests: hasTests,
      has_readme: files.includes('readme.md'),
      open_issues: issues.length,
      todos_found: 0,
      ci_present: hasCI
    }
  };

  console.log(JSON.stringify(report, null, 2));
})();
