const { execSync } = require('child_process');

function isNvmAvailable() {
  try {
    execSync('bash -c ". $NVM_DIR/nvm.sh && nvm --version"', { stdio: 'pipe' });
    return true;
  } catch {
    return false;
  }
}

function captureNvmVersion() {
  try {
    const out = execSync('bash -c ". $NVM_DIR/nvm.sh && nvm --version"', { stdio: 'pipe' });
    return out.toString().trim();
  } catch {
    return null;
  }
}

function captureNvmInstalledVersions() {
  try {
    const out = execSync('bash -c ". $NVM_DIR/nvm.sh && nvm ls --no-colors"', { stdio: 'pipe' });
    return out.toString()
      .split('\n')
      .map(l => l.trim().replace(/^[*->\s]+/, '').split(' ')[0])
      .filter(v => v && v.startsWith('v'));
  } catch {
    return [];
  }
}

function captureNvmDefault() {
  try {
    const out = execSync('bash -c ". $NVM_DIR/nvm.sh && nvm alias default"', { stdio: 'pipe' });
    const match = out.toString().match(/v[\d.]+/);
    return match ? match[0] : null;
  } catch {
    return null;
  }
}

function diffNvm(snapshot, current) {
  const added = current.installed.filter(v => !snapshot.installed.includes(v));
  const removed = snapshot.installed.filter(v => !current.installed.includes(v));
  const defaultChanged = snapshot.default !== current.default;
  return { added, removed, defaultChanged, snapshotDefault: snapshot.default, currentDefault: current.default };
}

function formatNvmDiff(diff) {
  const lines = [];
  if (diff.added.length) lines.push(`  Added:   ${diff.added.join(', ')}`);
  if (diff.removed.length) lines.push(`  Removed: ${diff.removed.join(', ')}`);
  if (diff.defaultChanged) lines.push(`  Default: ${diff.snapshotDefault} → ${diff.currentDefault}`);
  return lines.join('\n');
}

module.exports = { isNvmAvailable, captureNvmVersion, captureNvmInstalledVersions, captureNvmDefault, diffNvm, formatNvmDiff };
