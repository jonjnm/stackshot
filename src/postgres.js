const { execSync } = require('child_process');

function isPostgresAvailable() {
  try {
    execSync('psql --version', { stdio: 'pipe' });
    return true;
  } catch {
    return false;
  }
}

function capturePostgresVersion() {
  try {
    const out = execSync('psql --version', { stdio: 'pipe' }).toString().trim();
    return out;
  } catch {
    return null;
  }
}

function capturePostgresDatabases() {
  try {
    const out = execSync('psql -l -t -A', { stdio: 'pipe' }).toString().trim();
    return out.split('\n').map(l => l.split('|')[0]).filter(Boolean);
  } catch {
    return [];
  }
}

function diffPostgres(snap1, snap2) {
  const dbs1 = new Set(snap1.postgres?.databases || []);
  const dbs2 = new Set(snap2.postgres?.databases || []);
  const added = [...dbs2].filter(d => !dbs1.has(d));
  const removed = [...dbs1].filter(d => !dbs2.has(d));
  const versionChanged = snap1.postgres?.version !== snap2.postgres?.version;
  return { added, removed, versionChanged, version1: snap1.postgres?.version, version2: snap2.postgres?.version };
}

function formatPostgresDiff(diff) {
  const lines = [];
  if (diff.versionChanged) {
    lines.push(`  version: ${diff.version1 || 'none'} → ${diff.version2 || 'none'}`);
  }
  diff.added.forEach(d => lines.push(`  + database: ${d}`));
  diff.removed.forEach(d => lines.push(`  - database: ${d}`));
  return lines.join('\n');
}

module.exports = { isPostgresAvailable, capturePostgresVersion, capturePostgresDatabases, diffPostgres, formatPostgresDiff };
