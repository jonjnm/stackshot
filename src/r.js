const { execSync } = require('child_process');

function isRAvailable() {
  try {
    execSync('R --version', { stdio: 'pipe' });
    return true;
  } catch {
    return false;
  }
}

function captureRVersion() {
  try {
    const out = execSync('R --version', { stdio: 'pipe' }).toString();
    const match = out.match(/R version ([\d.]+)/);
    return match ? match[1] : null;
  } catch {
    return null;
  }
}

function captureCranPackages() {
  try {
    const out = execSync('Rscript -e "ip <- installed.packages(); cat(paste(ip[,1], ip[,3], sep=\'@\'), sep=\'\\n\')"', { stdio: 'pipe' }).toString();
    return out.trim().split('\n').filter(Boolean);
  } catch {
    return [];
  }
}

function diffR(snapshot, current) {
  const added = current.packages.filter(p => !snapshot.packages.includes(p));
  const removed = snapshot.packages.filter(p => !current.packages.includes(p));
  const versionChanged = snapshot.version !== current.version;
  return { versionChanged, oldVersion: snapshot.version, newVersion: current.version, added, removed };
}

function formatRDiff(diff) {
  const lines = [];
  if (diff.versionChanged) lines.push(`  R: ${diff.oldVersion} → ${diff.newVersion}`);
  diff.added.forEach(p => lines.push(`  + ${p}`));
  diff.removed.forEach(p => lines.push(`  - ${p}`));
  return lines.join('\n');
}

module.exports = { isRAvailable, captureRVersion, captureCranPackages, diffR, formatRDiff };
