const { execSync } = require('child_process');

function isPerlAvailable() {
  try {
    execSync('perl --version', { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

function capturePerlVersion() {
  try {
    const out = execSync('perl -e "print $]"', { encoding: 'utf8' }).trim();
    return out;
  } catch {
    return null;
  }
}

function captureCpanPackages() {
  try {
    const out = execSync('cpan -l 2>/dev/null', { encoding: 'utf8' });
    const packages = {};
    for (const line of out.split('\n')) {
      const parts = line.trim().split(/\s+/);
      if (parts.length >= 2) {
        packages[parts[0]] = parts[1];
      }
    }
    return packages;
  } catch {
    return {};
  }
}

function diffPerl(snapshot, current) {
  const added = {};
  const removed = {};
  const changed = {};

  for (const [pkg, ver] of Object.entries(current.packages || {})) {
    if (!snapshot.packages?.[pkg]) added[pkg] = ver;
    else if (snapshot.packages[pkg] !== ver) changed[pkg] = { from: snapshot.packages[pkg], to: ver };
  }
  for (const [pkg, ver] of Object.entries(snapshot.packages || {})) {
    if (!current.packages?.[pkg]) removed[pkg] = ver;
  }

  const versionChanged = snapshot.version !== current.version
    ? { from: snapshot.version, to: current.version }
    : null;

  return { versionChanged, added, removed, changed };
}

function formatPerlDiff(diff) {
  const lines = [];
  if (diff.versionChanged) lines.push(`perl version: ${diff.versionChanged.from} → ${diff.versionChanged.to}`);
  for (const [p, v] of Object.entries(diff.added)) lines.push(`+ ${p}@${v}`);
  for (const [p, v] of Object.entries(diff.removed)) lines.push(`- ${p}@${v}`);
  for (const [p, c] of Object.entries(diff.changed)) lines.push(`~ ${p}: ${c.from} → ${c.to}`);
  return lines.join('\n');
}

module.exports = { isPerlAvailable, capturePerlVersion, captureCpanPackages, diffPerl, formatPerlDiff };
