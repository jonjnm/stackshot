const { isPythonAvailable, capturePythonVersion, capturePipPackages, diffPython, formatPythonDiff } = require('./python');
const { createSnapshot, loadSnapshot } = require('./snapshot');

async function handlePythonCommand(args) {
  const [sub, snapshotName] = args;

  if (!isPythonAvailable()) {
    console.error('python3 is not available on this system');
    process.exit(1);
  }

  if (sub === 'capture') {
    if (!snapshotName) { console.error('Usage: stackshot python capture <name>'); process.exit(1); }
    const snapshot = await loadSnapshot(snapshotName) || {};
    snapshot.python = {
      version: capturePythonVersion(),
      packages: capturePipPackages()
    };
    await createSnapshot(snapshotName, snapshot);
    console.log(`Python environment captured into snapshot "${snapshotName}"`);
    return;
  }

  if (sub === 'diff') {
    if (!snapshotName) { console.error('Usage: stackshot python diff <name>'); process.exit(1); }
    const snapshot = await loadSnapshot(snapshotName);
    if (!snapshot || !snapshot.python) {
      console.error(`No python data found in snapshot "${snapshotName}"`);
      process.exit(1);
    }
    const current = capturePipPackages();
    const diff = diffPython(snapshot.python.packages, current);
    const hasChanges = Object.keys(diff.added).length || Object.keys(diff.removed).length || Object.keys(diff.changed).length;
    if (!hasChanges) {
      console.log('No differences in pip packages.');
    } else {
      console.log(`Diff vs snapshot "${snapshotName}":\n`);
      console.log(formatPythonDiff(diff));
    }
    return;
  }

  if (sub === 'show') {
    if (!snapshotName) { console.error('Usage: stackshot python show <name>'); process.exit(1); }
    const snapshot = await loadSnapshot(snapshotName);
    if (!snapshot || !snapshot.python) {
      console.error(`No python data found in snapshot "${snapshotName}"`);
      process.exit(1);
    }
    console.log(`Python version: ${snapshot.python.version}`);
    console.log(`Packages (${Object.keys(snapshot.python.packages).length}):`);
    for (const [pkg, ver] of Object.entries(snapshot.python.packages)) {
      console.log(`  ${pkg}==${ver}`);
    }
    return;
  }

  console.error('Unknown python subcommand. Use: capture, diff, show');
  process.exit(1);
}

module.exports = { handlePythonCommand };
