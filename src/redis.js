const { execSync } = require('child_process');

function isRedisAvailable() {
  try {
    execSync('redis-cli --version', { stdio: 'pipe' });
    return true;
  } catch {
    return false;
  }
}

function captureRedisVersion() {
  try {
    const out = execSync('redis-cli --version', { stdio: 'pipe' }).toString().trim();
    return out.replace('Redis server v=', '').split(' ')[0];
  } catch {
    return null;
  }
}

function captureRedisConfig() {
  try {
    const out = execSync('redis-cli config get *', { stdio: 'pipe' }).toString().trim();
    const lines = out.split('\n');
    const config = {};
    for (let i = 0; i < lines.length - 1; i += 2) {
      config[lines[i].trim()] = lines[i + 1].trim();
    }
    return config;
  } catch {
    return {};
  }
}

function diffRedis(snap, current) {
  const added = {}, removed = {}, changed = {};
  for (const key of Object.keys(current)) {
    if (!(key in snap)) added[key] = current[key];
    else if (snap[key] !== current[key]) changed[key] = { from: snap[key], to: current[key] };
  }
  for (const key of Object.keys(snap)) {
    if (!(key in current)) removed[key] = snap[key];
  }
  return { added, removed, changed };
}

function formatRedisDiff(diff) {
  const lines = [];
  for (const [k, v] of Object.entries(diff.added)) lines.push(`+ ${k}: ${v}`);
  for (const [k, v] of Object.entries(diff.removed)) lines.push(`- ${k}: ${v}`);
  for (const [k, v] of Object.entries(diff.changed)) lines.push(`~ ${k}: ${v.from} → ${v.to}`);
  return lines.join('\n');
}

module.exports = { isRedisAvailable, captureRedisVersion, captureRedisConfig, diffRedis, formatRedisDiff };
