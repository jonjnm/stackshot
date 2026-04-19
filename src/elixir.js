const { execSync } = require('child_process');

function isElixirAvailable() {
  try {
    execSync('elixir --version', { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

function captureElixirVersion() {
  try {
    const out = execSync('elixir --version 2>/dev/null').toString().trim();
    const match = out.match(/Elixir ([\d.]+)/);
    return match ? match[1] : null;
  } catch {
    return null;
  }
}

function captureHexPackages() {
  try {
    const out = execSync('mix deps 2>/dev/null').toString();
    const lines = out.split('\n').filter(l => l.match(/^\* \w/));
    return lines.map(l => l.replace(/^\* /, '').split(' ')[0]);
  } catch {
    return [];
  }
}

function captureOtpVersion() {
  try {
    const out = execSync('elixir --version 2>/dev/null').toString().trim();
    const match = out.match(/OTP ([\d]+)/);
    return match ? match[1] : null;
  } catch {
    return null;
  }
}

function diffElixir(snapshot, current) {
  const added = current.packages.filter(p => !snapshot.packages.includes(p));
  const removed = snapshot.packages.filter(p => !current.packages.includes(p));
  const versionChanged = snapshot.version !== current.version;
  return { versionChanged, oldVersion: snapshot.version, newVersion: current.version, added, removed };
}

function formatElixirDiff(diff) {
  const lines = [];
  if (diff.versionChanged) {
    lines.push(`  elixir: ${diff.oldVersion} → ${diff.newVersion}`);
  }
  diff.added.forEach(p => lines.push(`  + ${p}`));
  diff.removed.forEach(p => lines.push(`  - ${p}`));
  return lines.join('\n');
}

module.exports = { isElixirAvailable, captureElixirVersion, captureHexPackages, captureOtpVersion, diffElixir, formatElixirDiff };
