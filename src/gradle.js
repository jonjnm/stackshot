const { execSync } = require('child_process');

function isGradleAvailable() {
  try {
    execSync('gradle --version', { stdio: 'pipe' });
    return true;
  } catch {
    return false;
  }
}

function captureGradleVersion() {
  try {
    const output = execSync('gradle --version', { stdio: 'pipe' }).toString();
    const match = output.match(/Gradle ([\d.]+)/);
    return match ? match[1] : null;
  } catch {
    return null;
  }
}

function captureGradlePlugins(projectDir = process.cwd()) {
  try {
    const output = execSync('gradle dependencies --configuration classpath', {
      stdio: 'pipe',
      cwd: projectDir
    }).toString();
    const plugins = [];
    const lines = output.split('\n');
    for (const line of lines) {
      const match = line.match(/---\s+([\w.:-]+):([\d.]+)/);
      if (match) {
        plugins.push({ name: match[1], version: match[2] });
      }
    }
    return plugins;
  } catch {
    return [];
  }
}

function diffGradle(snapshot, current) {
  const added = current.plugins.filter(
    c => !snapshot.plugins.find(s => s.name === c.name)
  );
  const removed = snapshot.plugins.filter(
    s => !current.plugins.find(c => c.name === s.name)
  );
  const changed = current.plugins.filter(c => {
    const s = snapshot.plugins.find(p => p.name === c.name);
    return s && s.version !== c.version;
  }).map(c => ({
    name: c.name,
    from: snapshot.plugins.find(p => p.name === c.name).version,
    to: c.version
  }));
  const versionChanged = snapshot.version !== current.version;
  return { versionChanged, added, removed, changed };
}

function formatGradleDiff(diff) {
  const lines = [];
  if (diff.versionChanged) lines.push('  gradle version changed');
  diff.added.forEach(p => lines.push(`  + ${p.name}@${p.version}`));
  diff.removed.forEach(p => lines.push(`  - ${p.name}@${p.version}`));
  diff.changed.forEach(p => lines.push(`  ~ ${p.name}: ${p.from} → ${p.to}`));
  return lines.join('\n');
}

module.exports = {
  isGradleAvailable,
  captureGradleVersion,
  captureGradlePlugins,
  diffGradle,
  formatGradleDiff
};
