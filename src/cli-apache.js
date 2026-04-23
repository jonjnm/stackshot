const {
  isApacheAvailable,
  captureApacheVersion,
  captureApacheModules,
  captureApacheConfig,
  diffApache,
  formatApacheDiff
} = require('./apache');
const { loadSnapshot, createSnapshot } = require('./snapshot');

async function handleApacheCommand(args) {
  const [subcommand, snapshotName] = args;

  if (!isApacheAvailable()) {
    console.log('apache not available on this machine');
    return;
  }

  if (subcommand === 'capture') {
    if (!snapshotName) {
      console.error('usage: stackshot apache capture <snapshot-name>');
      process.exit(1);
    }
    const data = {
      version: captureApacheVersion(),
      modules: captureApacheModules(),
      config: captureApacheConfig()
    };
    const snap = await loadSnapshot(snapshotName) || {};
    snap.apache = data;
    await createSnapshot(snapshotName, snap);
    console.log(`apache config captured into snapshot "${snapshotName}"`);
    return;
  }

  if (subcommand === 'diff') {
    const [, snap1Name, snap2Name] = args;
    if (!snap1Name || !snap2Name) {
      console.error('usage: stackshot apache diff <snapshot1> <snapshot2>');
      process.exit(1);
    }
    const snap1 = await loadSnapshot(snap1Name);
    const snap2 = await loadSnapshot(snap2Name);
    if (!snap1 || !snap2) {
      console.error('one or both snapshots not found');
      process.exit(1);
    }
    if (!snap1.apache || !snap2.apache) {
      console.log('no apache data in one or both snapshots');
      return;
    }
    const diff = diffApache(snap1.apache, snap2.apache);
    if (Object.keys(diff).length === 0) {
      console.log('no apache differences');
    } else {
      console.log('apache diff:');
      console.log(formatApacheDiff(diff));
    }
    return;
  }

  if (subcommand === 'show') {
    const version = captureApacheVersion();
    const modules = captureApacheModules();
    console.log(`apache version: ${version || 'unknown'}`);
    console.log(`modules (${modules.length}):`);
    modules.forEach(m => console.log(`  ${m}`));
    return;
  }

  console.error('unknown apache subcommand. use: capture, diff, show');
  process.exit(1);
}

module.exports = { handleApacheCommand };
