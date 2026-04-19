const { execSync } = require('child_process');

function isFlutterAvailable() {
  try {
    execSync('flutter --version', { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

function captureFlutterVersion() {
  try {
    const out = execSync('flutter --version 2>&1').toString().trim();
    const match = out.match(/Flutter (\S+)/);
    return match ? match[1] : 'unknown';
  } catch {
    return null;
  }
}

function captureFlutterPackages() {
  try {
    const out = execSync('flutter pub deps --json 2>/dev/null').toString();
    const data = JSON.parse(out);
    const pkgs = {};
    for (const pkg of (data.packages || [])) {
      pkgs[pkg.name] = pkg.version;
    }
    return pkgs;
  } catch {
    return {};
  }
}

function diffFlutter(snapshot, current) {
  const added = {};
  const removed = {};
  const changed = {};

  for (const [k, v] of Object.entries(current)) {
    if (!snapshot[k]) added[k] = v;
    else if (snapshot[k] !== v) changed[k] = { from: snapshot[k], to: v };
  }
  for (const k of Object.keys(snapshot)) {
    if (!current[k]) removed[k] = snapshot[k];
  }
  return { added, removed, changed };
}

function formatFlutterDiff(diff) {
  const lines = [];
  for (const [k, v] of Object.entries(diff.added)) lines.push(`+ ${k}@${v}`);
  for (const [k, v] of Object.entries(diff.removed)) lines.push(`- ${k}@${v}`);
  for (const [k, v] of Object.entries(diff.changed)) lines.push(`~ ${k}: ${v.from} -> ${v.to}`);
  return lines.join('\n');
}

module.exports = { isFlutterAvailable, captureFlutterVersion, captureFlutterPackages, diffFlutter, formatFlutterDiff };
