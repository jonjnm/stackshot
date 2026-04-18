const { execSync } = require('child_process');

function isSwiftAvailable() {
  try {
    execSync('swift --version', { stdio: 'pipe' });
    return true;
  } catch {
    return false;
  }
}

function captureSwiftVersion() {
  try {
    const out = execSync('swift --version', { stdio: 'pipe' }).toString().trim();
    return out.split('\n')[0];
  } catch {
    return null;
  }
}

function captureSwiftPackages() {
  try {
    const out = execSync('swift package show-dependencies --format json 2>/dev/null || echo "{}"', { stdio: 'pipe' }).toString().trim();
    const parsed = JSON.parse(out);
    return (parsed.dependencies || []).map(d => ({ name: d.name, version: d.version || 'unknown' }));
  } catch {
    return [];
  }
}

function diffSwift(snapshot, current) {
  const added = current.packages.filter(p => !snapshot.packages.find(s => s.name === p.name));
  const removed = snapshot.packages.filter(p => !current.packages.find(c => c.name === p.name));
  const changed = current.packages.filter(p => {
    const s = snapshot.packages.find(s => s.name === p.name);
    return s && s.version !== p.version;
  });
  return { versionChanged: snapshot.version !== current.version, added, removed, changed };
}

function formatSwiftDiff(diff) {
  const lines = [];
  if (diff.versionChanged) lines.push('  swift version changed');
  diff.added.forEach(p => lines.push(`  + ${p.name}@${p.version}`));
  diff.removed.forEach(p => lines.push(`  - ${p.name}`));
  diff.changed.forEach(p => lines.push(`  ~ ${p.name}@${p.version}`));
  return lines.join('\n');
}

module.exports = { isSwiftAvailable, captureSwiftVersion, captureSwiftPackages, diffSwift, formatSwiftDiff };
