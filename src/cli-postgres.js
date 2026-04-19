const { isPostgresAvailable, capturePostgresVersion, capturePostgresDatabases, diffPostgres, formatPostgresDiff } = require('./postgres');
const { loadSnapshot, createSnapshot } = require('./snapshot');

async function handlePostgresCommand(args) {
  const sub = args[0];

  if (sub === 'capture') {
    const name = args[1];
    if (!name) { console.error('Usage: stackshot postgres capture <snapshot>'); process.exit(1); }
    if (!isPostgresAvailable()) { console.error('postgres not available'); process.exit(1); }
    const snap = await loadSnapshot(name) || {};
    snap.postgres = {
      version: capturePostgresVersion(),
      databases: capturePostgresDatabases()
    };
    await createSnapshot(name, snap);
    console.log(`postgres info saved to snapshot "${name}"`);
    return;
  }

  if (sub === 'diff') {
    const [, snap1Name, snap2Name] = args;
    if (!snap1Name || !snap2Name) { console.error('Usage: stackshot postgres diff <snap1> <snap2>'); process.exit(1); }
    const snap1 = await loadSnapshot(snap1Name);
    const snap2 = await loadSnapshot(snap2Name);
    if (!snap1 || !snap2) { console.error('one or both snapshots not found'); process.exit(1); }
    const diff = diffPostgres(snap1, snap2);
    if (!diff.versionChanged && diff.added.length === 0 && diff.removed.length === 0) {
      console.log('no postgres differences');
    } else {
      console.log('postgres diff:');
      console.log(formatPostgresDiff(diff));
    }
    return;
  }

  if (sub === 'show') {
    if (!isPostgresAvailable()) { console.error('postgres not available'); process.exit(1); }
    console.log('version:', capturePostgresVersion());
    console.log('databases:', capturePostgresDatabases().join(', ') || '(none)');
    return;
  }

  console.error('Usage: stackshot postgres <capture|diff|show> [args]');
  process.exit(1);
}

module.exports = { handlePostgresCommand };
