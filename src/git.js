const { execSync } = require('child_process');

function isGitAvailable() {
  try {
    execSync('git --version', { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

function isGitRepo(cwd = process.cwd()) {
  try {
    execSync('git rev-parse --is-inside-work-tree', { cwd, stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

function captureGitConfig() {
  if (!isGitAvailable()) return { available: false, config: {} };
  try {
    const output = execSync('git config --global --list', { encoding: 'utf8' });
    const config = {};
    for (const line of output.trim().split('\n')) {
      const idx = line.indexOf('=');
      if (idx !== -1) {
        config[line.slice(0, idx)] = line.slice(idx + 1);
      }
    }
    return { available: true, config };
  } catch {
    return { available: true, config: {} };
  }
}

function diffGit(snapshot, current) {
  const added = {};
  const removed = {};
  const changed = {};

  for (const key of Object.keys(current.config)) {
    if (!(key in snapshot.config)) added[key] = current.config[key];
    else if (snapshot.config[key] !== current.config[key])
      changed[key] = { from: snapshot.config[key], to: current.config[key] };
  }
  for (const key of Object.keys(snapshot.config)) {
    if (!(key in current.config)) removed[key] = snapshot.config[key];
  }
  return { added, removed, changed };
}

function formatGitDiff(diff) {
  const lines = [];
  for (const [k, v] of Object.entries(diff.added)) lines.push(`+ ${k}=${v}`);
  for (const [k, v] of Object.entries(diff.removed)) lines.push(`- ${k}=${v}`);
  for (const [k, v] of Object.entries(diff.changed)) lines.push(`~ ${k}: ${v.from} → ${v.to}`);
  return lines.join('\n');
}

module.exports = { isGitAvailable, isGitRepo, captureGitConfig, diffGit, formatGitDiff };
