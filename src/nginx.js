const { execSync } = require('child_process');
const fs = require('fs');

function isNginxAvailable() {
  try {
    execSync('nginx -v', { stdio: 'pipe' });
    return true;
  } catch {
    return false;
  }
}

function captureNginxVersion() {
  try {
    const output = execSync('nginx -v 2>&1', { stdio: 'pipe' }).toString().trim();
    const match = output.match(/nginx\/([\d.]+)/);
    return match ? match[1] : null;
  } catch {
    return null;
  }
}

function captureNginxConfig() {
  const commonPaths = [
    '/etc/nginx/nginx.conf',
    '/usr/local/etc/nginx/nginx.conf',
    '/opt/homebrew/etc/nginx/nginx.conf',
  ];
  for (const p of commonPaths) {
    if (fs.existsSync(p)) {
      return { configPath: p, content: fs.readFileSync(p, 'utf8') };
    }
  }
  return { configPath: null, content: null };
}

function diffNginx(snapshot, current) {
  const diff = {};
  if (snapshot.version !== current.version) {
    diff.version = { snapshot: snapshot.version, current: current.version };
  }
  if (snapshot.config?.content !== current.config?.content) {
    diff.config = {
      snapshot: snapshot.config?.configPath || null,
      current: current.config?.configPath || null,
      changed: true,
    };
  }
  return diff;
}

function formatNginxDiff(diff) {
  const lines = [];
  if (diff.version) {
    lines.push(`  version: ${diff.version.snapshot} → ${diff.version.current}`);
  }
  if (diff.config?.changed) {
    lines.push(`  config changed at: ${diff.config.current || diff.config.snapshot}`);
  }
  return lines;
}

module.exports = {
  isNginxAvailable,
  captureNginxVersion,
  captureNginxConfig,
  diffNginx,
  formatNginxDiff,
};
