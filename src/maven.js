const { execSync } = require('child_process');

function isMavenAvailable() {
  try {
    execSync('mvn --version', { stdio: 'pipe' });
    return true;
  } catch {
    return false;
  }
}

function captureMavenVersion() {
  try {
    const output = execSync('mvn --version', { stdio: 'pipe' }).toString().trim();
    const match = output.match(/Apache Maven ([\d.]+)/);
    return match ? match[1] : output.split('\n')[0];
  } catch {
    return null;
  }
}

function captureMavenPlugins() {
  try {
    const output = execSync('mvn help:effective-pom 2>/dev/null | grep -A1 "<plugin>" | grep "<artifactId>" | sort -u', { stdio: 'pipe', shell: true }).toString().trim();
    if (!output) return [];
    return output.split('\n')
      .map(l => l.replace(/<\/?artifactId>/g, '').trim())
      .filter(Boolean);
  } catch {
    return [];
  }
}

function diffMaven(snapshot, current) {
  const diff = {};
  if (snapshot.version !== current.version) {
    diff.version = { from: snapshot.version, to: current.version };
  }
  const snapshotPlugins = new Set(snapshot.plugins || []);
  const currentPlugins = new Set(current.plugins || []);
  const added = [...currentPlugins].filter(p => !snapshotPlugins.has(p));
  const removed = [...snapshotPlugins].filter(p => !currentPlugins.has(p));
  if (added.length || removed.length) {
    diff.plugins = { added, removed };
  }
  return diff;
}

function formatMavenDiff(diff) {
  const lines = [];
  if (diff.version) {
    lines.push(`  version: ${diff.version.from} → ${diff.version.to}`);
  }
  if (diff.plugins) {
    diff.plugins.added.forEach(p => lines.push(`  + plugin: ${p}`));
    diff.plugins.removed.forEach(p => lines.push(`  - plugin: ${p}`));
  }
  return lines.join('\n');
}

module.exports = { isMavenAvailable, captureMavenVersion, captureMavenPlugins, diffMaven, formatMavenDiff };
