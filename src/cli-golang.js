const { loadSnapshot, createSnapshot } = require('./snapshot');
const { isGoAvailable, captureGoVersion, captureGoPackages, diffGo, formatGoDiff } = require('./golang');

async function handleGoCommand(args) {
  const [sub, snapshotName] = args;

  if (!isGoAvailable()) {
    console.log('go is not available on this machine');
    return;
  }

  if (sub === 'capture') {
    if (!snapshotName) {
      console.error('Usage: stackshot go capture <snapshot-name>');
      process.exit(1);
    }
    const existing = await loadSnapshot(snapshotName) || {};
    const goData = {
      version: captureGoVersion(),
      packages: captureGoPackages()
    };
    await createSnapshot(snapshotName, { ...existing, go: goData });
    console.log(`go config captured into snapshot "${snapshotName}"`);
    console.log(`  version: ${goData.version}`);
    console.log(`  packages: ${goData.packages.length}`);
    return;
  }

  if (sub === 'diff') {
    if (!snapshotName) {
      console.error('Usage: stackshot go diff <snapshot-name>');
      process.exit(1);
    }
    const snapshot = await loadSnapshot(snapshotName);
    if (!snapshot || !snapshot.go) {
      console.error(`No go data in snapshot "${snapshotName}"`);
      process.exit(1);
    }
    const current = {
      version: captureGoVersion(),
      packages: captureGoPackages()
    };
    const diff = diffGo(snapshot.go, current);
    const hasChanges = diff.versionChanged || diff.added.length || diff.removed.length || diff.changed.length;
    if (!hasChanges) {
      console.log('No differences found');
    } else {
      console.log('Go differences:');
      console.log(formatGoDiff(diff));
    }
    return;
  }

  console.error('Unknown go subcommand. Use: capture, diff');
  process.exit(1);
}

module.exports = { handleGoCommand };
