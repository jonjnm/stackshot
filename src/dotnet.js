const { execSync } = require('child_process');

function isDotnetAvailable() {
  try {
    execSync('dotnet --version', { stdio: 'pipe' });
    return true;
  } catch {
    return false;
  }
}

function captureDotnetVersion() {
  try {
    return execSync('dotnet --version', { stdio: 'pipe' }).toString().trim();
  } catch {
    return null;
  }
}

function captureNugetPackages() {
  try {
    const output = execSync('dotnet tool list -g', { stdio: 'pipe' }).toString();
    const lines = output.split('\n').slice(2).filter(Boolean);
    return lines.map(line => {
      const parts = line.trim().split(/\s+/);
      return { name: parts[0], version: parts[1] };
    }).filter(p => p.name);
  } catch {
    return [];
  }
}

function diffDotnet(snapshot, current) {
  const diff = { added: [], removed: [], versionChanged: false };
  if (snapshot.version !== current.version) diff.versionChanged = true;

  const snapNames = new Set((snapshot.packages || []).map(p => p.name));
  const currNames = new Set((current.packages || []).map(p => p.name));

  for (const p of current.packages || []) {
    if (!snapNames.has(p.name)) diff.added.push(p);
  }
  for (const p of snapshot.packages || []) {
    if (!currNames.has(p.name)) diff.removed.push(p);
  }
  return diff;
}

function formatDotnetDiff(diff) {
  const lines = [];
  if (diff.versionChanged) lines.push('  dotnet version changed');
  for (const p of diff.added) lines.push(`  + ${p.name} ${p.version}`);
  for (const p of diff.removed) lines.push(`  - ${p.name}`);
  return lines.join('\n');
}

module.exports = { isDotnetAvailable, captureDotnetVersion, captureNugetPackages, diffDotnet, formatDotnetDiff };
