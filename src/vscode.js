const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

function isCodeAvailable() {
  try {
    execSync('code --version', { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

function captureVSCodeExtensions() {
  if (!isCodeAvailable()) return [];
  try {
    const output = execSync('code --list-extensions', { encoding: 'utf8' });
    return output.trim().split('\n').filter(Boolean).sort();
  } catch {
    return [];
  }
}

function captureVSCodeSettings() {
  const settingsPaths = [
    path.join(process.env.HOME || '', 'Library/Application Support/Code/User/settings.json'),
    path.join(process.env.HOME || '', '.config/Code/User/settings.json'),
    path.join(process.env.APPDATA || '', 'Code/User/settings.json'),
  ];
  for (const p of settingsPaths) {
    if (fs.existsSync(p)) {
      try {
        return JSON.parse(fs.readFileSync(p, 'utf8'));
      } catch {
        return {};
      }
    }
  }
  return {};
}

function diffVSCode(snapshot, current) {
  const addedExts = current.extensions.filter(e => !snapshot.extensions.includes(e));
  const removedExts = snapshot.extensions.filter(e => !current.extensions.includes(e));
  return { addedExtensions: addedExts, removedExtensions: removedExts };
}

function formatVSCodeDiff(diff) {
  const lines = [];
  if (diff.addedExtensions.length) {
    lines.push('Extensions added:');
    diff.addedExtensions.forEach(e => lines.push(`  + ${e}`));
  }
  if (diff.removedExtensions.length) {
    lines.push('Extensions removed:');
    diff.removedExtensions.forEach(e => lines.push(`  - ${e}`));
  }
  return lines.join('\n');
}

module.exports = { isCodeAvailable, captureVSCodeExtensions, captureVSCodeSettings, diffVSCode, formatVSCodeDiff };
