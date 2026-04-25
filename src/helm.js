const { execSync } = require('child_process');

function isHelmAvailable() {
  try {
    execSync('helm version --short', { stdio: 'pipe' });
    return true;
  } catch {
    return false;
  }
}

function captureHelmVersion() {
  try {
    const out = execSync('helm version --short', { stdio: 'pipe' }).toString().trim();
    return out;
  } catch {
    return null;
  }
}

function captureHelmRepos() {
  try {
    const out = execSync('helm repo list -o json', { stdio: 'pipe' }).toString().trim();
    return JSON.parse(out);
  } catch {
    return [];
  }
}

function captureHelmReleases() {
  try {
    const out = execSync('helm list --all-namespaces -o json', { stdio: 'pipe' }).toString().trim();
    return JSON.parse(out);
  } catch {
    return [];
  }
}

function diffHelm(snapshot, current) {
  const diff = { repos: { added: [], removed: [] }, releases: { added: [], removed: [] } };

  const snapRepoNames = new Set((snapshot.repos || []).map(r => r.name));
  const currRepoNames = new Set((current.repos || []).map(r => r.name));
  diff.repos.added = (current.repos || []).filter(r => !snapRepoNames.has(r.name));
  diff.repos.removed = (snapshot.repos || []).filter(r => !currRepoNames.has(r.name));

  const snapReleaseKeys = new Set((snapshot.releases || []).map(r => `${r.namespace}/${r.name}`));
  const currReleaseKeys = new Set((current.releases || []).map(r => `${r.namespace}/${r.name}`));
  diff.releases.added = (current.releases || []).filter(r => !snapReleaseKeys.has(`${r.namespace}/${r.name}`));
  diff.releases.removed = (snapshot.releases || []).filter(r => !currReleaseKeys.has(`${r.namespace}/${r.name}`));

  return diff;
}

function formatHelmDiff(diff) {
  const lines = [];
  if (diff.repos.added.length) lines.push(...diff.repos.added.map(r => `+ repo: ${r.name} (${r.url})`));
  if (diff.repos.removed.length) lines.push(...diff.repos.removed.map(r => `- repo: ${r.name} (${r.url})`));
  if (diff.releases.added.length) lines.push(...diff.releases.added.map(r => `+ release: ${r.namespace}/${r.name} (${r.chart})`));
  if (diff.releases.removed.length) lines.push(...diff.releases.removed.map(r => `- release: ${r.namespace}/${r.name} (${r.chart})`));
  return lines.join('\n');
}

module.exports = { isHelmAvailable, captureHelmVersion, captureHelmRepos, captureHelmReleases, diffHelm, formatHelmDiff };
