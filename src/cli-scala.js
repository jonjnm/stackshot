const { createSnapshot, loadSnapshot } = require('./snapshot');
const { isScalaAvailable, captureScalaVersion, captureScalaPackages, diffScala, formatScalaDiff } = require('./scala');

async function handleScalaCommand(args) {
  const [subcommand, snapshotName] = args;

  if (!isScalaAvailable()) {
    console.log('scala is not available on this machine');
    return;
  }

  if (subcommand === 'capture') {
    if (!snapshotName) {
      console.error('usage: stackshot scala capture <snapshot-name>');
      process.exit(1);
    }
    const version = captureScalaVersion();
    const packages = captureScalaPackages();
    const existing = await loadSnapshot(snapshotName) || {};
    await createSnapshot(snapshotName, { ...existing, scala: { version, packages } });
    console.log(`scala config captured into snapshot "${snapshotName}"`);
    console.log(`  version: ${version}`);
    console.log(`  packages: ${packages.length} found`);
    return;
  }

  if (subcommand === 'diff') {
    if (!snapshotName) {
      console.error('usage: stackshot scala diff <snapshot-name>');
      process.exit(1);
    }
    const snapshot = await loadSnapshot(snapshotName);
    if (!snapshot || !snapshot.scala) {
      console.error(`no scala data in snapshot "${snapshotName}"`);
      process.exit(1);
    }
    const current = { version: captureScalaVersion(), packages: captureScalaPackages() };
    const diff = diffScala(snapshot.scala, current);
    const formatted = formatScalaDiff(diff);
    if (!formatted) {
      console.log('no scala differences found');
    } else {
      console.log('scala differences:');
      console.log(formatted);
    }
    return;
  }

  console.error(`unknown scala subcommand: ${subcommand}`);
  console.error('available: capture, diff');
  process.exit(1);
}

module.exports = { handleScalaCommand };
