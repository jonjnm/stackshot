const { execSync } = require('child_process');

function isRustAvailable() {
  try {
    execSync('rustc --version', { stdio: 'pipe' });
    return true;
  } catch {
    return false;
  }
}

function captureRustVersion() {
  try {
    const version = execSync('rustc --version', { stdio: 'pipe' }).toString().trim();
    const toolchain = execSync('rustup show active-toolchain', { stdio: 'pipe' }).toString().trim();
    return { version, toolchain };
  } catch {
    return { version: null, toolchain: null };
  }
}

function captureCargoPackages() {
  try {
    const output = execSync('cargo install --list', { stdio: 'pipe' }).toString().trim();
    const packages = {};
    const lines = output.split('\n');
    for (const line of lines) {
      const match = line.match(/^(\S+) v([\d.]+)/);
      if (match) packages[match[1]] = match[2];
    }
    return packages;
  } catch {
    return {};
  }
}

function diffRust(snapshot, current) {
  const diff = { added: {}, removed: {}, changed: {}, versionChanged: null };

  if (snapshot.version?.version !== current.version?.version) {
    diff.versionChanged = { from: snapshot.version?.version, to: current.version?.version };
  }

  const snapPkgs = snapshot.packages || {};
  const currPkgs = current.packages || {};

  for (const [name, ver] of Object.entries(currPkgs)) {
    if (!snapPkgs[name]) diff.added[name] = ver;
    else if (snapPkgs[name] !== ver) diff.changed[name] = { from: snapPkgs[name], to: ver };
  }
  for (const [name, ver] of Object.entries(snapPkgs)) {
    if (!currPkgs[name]) diff.removed[name] = ver;
  }

  return diff;
}

function formatRustDiff(diff) {
  const lines = [];
  if (diff.versionChanged) lines.push(`  rust: ${diff.versionChanged.from} → ${diff.versionChanged.to}`);
  for (const [n, v] of Object.entries(diff.added)) lines.push(`  + ${n}@${v}`);
  for (const [n, v] of Object.entries(diff.removed)) lines.push(`  - ${n}@${v}`);
  for (const [n, c] of Object.entries(diff.changed)) lines.push(`  ~ ${n}: ${c.from} → ${c.to}`);
  return lines.join('\n');
}

module.exports = { isRustAvailable, captureRustVersion, captureCargoPackages, diffRust, formatRustDiff };
