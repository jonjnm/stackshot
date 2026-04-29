const { execSync } = require('child_process');

function isPnpmAvailable() {
  try {
    execSync('pnpm --version', { stdio: 'pipe' });
    return true;
  } catch {
    return false;
  }
}

function capturePnpmVersion() {
  try {
    return execSync('pnpm --version', { stdio: 'pipe' }).toString().trim();
  } catch {
    return null;
  }
}

function capturePnpmGlobals() {
  try {
    const output = execSync('pnpm list -g --depth=0 --json', { stdio: 'pipe' }).toString().trim();
    const parsed = JSON.parse(output);
    const deps = parsed[0]?.dependencies || {};
    return Object.entries(deps).map(([name, info]) => ({ name, version: info.version }));
  } catch {
    return [];
  }
}

function diffPnpm(snapshot, current) {
  const snapshotGlobals = snapshot.globals || [];
  const currentGlobals = current.globals || [];

  const snapshotMap = new Map(snapshotGlobals.map(p => [p.name, p.version]));
  const currentMap = new Map(currentGlobals.map(p => [p.name, p.version]));

  const added = currentGlobals.filter(p => !snapshotMap.has(p.name));
  const removed = snapshotGlobals.filter(p => !currentMap.has(p.name));
  const changed = currentGlobals.filter(p => snapshotMap.has(p.name) && snapshotMap.get(p.name) !== p.version);

  return { added, removed, changed };
}

function formatPnpmDiff(diff) {
  const lines = [];
  if (diff.added.length) {
    lines.push('  Added:');
    diff.added.forEach(p => lines.push(`    + ${p.name}@${p.version}`));
  }
  if (diff.removed.length) {
    lines.push('  Removed:');
    diff.removed.forEach(p => lines.push(`    - ${p.name}`));
  }
  if (diff.changed.length) {
    lines.push('  Changed:');
    diff.changed.forEach(p => lines.push(`    ~ ${p.name}@${p.version}`));
  }
  return lines.join('\n');
}

module.exports = { isPnpmAvailable, capturePnpmVersion, capturePnpmGlobals, diffPnpm, formatPnpmDiff };
