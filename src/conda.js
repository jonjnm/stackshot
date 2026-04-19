const { execSync } = require('child_process');

function isCondaAvailable() {
  try {
    execSync('conda --version', { stdio: 'pipe' });
    return true;
  } catch {
    return false;
  }
}

function captureCondaVersion() {
  try {
    return execSync('conda --version', { stdio: 'pipe' }).toString().trim();
  } catch {
    return null;
  }
}

function captureCondaEnvs() {
  try {
    const output = execSync('conda env list --json', { stdio: 'pipe' }).toString();
    const parsed = JSON.parse(output);
    return parsed.envs || [];
  } catch {
    return [];
  }
}

function captureCondaPackages(envName = 'base') {
  try {
    const output = execSync(`conda list -n ${envName} --json`, { stdio: 'pipe' }).toString();
    return JSON.parse(output);
  } catch {
    return [];
  }
}

function diffConda(snapshot, current) {
  const snapPkgs = new Map(snapshot.packages.map(p => [p.name, p.version]));
  const currPkgs = new Map(current.packages.map(p => [p.name, p.version]));

  const added = current.packages.filter(p => !snapPkgs.has(p.name));
  const removed = snapshot.packages.filter(p => !currPkgs.has(p.name));
  const changed = current.packages.filter(p => snapPkgs.has(p.name) && snapPkgs.get(p.name) !== p.version);

  return { added, removed, changed };
}

function formatCondaDiff(diff) {
  const lines = [];
  if (diff.added.length) lines.push(...diff.added.map(p => `+ ${p.name}@${p.version}`));
  if (diff.removed.length) lines.push(...diff.removed.map(p => `- ${p.name}`));
  if (diff.changed.length) lines.push(...diff.changed.map(p => `~ ${p.name}@${p.version}`));
  return lines.join('\n');
}

module.exports = { isCondaAvailable, captureCondaVersion, captureCondaEnvs, captureCondaPackages, diffConda, formatCondaDiff };
