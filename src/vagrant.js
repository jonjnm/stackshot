const { execSync } = require('child_process');

function isVagrantAvailable() {
  try {
    execSync('vagrant --version', { stdio: 'pipe' });
    return true;
  } catch {
    return false;
  }
}

function captureVagrantVersion() {
  try {
    return execSync('vagrant --version', { stdio: 'pipe' }).toString().trim();
  } catch {
    return null;
  }
}

function captureVagrantBoxes() {
  try {
    const output = execSync('vagrant box list', { stdio: 'pipe' }).toString().trim();
    if (!output) return [];
    return output.split('\n').map(line => {
      const match = line.match(/^(\S+)\s+\(([^,]+),\s*([^)]+)\)/);
      return match ? { name: match[1], provider: match[2], version: match[3] } : { name: line.trim(), provider: null, version: null };
    }).filter(b => b.name);
  } catch {
    return [];
  }
}

function diffVagrant(snapshot, current) {
  const snapBoxes = new Map((snapshot.boxes || []).map(b => [b.name, b]));
  const currBoxes = new Map((current.boxes || []).map(b => [b.name, b]));
  const added = [...currBoxes.values()].filter(b => !snapBoxes.has(b.name));
  const removed = [...snapBoxes.values()].filter(b => !currBoxes.has(b.name));
  const versionChanged = [...currBoxes.values()].filter(b => {
    const s = snapBoxes.get(b.name);
    return s && s.version !== b.version;
  });
  return { added, removed, versionChanged };
}

function formatVagrantDiff(diff) {
  const lines = [];
  if (diff.added.length) lines.push('Added boxes:', ...diff.added.map(b => `  + ${b.name} (${b.provider} ${b.version})`));
  if (diff.removed.length) lines.push('Removed boxes:', ...diff.removed.map(b => `  - ${b.name}`));
  if (diff.versionChanged.length) lines.push('Version changed:', ...diff.versionChanged.map(b => `  ~ ${b.name} -> ${b.version}`));
  return lines.join('\n');
}

module.exports = { isVagrantAvailable, captureVagrantVersion, captureVagrantBoxes, diffVagrant, formatVagrantDiff };
