const { execSync } = require('child_process');

function isDenoAvailable() {
  try {
    execSync('deno --version', { stdio: 'pipe' });
    return true;
  } catch {
    return false;
  }
}

function captureDenoVersion() {
  try {
    const output = execSync('deno --version', { stdio: 'pipe' }).toString().trim();
    const match = output.match(/deno (\S+)/);
    return match ? match[1] : null;
  } catch {
    return null;
  }
}

function captureDenoPackages() {
  try {
    const output = execSync('deno info --json', { stdio: 'pipe' }).toString().trim();
    const info = JSON.parse(output);
    return info.modules || [];
  } catch {
    return [];
  }
}

function diffDeno(snapshot, current) {
  const diff = {};

  if (snapshot.version !== current.version) {
    diff.version = { from: snapshot.version, to: current.version };
  }

  const snapshotPkgs = new Set(snapshot.packages || []);
  const currentPkgs = new Set(current.packages || []);

  const added = [...currentPkgs].filter(p => !snapshotPkgs.has(p));
  const removed = [...snapshotPkgs].filter(p => !currentPkgs.has(p));

  if (added.length > 0) diff.packagesAdded = added;
  if (removed.length > 0) diff.packagesRemoved = removed;

  return Object.keys(diff).length > 0 ? diff : null;
}

function formatDenoDiff(diff) {
  const lines = [];

  if (diff.version) {
    lines.push(`  version: ${diff.version.from} → ${diff.version.to}`);
  }
  if (diff.packagesAdded) {
    diff.packagesAdded.forEach(p => lines.push(`  + ${p}`));
  }
  if (diff.packagesRemoved) {
    diff.packagesRemoved.forEach(p => lines.push(`  - ${p}`));
  }

  return lines.join('\n');
}

module.exports = {
  isDenoAvailable,
  captureDenoVersion,
  captureDenoPackages,
  diffDeno,
  formatDenoDiff,
};
