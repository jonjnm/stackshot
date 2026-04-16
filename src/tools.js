const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

/**
 * Capture installed global npm packages
 */
function captureNpmGlobals() {
  try {
    const output = execSync('npm list -g --depth=0 --json', { encoding: 'utf8' });
    const parsed = JSON.parse(output);
    return Object.keys(parsed.dependencies || {}).map(name => ({
      name,
      version: parsed.dependencies[name].version
    }));
  } catch {
    return [];
  }
}

/**
 * Capture tool versions for common dev tools
 */
function captureToolVersions() {
  const tools = [
    { name: 'node', cmd: 'node --version' },
    { name: 'npm', cmd: 'npm --version' },
    { name: 'git', cmd: 'git --version' },
    { name: 'python3', cmd: 'python3 --version' },
    { name: 'docker', cmd: 'docker --version' },
    { name: 'yarn', cmd: 'yarn --version' },
  ];

  const versions = {};
  for (const tool of tools) {
    try {
      const out = execSync(tool.cmd, { encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] });
      versions[tool.name] = out.trim().split('\n')[0];
    } catch {
      versions[tool.name] = null;
    }
  }
  return versions;
}

/**
 * Diff two tool version snapshots
 */
function diffTools(base, current) {
  const keys = new Set([...Object.keys(base), ...Object.keys(current)]);
  const changes = {};
  for (const key of keys) {
    if (base[key] !== current[key]) {
      changes[key] = { from: base[key] ?? null, to: current[key] ?? null };
    }
  }
  return changes;
}

module.exports = { captureNpmGlobals, captureToolVersions, diffTools };
