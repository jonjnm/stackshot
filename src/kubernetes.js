const { execSync } = require('child_process');

function isKubectlAvailable() {
  try {
    execSync('kubectl version --client --short 2>/dev/null', { stdio: 'pipe' });
    return true;
  } catch {
    return false;
  }
}

function captureKubectlVersion() {
  try {
    const out = execSync('kubectl version --client --short 2>/dev/null', { stdio: 'pipe' }).toString().trim();
    return out;
  } catch {
    return null;
  }
}

function captureKubeContexts() {
  try {
    const out = execSync('kubectl config get-contexts -o name 2>/dev/null', { stdio: 'pipe' }).toString().trim();
    return out ? out.split('\n').map(c => c.trim()).filter(Boolean) : [];
  } catch {
    return [];
  }
}

function captureCurrentContext() {
  try {
    const out = execSync('kubectl config current-context 2>/dev/null', { stdio: 'pipe' }).toString().trim();
    return out || null;
  } catch {
    return null;
  }
}

function diffKubernetes(snap, current) {
  const diff = {};

  if (snap.version !== current.version) {
    diff.version = { from: snap.version, to: current.version };
  }

  if (snap.currentContext !== current.currentContext) {
    diff.currentContext = { from: snap.currentContext, to: current.currentContext };
  }

  const snapCtx = new Set(snap.contexts || []);
  const curCtx = new Set(current.contexts || []);
  const added = [...curCtx].filter(c => !snapCtx.has(c));
  const removed = [...snapCtx].filter(c => !curCtx.has(c));

  if (added.length || removed.length) {
    diff.contexts = { added, removed };
  }

  return diff;
}

function formatKubernetesDiff(diff) {
  const lines = [];
  if (diff.version) lines.push(`  version: ${diff.version.from} → ${diff.version.to}`);
  if (diff.currentContext) lines.push(`  current-context: ${diff.currentContext.from} → ${diff.currentContext.to}`);
  if (diff.contexts) {
    diff.contexts.added.forEach(c => lines.push(`  + context: ${c}`));
    diff.contexts.removed.forEach(c => lines.push(`  - context: ${c}`));
  }
  return lines.join('\n');
}

module.exports = {
  isKubectlAvailable,
  captureKubectlVersion,
  captureKubeContexts,
  captureCurrentContext,
  diffKubernetes,
  formatKubernetesDiff,
};
