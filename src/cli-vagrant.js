const { isVagrantAvailable, captureVagrantVersion, captureVagrantBoxes, diffVagrant, formatVagrantDiff } = require('./vagrant');
const { loadSnapshot, createSnapshot } = require('./snapshot');

async function handleVagrantCommand(args) {
  const [sub, snapshotName] = args;

  if (!isVagrantAvailable()) {
    console.log('vagrant not available on this machine');
    return;
  }

  if (sub === 'capture') {
    if (!snapshotName) { console.error('snapshot name required'); process.exit(1); }
    const snapshot = await loadSnapshot(snapshotName);
    const vagrant = { version: captureVagrantVersion(), boxes: captureVagrantBoxes() };
    snapshot.vagrant = vagrant;
    await createSnapshot(snapshotName, snapshot);
    console.log(`captured vagrant: ${vagrant.boxes.length} box(es)`);
    return;
  }

  if (sub === 'diff') {
    if (!snapshotName) { console.error('snapshot name required'); process.exit(1); }
    const snapshot = await loadSnapshot(snapshotName);
    if (!snapshot.vagrant) { console.log('no vagrant data in snapshot'); return; }
    const current = { version: captureVagrantVersion(), boxes: captureVagrantBoxes() };
    const diff = diffVagrant(snapshot.vagrant, current);
    const total = diff.added.length + diff.removed.length + diff.versionChanged.length;
    if (total === 0) { console.log('no vagrant changes'); return; }
    console.log(formatVagrantDiff(diff));
    return;
  }

  if (sub === 'list') {
    const boxes = captureVagrantBoxes();
    if (!boxes.length) { console.log('no vagrant boxes found'); return; }
    boxes.forEach(b => console.log(`  ${b.name} (${b.provider}, ${b.version})`));
    return;
  }

  console.log('usage: stackshot vagrant <capture|diff|list> [snapshot]');
}

module.exports = { handleVagrantCommand };
