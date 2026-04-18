const { isSwiftAvailable, captureSwiftVersion, captureSwiftPackages, diffSwift, formatSwiftDiff } = require('./swift');
const { loadSnapshot, createSnapshot } = require('./snapshot');

async function handleSwiftCommand(args) {
  const [sub, snapshotName] = args;

  if (sub === 'capture') {
    if (!snapshotName) return console.error('Usage: stackshot swift capture <snapshot>');
    if (!isSwiftAvailable()) return console.error('swift not available on this system');
    const existing = loadSnapshot(snapshotName) || {};
    existing.swift = {
      version: captureSwiftVersion(),
      packages: captureSwiftPackages()
    };
    createSnapshot(snapshotName, existing);
    console.log(`swift config captured into snapshot "${snapshotName}"`);
    return;
  }

  if (sub === 'diff') {
    if (!snapshotName) return console.error('Usage: stackshot swift diff <snapshot>');
    const snapshot = loadSnapshot(snapshotName);
    if (!snapshot) return console.error(`snapshot "${snapshotName}" not found`);
    if (!snapshot.swift) return console.error('no swift data in snapshot');
    if (!isSwiftAvailable()) return console.error('swift not available on this system');
    const current = {
      version: captureSwiftVersion(),
      packages: captureSwiftPackages()
    };
    const diff = diffSwift(snapshot.swift, current);
    const out = formatSwiftDiff(diff);
    if (!out.trim()) {
      console.log('no swift differences found');
    } else {
      console.log('swift differences:');
      console.log(out);
    }
    return;
  }

  console.log('Usage: stackshot swift <capture|diff> <snapshot>');
}

module.exports = { handleSwiftCommand };
