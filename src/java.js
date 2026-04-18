const { execSync } = require('child_process');

function isJavaAvailable() {
  try {
    execSync('java -version', { stdio: 'pipe' });
    return true;
  } catch {
    return false;
  }
}

function captureJavaVersion() {
  try {
    const output = execSync('java -version 2>&1', { stdio: 'pipe' }).toString().trim();
    return output.split('\n')[0];
  } catch {
    return null;
  }
}

function captureMavenPackages() {
  try {
    const output = execSync('mvn dependency:list -q 2>/dev/null', { stdio: 'pipe' }).toString().trim();
    return output ? output.split('\n').filter(l => l.includes(':compile') || l.includes(':runtime')) : [];
  } catch {
    return [];
  }
}

function diffJava(snapshot, current) {
  const diff = { versionChanged: false, added: [], removed: [] };
  if (snapshot.version !== current.version) {
    diff.versionChanged = true;
    diff.oldVersion = snapshot.version;
    diff.newVersion = current.version;
  }
  const snapPkgs = new Set(snapshot.packages || []);
  const currPkgs = new Set(current.packages || []);
  diff.added = [...currPkgs].filter(p => !snapPkgs.has(p));
  diff.removed = [...snapPkgs].filter(p => !currPkgs.has(p));
  return diff;
}

function formatJavaDiff(diff) {
  const lines = [];
  if (diff.versionChanged) {
    lines.push(`  version: ${diff.oldVersion} → ${diff.newVersion}`);
  }
  diff.added.forEach(p => lines.push(`  + ${p}`));
  diff.removed.forEach(p => lines.push(`  - ${p}`));
  return lines.join('\n');
}

module.exports = { isJavaAvailable, captureJavaVersion, captureMavenPackages, diffJava, formatJavaDiff };
