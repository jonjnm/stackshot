const fs = require('fs');
const path = require('path');
const os = require('os');

/**
 * Capture current environment variables (filtered by prefix or list)
 */
function captureEnv(options = {}) {
  const { prefix, keys } = options;
  const env = process.env;

  if (keys && keys.length > 0) {
    return keys.reduce((acc, k) => {
      if (env[k] !== undefined) acc[k] = env[k];
      return acc;
    }, {});
  }

  if (prefix) {
    return Object.fromEntries(
      Object.entries(env).filter(([k]) => k.startsWith(prefix))
    );
  }

  return { ...env };
}

/**
 * Read a .env file and return parsed key-value pairs
 */
function readDotEnv(filePath) {
  const resolved = path.resolve(filePath);
  if (!fs.existsSync(resolved)) {
    throw new Error(`File not found: ${resolved}`);
  }

  const lines = fs.readFileSync(resolved, 'utf8').split('\n');
  const result = {};

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const idx = trimmed.indexOf('=');
    if (idx === -1) continue;
    const key = trimmed.slice(0, idx).trim();
    const value = trimmed.slice(idx + 1).trim().replace(/^["']|["']$/g, '');
    result[key] = value;
  }

  return result;
}

/**
 * Write key-value pairs to a .env file
 */
function writeDotEnv(filePath, envVars) {
  const lines = Object.entries(envVars).map(([k, v]) => {
    const needsQuotes = /\s/.test(v);
    return `${k}=${needsQuotes ? `"${v}"` : v}`;
  });
  fs.writeFileSync(path.resolve(filePath), lines.join('\n') + '\n', 'utf8');
}

/**
 * Diff two env objects, returning added/removed/changed keys
 */
function diffEnv(base, current) {
  const added = {};
  const removed = {};
  const changed = {};

  for (const [k, v] of Object.entries(current)) {
    if (!(k in base)) added[k] = v;
    else if (base[k] !== v) changed[k] = { from: base[k], to: v };
  }

  for (const k of Object.keys(base)) {
    if (!(k in current)) removed[k] = base[k];
  }

  return { added, removed, changed };
}

module.exports = { captureEnv, readDotEnv, writeDotEnv, diffEnv };
