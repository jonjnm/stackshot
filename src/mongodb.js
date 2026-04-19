const { execSync } = require('child_process');

function isMongoAvailable() {
  try {
    execSync('mongosh --version', { stdio: 'pipe' });
    return true;
  } catch {
    return false;
  }
}

function captureMongoVersion() {
  try {
    const out = execSync('mongosh --version', { stdio: 'pipe' }).toString().trim();
    return out.split('\n')[0];
  } catch {
    return null;
  }
}

function captureMongoDatabases() {
  try {
    const out = execSync('mongosh --quiet --eval "db.adminCommand({listDatabases:1}).databases.map(d=>d.name).join(\\n)"', { stdio: 'pipe' }).toString().trim();
    return out ? out.split('\n').filter(Boolean) : [];
  } catch {
    return [];
  }
}

function diffMongo(snapshot, current) {
  const prev = new Set(snapshot.databases || []);
  const curr = new Set(current.databases || []);
  const added = [...curr].filter(d => !prev.has(d));
  const removed = [...prev].filter(d => !curr.has(d));
  const versionChanged = snapshot.version !== current.version;
  return { added, removed, versionChanged, prevVersion: snapshot.version, currVersion: current.version };
}

function formatMongoDiff(diff) {
  const lines = [];
  if (diff.versionChanged) lines.push(`  version: ${diff.prevVersion} → ${diff.currVersion}`);
  diff.added.forEach(d => lines.push(`  + database: ${d}`));
  diff.removed.forEach(d => lines.push(`  - database: ${d}`));
  return lines.join('\n');
}

module.exports = { isMongoAvailable, captureMongoVersion, captureMongoDatabases, diffMongo, formatMongoDiff };
