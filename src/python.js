const { execSync } = require('child_process');

function isPythonAvailable() {
  try {
    execSync('python3 --version', { stdio: 'pipe' });
    return true;
  } catch {
    return false;
  }
}

function capturePythonVersion() {
  try {
    const version = execSync('python3 --version', { stdio: 'pipe' }).toString().trim();
    return version;
  } catch {
    return null;
  }
}

function capturePipPackages() {
  try {
    const output = execSync('pip3 list --format=freeze', { stdio: 'pipe' }).toString().trim();
    const packages = {};
    for (const line of output.split('\n')) {
      const [name, version] = line.split('==');
      if (name && version) packages[name.toLowerCase()] = version;
    }
    return packages;
  } catch {
    return {};
  }
}

function diffPython(snapshot, current) {
  const added = {};
  const removed = {};
  const changed = {};

  for (const [pkg, ver] of Object.entries(current)) {
    if (!snapshot[pkg]) added[pkg] = ver;
    else if (snapshot[pkg] !== ver) changed[pkg] = { from: snapshot[pkg], to: ver };
  }
  for (const [pkg, ver] of Object.entries(snapshot)) {
    if (!current[pkg]) removed[pkg] = ver;
  }

  return { added, removed, changed };
}

function formatPythonDiff(diff) {
  const lines = [];
  for (const [pkg, ver] of Object.entries(diff.added)) lines.push(`+ ${pkg}@${ver}`);
  for (const [pkg, ver] of Object.entries(diff.removed)) lines.push(`- ${pkg}@${ver}`);
  for (const [pkg, { from, to }] of Object.entries(diff.changed)) lines.push(`~ ${pkg}: ${from} → ${to}`);
  return lines.join('\n');
}

module.exports = { isPythonAvailable, capturePythonVersion, capturePipPackages, diffPython, formatPythonDiff };
