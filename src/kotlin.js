const { execSync } = require('child_process');

function isKotlinAvailable() {
  try {
    execSync('kotlinc -version 2>&1', { stdio: 'pipe' });
    return true;
  } catch {
    return false;
  }
}

function captureKotlinVersion() {
  try {
    const out = execSync('kotlinc -version 2>&1').toString().trim();
    return out.match(/[\d.]+/)?.[0] || 'unknown';
  } catch {
    return null;
  }
}

function captureGradleDependencies() {
  try {
    const out = execSync('gradle dependencies --configuration runtimeClasspath 2>/dev/null', { stdio: 'pipe' }).toString();
    const deps = [];
    const regex = /--- ([\w.:-]+)/g;
    let m;
    while ((m = regex.exec(out)) !== null) deps.push(m[1]);
    return [...new Set(deps)];
  } catch {
    return [];
  }
}

function diffKotlin(snapshot, current) {
  const diff = { kotlinVersion: null, added: [], removed: [] };
  if (snapshot.kotlinVersion !== current.kotlinVersion) {
    diff.kotlinVersion = { from: snapshot.kotlinVersion, to: current.kotlinVersion };
  }
  const snapDeps = new Set(snapshot.gradleDeps || []);
  const currDeps = new Set(current.gradleDeps || []);
  diff.added = [...currDeps].filter(d => !snapDeps.has(d));
  diff.removed = [...snapDeps].filter(dd));
  return diff;
}

function formatKotlinDiff(diff) {
  const lines = [];
  if (diff.kotlinVersion) lines.push(`  kotlin version: ${diff.kotlinVersion.from} → ${diff.kotlinVersion.to}`);
  diff.added.forEach(d => lines.push(`  + ${d}`));
  diff.removed.forEach(d => lines.push(`  - ${d}`));
  return lines.join('\n');
}

module.exports = { isKotlinAvailable, captureKotlinVersion, captureGradleDependencies, diffKotlin, formatKotlinDiff };
