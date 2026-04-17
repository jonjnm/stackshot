const { execSync } = require('child_process');

function isNpmAvailable() {
  try {
    execSync('npm --version', { stdio: 'pipe' });
    return true;
  } catch {
    return false;
  }
}

function captureNpmConfig() {
  try {
    const output = execSync('npm config list --json', { stdio: 'pipe' }).toString();
    return JSON.parse(output);
  } catch {
    return {};
  }
}

function diffNpmConfig(snapshot, current) {
  const diff = { added: {}, removed: {}, changed: {} };
  for (const key of Object.keys(current)) {
    if (!(key in snapshot)) diff.added[key] = current[key];
    else if (snapshot[key] !== current[key]) diff.changed[key] = { from: snapshot[key], to: current[key] };
  }
  for (const key of Object.keys(snapshot)) {
    if (!(key in current)) diff.removed[key] = snapshot[key];
  }
  return diff;
}

function formatNpmDiff(diff) {
  const lines = [];
  for (const [k, v] of Object.entries(diff.added)) lines.push(`+ ${k} = ${v}`);
  for (const [k, v] of Object.entries(diff.removed)) lines.push(`- ${k} = ${v}`);
  for (const [k, v] of Object.entries(diff.changed)) lines.push(`~ ${k}: ${v.from} → ${v.to}`);
  return lines.join('\n');
}

module.exports = { isNpmAvailable, captureNpmConfig, diffNpmConfig, formatNpmDiff };
