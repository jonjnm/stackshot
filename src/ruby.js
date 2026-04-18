const { execSync } = require('child_process');

function isRubyAvailable() {
  try {
    execSync('ruby --version', { stdio: 'pipe' });
    return true;
  } catch {
    return false;
  }
}

function captureRubyVersion() {
  try {
    const version = execSync('ruby --version', { stdio: 'pipe' }).toString().trim();
    return version;
  } catch {
    return null;
  }
}

function captureGemPackages() {
  try {
    const output = execSync('gem list --local', { stdio: 'pipe' }).toString().trim();
    const gems = {};
    for (const line of output.split('\n')) {
      const match = line.match(/^(\S+)\s+\((.+)\)/);
      if (match) {
        gems[match[1]] = match[2].split(', ')[0];
      }
    }
    return gems;
  } catch {
    return {};
  }
}

function diffRuby(snapshot, current) {
  const diff = { added: {}, removed: {}, changed: {}, versionChanged: null };
  if (snapshot.version !== current.version) {
    diff.versionChanged = { from: snapshot.version, to: current.version };
  }
  const snapGems = snapshot.gems || {};
  const currGems = current.gems || {};
  for (const [name, ver] of Object.entries(currGems)) {
    if (!snapGems[name]) diff.added[name] = ver;
    else if (snapGems[name] !== ver) diff.changed[name] = { from: snapGems[name], to: ver };
  }
  for (const name of Object.keys(snapGems)) {
    if (!currGems[name]) diff.removed[name] = snapGems[name];
  }
  return diff;
}

function formatRubyDiff(diff) {
  const lines = [];
  if (diff.versionChanged) {
    lines.push(`ruby version: ${diff.versionChanged.from} → ${diff.versionChanged.to}`);
  }
  for (const [name, ver] of Object.entries(diff.added)) lines.push(`+ ${name} (${ver})`);
  for (const [name, ver] of Object.entries(diff.removed)) lines.push(`- ${name} (${ver})`);
  for (const [name, { from, to }] of Object.entries(diff.changed)) lines.push(`~ ${name}: ${from} → ${to}`);
  return lines.join('\n');
}

module.exports = { isRubyAvailable, captureRubyVersion, captureGemPackages, diffRuby, formatRubyDiff };
