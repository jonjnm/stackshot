const { execSync } = require('child_process');

function isJuliaAvailable() {
  try {
    execSync('julia --version', { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

function captureJuliaVersion() {
  try {
    const out = execSync('julia --version 2>&1').toString().trim();
    return out.replace('julia version ', '');
  } catch {
    return null;
  }
}

function captureJuliaPackages() {
  try {
    const out = execSync('julia -e "import Pkg; Pkg.status()" 2>&1').toString();
    const packages = {};
    for (const line of out.split('\n')) {
      const m = line.match(/\s+\[\w+\]\s+(\S+)\s+v([\d.]+)/);
      if (m) packages[m[1]] = m[2];
    }
    return packages;
  } catch {
    return {};
  }
}

function diffJulia(snap1, snap2) {
  const added = {}, removed = {}, changed = {};
  const p1 = snap1.packages || {};
  const p2 = snap2.packages || {};
  for (const k of Object.keys(p2)) {
    if (!p1[k]) added[k] = p2[k];
    else if (p1[k] !== p2[k]) changed[k] = { from: p1[k], to: p2[k] };
  }
  for (const k of Object.keys(p1)) {
    if (!p2[k]) removed[k] = p1[k];
  }
  return { versionChanged: snap1.version !== snap2.version, added, removed, changed };
}

function formatJuliaDiff(diff) {
  const lines = [];
  if (diff.versionChanged) lines.push('  julia version changed');
  for (const [k, v] of Object.entries(diff.added)) lines.push(`  + ${k}@${v}`);
  for (const [k, v] of Object.entries(diff.removed)) lines.push(`  - ${k}@${v}`);
  for (const [k, v] of Object.entries(diff.changed)) lines.push(`  ~ ${k}: ${v.from} -> ${v.to}`);
  return lines.join('\n');
}

module.exports = { isJuliaAvailable, captureJuliaVersion, captureJuliaPackages, diffJulia, formatJuliaDiff };
