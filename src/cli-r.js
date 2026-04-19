const { isRAvailable, captureRVersion, captureCranPackages, diffR, formatRDiff } = require('./r');
const { createSnapshot, loadSnapshot } = require('./snapshot');

async function handleRCommand(args) {
  const [sub, ...rest] = args;

  if (!isRAvailable()) {
    console.log('R is not available on this machine.');
    return;
  }

  if (sub === 'capture') {
    const [name] = rest;
    if (!name) { console.error('Usage: stackshot r capture <name>'); process.exit(1); }
    const data = { version: captureRVersion(), packages: captureCranPackages() };
    await createSnapshot(name, 'r', data);
    console.log(`R snapshot "${name}" saved (${data.packages.length} packages).`);

  } else if (sub === 'diff') {
    const [name] = rest;
    if (!name) { console.error('Usage: stackshot r diff <name>'); process.exit(1); }
    const snap = await loadSnapshot(name, 'r');
    if (!snap) { console.error(`Snapshot "${name}" not found.`); process.exit(1); }
    const current = { version: captureRVersion(), packages: captureCranPackages() };
    const diff = diffR(snap, current);
    if (!diff.versionChanged && !diff.added.length && !diff.removed.length) {
      console.log('No changes.');
    } else {
      console.log(formatRDiff(diff));
    }

  } else if (sub === 'show') {
    const [name] = rest;
    if (!name) { console.error('Usage: stackshot r show <name>'); process.exit(1); }
    const snap = await loadSnapshot(name, 'r');
    if (!snap) { console.error(`Snapshot "${name}" not found.`); process.exit(1); }
    console.log(`R version: ${snap.version}`);
    console.log(`Packages (${snap.packages.length}):`);
    snap.packages.forEach(p => console.log(`  ${p}`));

  } else {
    console.log('Usage: stackshot r <capture|diff|show> <name>');
  }
}

module.exports = { handleRCommand };
