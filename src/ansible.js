const { execSync } = require('child_process');

function isAnsibleAvailable() {
  try {
    execSync('ansible --version', { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

function captureAnsibleVersion() {
  try {
    const out = execSync('ansible --version', { encoding: 'utf8' });
    const match = out.match(/ansible\s+([\d.]+)/);
    return match ? match[1] : null;
  } catch {
    return null;
  }
}

function captureAnsibleCollections() {
  try {
    const out = execSync('ansible-galaxy collection list', { encoding: 'utf8' });
    const collections = {};
    for (const line of out.split('\n')) {
      const match = line.match(/^([\w.]+)\s+([\d.]+)/);
      if (match) collections[match[1]] = match[2];
    }
    return collections;
  } catch {
    return {};
  }
}

function diffAnsible(snap1, snap2) {
  const added = [];
  const removed = [];
  const changed = [];
  const c1 = snap1.collections || {};
  const c2 = snap2.collections || {};
  for (const k of Object.keys(c2)) {
    if (!c1[k]) added.push(k);
    else if (c1[k] !== c2[k]) changed.push({ name: k, from: c1[k], to: c2[k] });
  }
  for (const k of Object.keys(c1)) {
    if (!c2[k]) removed.push(k);
  }
  return { added, removed, changed, versionChanged: snap1.version !== snap2.version };
}

function formatAnsibleDiff(diff) {
  const lines = [];
  if (diff.versionChanged) lines.push('  ansible version changed');
  for (const c of diff.added) lines.push(`  + ${c}`);
  for (const c of diff.removed) lines.push(`  - ${c}`);
  for (const c of diff.changed) lines.push(`  ~ ${c.name}: ${c.from} -> ${c.to}`);
  return lines.join('\n');
}

module.exports = { isAnsibleAvailable, captureAnsibleVersion, captureAnsibleCollections, diffAnsible, formatAnsibleDiff };
