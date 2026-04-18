const { execSync } = require('child_process');

function isNpmAvailable() {
  try {
    execSync('npm --version', { stdio: 'pipe' });
    return true;
  } catch {
    return false;
  }
}

async function captureNpmConfig() {
  try {
    const raw = execSync('npm config list --json', { stdio: 'pipe' }).toString();
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

function diffNpmConfig(saved, current) {
  const diff = {};
  const allKeys = new Set([...Object.keys(saved), ...Object.keys(current)]);
  for (const key of allKeys) {
    const oldVal = saved[key];
    const newVal = current[key];
    if (JSON.stringify(oldVal) !== JSON.stringify(newVal)) {
      diff[key] = { old: oldVal, new: newVal };
    }
  }
  return diff;
}

function formatNpmDiff(diff) {
  const lines = [];
  for (const [key, { old: oldVal, new: newVal }] of Object.entries(diff)) {
    if (oldVal === undefined) {
      lines.push(`+ ${key}: ${newVal}`);
    } else if (newVal === undefined) {
      lines.push(`- ${key}: ${oldVal}`);
    } else {
      lines.push(`~ ${key}: ${oldVal} -> ${newVal}`);
    }
  }
  return lines.join('\n');
}

module.exports = { isNpmAvailable, captureNpmConfig, diffNpmConfig, formatNpmDiff };
