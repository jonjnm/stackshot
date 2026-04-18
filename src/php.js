const { execSync } = require('child_process');

function isPhpAvailable() {
  try {
    execSync('php --version', { stdio: 'pipe' });
    return true;
  } catch {
    return false;
  }
}

function capturePhpVersion() {
  try {
    const out = execSync('php --version', { stdio: 'pipe' }).toString().trim();
    const match = out.match(/PHP (\S+)/);
    return match ? match[1] : null;
  } catch {
    return null;
  }
}

function captureComposerPackages() {
  try {
    const out = execSync('composer global show --format=json 2>/dev/null', { stdio: 'pipe' }).toString();
    const data = JSON.parse(out);
    const packages = {};
    for (const pkg of (data.installed || [])) {
      packages[pkg.name] = pkg.version;
    }
    return packages;
  } catch {
    return {};
  }
}

function diffPhp(snapshot, current) {
  const diff = { versionChanged: false, added: {}, removed: {}, changed: {} };

  if (snapshot.phpVersion !== current.phpVersion) {
    diff.versionChanged = true;
    diff.oldVersion = snapshot.phpVersion;
    diff.newVersion = current.phpVersion;
  }

  const snap = snapshot.composerPackages || {};
  const curr = current.composerPackages || {};

  for (const [k, v] of Object.entries(curr)) {
    if (!snap[k]) diff.added[k] = v;
    else if (snap[k] !== v) diff.changed[k] = { from: snap[k], to: v };
  }
  for (const k of Object.keys(snap)) {
    if (!curr[k]) diff.removed[k] = snap[k];
  }

  return diff;
}

function formatPhpDiff(diff) {
  const lines = [];
  if (diff.versionChanged) lines.push(`  php: ${diff.oldVersion} → ${diff.newVersion}`);
  for (const [k, v] of Object.entries(diff.added)) lines.push(`  + ${k}@${v}`);
  for (const [k, v] of Object.entries(diff.removed)) lines.push(`  - ${k}@${v}`);
  for (const [k, v] of Object.entries(diff.changed)) lines.push(`  ~ ${k}: ${v.from} → ${v.to}`);
  return lines.join('\n');
}

module.exports = { isPhpAvailable, capturePhpVersion, captureComposerPackages, diffPhp, formatPhpDiff };
