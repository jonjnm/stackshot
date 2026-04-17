const { execSync } = require('child_process');
const os = require('os');
const path = require('path');
const fs = require('fs');

function isZshAvailable() {
  try {
    execSync('which zsh', { stdio: 'pipe' });
    return true;
  } catch {
    return false;
  }
}

function captureShellAliases() {
  const shell = process.env.SHELL || '';
  const aliases = {};

  try {
    const raw = execSync('bash -i -c alias 2>/dev/null || zsh -i -c alias 2>/dev/null', {
      stdio: 'pipe',
      timeout: 5000,
    }).toString();

    for (const line of raw.split('\n')) {
      const match = line.match(/^alias\s+([^=]+)=['"](.*)['"]$/);
      if (match) aliases[match[1].trim()] = match[2];
    }
  } catch {
    // ignore errors
  }

  return aliases;
}

function captureShellConfig() {
  const home = os.homedir();
  const candidates = ['.bashrc', '.bash_profile', '.zshrc', '.zprofile', '.profile'];
  const configs = {};

  for (const file of candidates) {
    const full = path.join(home, file);
    if (fs.existsSync(full)) {
      configs[file] = fs.readFileSync(full, 'utf8');
    }
  }

  return configs;
}

function diffShell(snapshot, current) {
  const diff = { aliases: { added: {}, removed: {}, changed: {} }, configs: { added: [], removed: [] } };
  const sa = snapshot.aliases || {};
  const ca = current.aliases || {};

  for (const k of Object.keys(ca)) {
    if (!(k in sa)) diff.aliases.added[k] = ca[k];
    else if (sa[k] !== ca[k]) diff.aliases.changed[k] = { from: sa[k], to: ca[k] };
  }
  for (const k of Object.keys(sa)) {
    if (!(k in ca)) diff.aliases.removed[k] = sa[k];
  }

  const sc = Object.keys(snapshot.configs || {});
  const cc = Object.keys(current.configs || {});
  diff.configs.added = cc.filter(f => !sc.includes(f));
  diff.configs.removed = sc.filter(f => !cc.includes(f));

  return diff;
}

function formatShellDiff(diff) {
  const lines = [];
  for (const [k, v] of Object.entries(diff.aliases.added)) lines.push(`+ alias ${k}='${v}'`);
  for (const [k, v] of Object.entries(diff.aliases.removed)) lines.push(`- alias ${k}='${v}'`);
  for (const [k, v] of Object.entries(diff.aliases.changed)) lines.push(`~ alias ${k}: '${v.from}' -> '${v.to}'`);
  for (const f of diff.configs.added) lines.push(`+ config file: ${f}`);
  for (const f of diff.configs.removed) lines.push(`- config file: ${f}`);
  return lines;
}

module.exports = { isZshAvailable, captureShellAliases, captureShellConfig, diffShell, formatShellDiff };
