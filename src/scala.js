const { execSync } = require('child_process');

function isScalaAvailable() {
  try {
    execSync('scala -version', { stdio: 'pipe' });
    return true;
  } catch {
    return false;
  }
}

function captureScalaVersion() {
  try {
    const output = execSync('scala -version 2>&1', { stdio: 'pipe' }).toString().trim();
    return output;
  } catch {
    return null;
  }
}

function captureScalaPackages() {
  try {
    const output = execSync('cat build.sbt 2>/dev/null || echo ""', { stdio: 'pipe' }).toString().trim();
    const deps = [];
    const regex = /"([^"]+)" [%%]+ "([^"]+)" % "([^"]+)"/g;
    let match;
    while ((match = regex.exec(output)) !== null) {
      deps.push({ org: match[1], name: match[2], version: match[3] });
    }
    return deps;
  } catch {
    return [];
  }
}

function diffScala(snapshot, current) {
  const added = current.packages.filter(p => !snapshot.packages.find(s => s.name === p.name));
  const removed = snapshot.packages.filter(p => !current.packages.find(c => c.name === p.name));
  const versionChanged = current.packages.filter(p => {
    const old = snapshot.packages.find(s => s.name === p.name);
    return old && old.version !== p.version;
  });
  return { added, removed, versionChanged, versionDiff: snapshot.version !== current.version };
}

function formatScalaDiff(diff) {
  const lines = [];
  if (diff.versionDiff) lines.push('  scala version changed');
  diff.added.forEach(p => lines.push(`  + ${p.name} @ ${p.version}`));
  diff.removed.forEach(p => lines.push(`  - ${p.name} @ ${p.version}`));
  diff.versionChanged.forEach(p => lines.push(`  ~ ${p.name} version changed`));
  return lines.join('\n');
}

module.exports = { isScalaAvailable, captureScalaVersion, captureScalaPackages, diffScala, formatScalaDiff };
