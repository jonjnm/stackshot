const { execSync } = require('child_process');

function isMysqlAvailable() {
  try {
    execSync('mysql --version', { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

function captureMysqlVersion() {
  try {
    const out = execSync('mysql --version', { encoding: 'utf8' }).trim();
    return out;
  } catch {
    return null;
  }
}

function captureMysqlDatabases() {
  try {
    const out = execSync('mysql -e "SHOW DATABASES;" 2>/dev/null', { encoding: 'utf8' });
    return out.split('\n').map(l => l.trim()).filter(l => l && l !== 'Database');
  } catch {
    return [];
  }
}

function diffMysql(snap1, snap2) {
  const dbs1 = new Set(snap1.mysql?.databases || []);
  const dbs2 = new Set(snap2.mysql?.databases || []);
  const added = [...dbs2].filter(d => !dbs1.has(d));
  const removed = [...dbs1].filter(d => !dbs2.has(d));
  const versionChanged = snap1.mysql?.version !== snap2.mysql?.version;
  return { added, removed, versionChanged, oldVersion: snap1.mysql?.version, newVersion: snap2.mysql?.version };
}

function formatMysqlDiff(diff) {
  const lines = [];
  if (diff.versionChanged) {
    lines.push(`  version: ${diff.oldVersion || 'none'} -> ${diff.newVersion || 'none'}`);
  }
  diff.added.forEach(d => lines.push(`  + database: ${d}`));
  diff.removed.forEach(d => lines.push(`  - database: ${d}`));
  return lines.join('\n');
}

module.exports = { isMysqlAvailable, captureMysqlVersion, captureMysqlDatabases, diffMysql, formatMysqlDiff };
