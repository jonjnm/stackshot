const { execSync } = require('child_process');
const fs = require('fs');

function isApacheAvailable() {
  try {
    execSync('apachectl -v', { stdio: 'pipe' });
    return true;
  } catch {
    return false;
  }
}

function captureApacheVersion() {
  try {
    const out = execSync('apachectl -v', { stdio: 'pipe' }).toString();
    const match = out.match(/Apache\/(\S+)/);
    return match ? match[1] : null;
  } catch {
    return null;
  }
}

function captureApacheModules() {
  try {
    const out = execSync('apachectl -M 2>/dev/null || apache2ctl -M 2>/dev/null', {
      stdio: 'pipe',
      shell: true
    }).toString();
    return out
      .split('\n')
      .map(l => l.trim())
      .filter(l => l.endsWith('_module (shared)') || l.endsWith('_module (static)'))
      .map(l => l.split(/\s+/)[0])
      .sort();
  } catch {
    return [];
  }
}

function captureApacheConfig() {
  const candidates = [
    '/etc/apache2/apache2.conf',
    '/etc/httpd/conf/httpd.conf',
    '/usr/local/etc/httpd/httpd.conf'
  ];
  for (const p of candidates) {
    if (fs.existsSync(p)) {
      return { path: p, content: fs.readFileSync(p, 'utf8') };
    }
  }
  return null;
}

function diffApache(snap1, snap2) {
  const diff = {};
  if (snap1.version !== snap2.version) {
    diff.version = { from: snap1.version, to: snap2.version };
  }
  const mods1 = new Set(snap1.modules || []);
  const mods2 = new Set(snap2.modules || []);
  const added = [...mods2].filter(m => !mods1.has(m));
  const removed = [...mods1].filter(m => !mods2.has(m));
  if (added.length || removed.length) diff.modules = { added, removed };
  return diff;
}

function formatApacheDiff(diff) {
  const lines = [];
  if (diff.version) lines.push(`  version: ${diff.version.from} → ${diff.version.to}`);
  if (diff.modules) {
    diff.modules.added.forEach(m => lines.push(`  + ${m}`));
    diff.modules.removed.forEach(m => lines.push(`  - ${m}`));
  }
  return lines.join('\n');
}

module.exports = {
  isApacheAvailable,
  captureApacheVersion,
  captureApacheModules,
  captureApacheConfig,
  diffApache,
  formatApacheDiff
};
