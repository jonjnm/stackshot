const { createSnapshot, loadSnapshot } = require('./snapshot');
const { isRustAvailable, captureRustVersion, captureCargoPackages, diffRust, formatRustDiff } = require('./rust');

async function handleRustCommand(args) {
  const [subcommand, snapshotName] = args;

  if (!isRustAvailable()) {
    console.log('rust is not available on this machine');
    return;
  }

  if (subcommand === 'capture') {
    if (!snapshotName) { console.error('snapshot name required'); process.exit(1); }
    const snapshot = await loadSnapshot(snapshotName);
    snapshot.rust = {
      version: captureRustVersion(),
      packages: captureCargoPackages()
    };
    await createSnapshot(snapshotName, snapshot);
    console.log(`rust config captured into snapshot '${snapshotName}'`);
    return;
  }

  if (subcommand === 'diff') {
    if (!snapshotName) { console.error('snapshot name required'); process.exit(1); }
    const snapshot = await loadSnapshot(snapshotName);
    if (!snapshot.rust) { console.log('no rust data in snapshot'); return; }
    const current = { version: captureRustVersion(), packages: captureCargoPackages() };
    const diff = diffRust(snapshot.rust, current);
    const hasChanges = diff.versionChanged ||
      Object.keys(diff.added).length ||
      Object.keys(diff.removed).length ||
      Object.keys(diff.changed).length;
    if (!hasChanges) { console.log('no rust changes'); return; }
    console.log('rust diff:');
    console.log(formatRustDiff(diff));
    return;
  }

  if (subcommand === 'show') {
    const version = captureRustVersion();
    const packages = captureCargoPackages();
    console.log(`rust version: ${version.version || 'unknown'}`);
    console.log(`toolchain: ${version.toolchain || 'unknown'}`);
    console.log(`cargo packages (${Object.keys(packages).length}):`);
    for (const [name, ver] of Object.entries(packages)) {
      console.log(`  ${name}@${ver}`);
    }
    return;
  }

  console.log('usage: stackshot rust <capture|diff|show> [snapshot-name]');
}

module.exports = { handleRustCommand };
