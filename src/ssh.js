const fs = require('fs');
const path = require('path');
const os = require('os');

const SSH_DIR = path.join(os.homedir(), '.ssh');

function isSshAvailable() {
  return fs.existsSync(SSH_DIR);
}

function captureSshKeys() {
  if (!isSshAvailable()) return { keys: [] };
  try {
    const files = fs.readdirSync(SSH_DIR);
    const keys = files.filter(f => {
      const ext = path.extname(f);
      return ext === '.pub' || (!ext && !f.startsWith('known_hosts') && !f.startsWith('config') && !f.startsWith('authorized'));
    });
    return { keys };
  } catch {
    return { keys: [] };
  }
}

function captureSshConfig() {
  const configPath = path.join(SSH_DIR, 'config');
  if (!fs.existsSync(configPath)) return { hosts: [] };
  try {
    const content = fs.readFileSync(configPath, 'utf8');
    const hosts = [];
    let current = null;
    for (const line of content.split('\n')) {
      const trimmed = line.trim();
      if (trimmed.toLowerCase().startsWith('host ')) {
        if (current) hosts.push(current);
        current = { host: trimmed.slice(5).trim(), options: {} };
      } else if (current && trimmed.includes(' ')) {
        const [key, ...rest] = trimmed.split(/\s+/);
        current.options[key.toLowerCase()] = rest.join(' ');
      }
    }
    if (current) hosts.push(current);
    return { hosts };
  } catch {
    return { hosts: [] };
  }
}

function diffSsh(snapshot, current) {
  const added = current.keys.filter(k => !snapshot.keys.includes(k));
  const removed = snapshot.keys.filter(k => !current.keys.includes(k));
  const snapshotHosts = snapshot.hosts.map(h => h.host);
  const currentHosts = current.hosts.map(h => h.host);
  const addedHosts = currentHosts.filter(h => !snapshotHosts.includes(h));
  const removedHosts = snapshotHosts.filter(h => !currentHosts.includes(h));
  return { keys: { added, removed }, hosts: { added: addedHosts, removed: removedHosts } };
}

function formatSshDiff(diff) {
  const lines = [];
  if (diff.keys.added.length) lines.push(`  Keys added: ${diff.keys.added.join(', ')}`);
  if (diff.keys.removed.length) lines.push(`  Keys removed: ${diff.keys.removed.join(', ')}`);
  if (diff.hosts.added.length) lines.push(`  SSH hosts added: ${diff.hosts.added.join(', ')}`);
  if (diff.hosts.removed.length) lines.push(`  SSH hosts removed: ${diff.hosts.removed.join(', ')}`);
  return lines.length ? lines.join('\n') : '  No SSH changes.';
}

module.exports = { isSshAvailable, captureSshKeys, captureSshConfig, diffSsh, formatSshDiff };
