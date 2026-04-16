const { execSync } = require('child_process');

function isBrewAvailable() {
  try {
    execSync('which brew', { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

function captureBrewPackages() {
  if (!isBrewAvailable()) return { formulae: [], casks: [] };

  const formulae = execSync('brew list --formula', { encoding: 'utf8' })
    .trim()
    .split('\n')
    .filter(Boolean);

  const casks = execSync('brew list --cask', { encoding: 'utf8' })
    .trim()
    .split('\n')
    .filter(Boolean);

  return { formulae, casks };
}

function diffBrew(snapshotBrew, currentBrew) {
  const diff = { added: {}, removed: {} };

  for (const type of ['formulae', 'casks']) {
    const snap = new Set(snapshotBrew[type] || []);
    const curr = new Set(currentBrew[type] || []);

    diff.added[type] = [...snap].filter(p => !curr.has(p));
    diff.removed[type] = [...curr].filter(p => !snap.has(p));
  }

  return diff;
}

function formatBrewDiff(diff) {
  const lines = [];

  for (const type of ['formulae', 'casks']) {
    for (const pkg of diff.added[type] || []) {
      lines.push(`+ [${type}] ${pkg}`);
    }
    for (const pkg of diff.removed[type] || []) {
      lines.push(`- [${type}] ${pkg}`);
    }
  }

  return lines;
}

module.exports = { captureBrewPackages, diffBrew, formatBrewDiff, isBrewAvailable };
