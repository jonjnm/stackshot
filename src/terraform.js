const { execSync } = require('child_process');

function isTerraformAvailable() {
  try {
    execSync('terraform version', { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

function captureTerraformVersion() {
  try {
    const out = execSync('terraform version -json', { encoding: 'utf8' });
    const parsed = JSON.parse(out);
    return parsed.terraform_version || null;
  } catch {
    return null;
  }
}

function captureTerraformWorkspaces() {
  try {
    const out = execSync('terraform workspace list 2>/dev/null', { encoding: 'utf8' });
    return out.split('\n')
      .map(l => l.replace('*', '').trim())
      .filter(Boolean);
  } catch {
    return [];
  }
}

function diffTerraform(snapshot, current) {
  const diff = {};
  if (snapshot.version !== current.version) {
    diff.version = { snapshot: snapshot.version, current: current.version };
  }
  const snapshotWs = new Set(snapshot.workspaces || []);
  const currentWs = new Set(current.workspaces || []);
  const added = [...currentWs].filter(w => !snapshotWs.has(w));
  const removed = [...snapshotWs].filter(w => !currentWs.has(w));
  if (added.length || removed.length) diff.workspaces = { added, removed };
  return diff;
}

function formatTerraformDiff(diff) {
  const lines = [];
  if (diff.version) {
    lines.push(`  version: ${diff.version.snapshot} → ${diff.version.current}`);
  }
  if (diff.workspaces) {
    diff.workspaces.added.forEach(w => lines.push(`  + workspace: ${w}`));
    diff.workspaces.removed.forEach(w => lines.push(`  - workspace: ${w}`));
  }
  return lines.join('\n');
}

module.exports = { isTerraformAvailable, captureTerraformVersion, captureTerraformWorkspaces, diffTerraform, formatTerraformDiff };
