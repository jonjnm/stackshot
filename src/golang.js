const { execSync } = require('child_process');

function isGoAvailable() {
  try {
    execSync('go version', { stdio: 'pipe' });
    return true;
  } catch {
    return false;
  }
}

function captureGoVersion() {
  try {
    const out = execSync('go version', { stdio: 'pipe' }).toString().trim();
    const match = out.match(/go(\S+)/);
    return match ? match[1] : null;
  } catch {
    return null;
  }
}

function captureGoPackages() {
  try {
    const out = execSync('go list -m all 2>/dev/null', { stdio: 'pipe' }).toString().trim();
    if (!out) return [];
    return out.split('\n').filter(Boolean).map(line => {
      const [name, version] = line.split(' ');
      return { name, version: version || 'unknown' };
    });
  } catch {
    return [];
  }
}

function diffGo(snapshot, current) {
  const snapPkgs = snapshot.packages || [];
  const currPkgs = current.packages || [];
  const snapMap = Object.fromEntries(snapPkgs.map(p => [p.name, p.version]));
  const currMap = Object.fromEntries(currPkgs.map(p => [p.name, p.version]));

  const added = currPkgs.filter(p => !snapMap[p.name]);
  const removed = snapPkgs.filter(p => !currMap[p.name]);
  const changed = currPkgs.filter(p => snapMap[p.name] && snapMap[p.name] !== p.version);
  const versionChanged = snapshot.version !== current.version;

  return { versionChanged, snapshotVersion: snapshot.version, currentVersion: current.version, added, removed, changed };
}

function formatGoDiff(diff) {
  const lines = [];
  if (diff.versionChanged) {
    lines.push(`  go version: ${diff.snapshotVersion} → ${diff.currentVersion}`);
  }
  diff.added.forEach(p => lines.push(`  + ${p.name} ${p.version}`));
  diff.removed.forEach(p => lines.push(`  - ${p.name} ${p.version}`));
  diff.changed.forEach(p => lines.push(`  ~ ${p.name} changed`));
  return lines.join('\n');
}

module.exports = { isGoAvailable, captureGoVersion, captureGoPackages, diffGo, formatGoDiff };
