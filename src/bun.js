const { execSync } = require('child_process');

function isBunAvailable() {
  try {
    execSync('bun --version', { stdio: 'pipe' });
    return true;
  } catch {
    return false;
  }
}

function captureBunVersion() {
  try {
    const version = execSync('bun --version', { stdio: 'pipe' }).toString().trim();
    return { version };
  } catch {
    return { version: null };
  }
}

function captureBunPackages() {
  try {
    const raw = execSync('bun pm ls --all 2>/dev/null', { stdio: 'pipe' }).toString().trim();
    const packages = {};
    for (const line of raw.split('\n')) {
      const match = line.match(/^\s+([\w@/-]+)@([\d.]+)/);
      if (match) {
        packages[match[1]] = match[2];
      }
    }
    return packages;
  } catch {
    return {};
  }
}

function diffBun(snapshot, current) {
  const added = {};
  const removed = {};
  const changed = {};

  const snapPkgs = snapshot.packages || {};
  const currPkgs = current.packages || {};

  for (const [name, version] of Object.entries(currPkgs)) {
    if (!snapPkgs[name]) added[name] = version;
    else if (snapPkgs[name] !== version) changed[name] = { from: snapPkgs[name], to: version };
  }

  for (const [name, version] of Object.entries(snapPkgs)) {
    if (!currPkgs[name]) removed[name] = version;
  }

  const versionChanged =
    snapshot.version?.version !== current.version?.version
      ? { from: snapshot.version?.version, to: current.version?.version }
      : null;

  return { added, removed, changed, versionChanged };
}

function formatBunDiff(diff) {
  const lines = [];
  if (diff.versionChanged) {
    lines.push(`  bun version: ${diff.versionChanged.from} → ${diff.versionChanged.to}`);
  }
  for (const [k, v] of Object.entries(diff.added)) lines.push(`  + ${k}@${v}`);
  for (const [k, v] of Object.entries(diff.removed)) lines.push(`  - ${k}@${v}`);
  for (const [k, v] of Object.entries(diff.changed)) lines.push(`  ~ ${k}: ${v.from} → ${v.to}`);
  return lines.join('\n');
}

module.exports = { isBunAvailable, captureBunVersion, captureBunPackages, diffBun, formatBunDiff };
