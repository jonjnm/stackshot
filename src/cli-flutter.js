const { isFlutterAvailable, captureFlutterVersion, captureFlutterPackages, diffFlutter, formatFlutterDiff } = require('./flutter');
const { loadSnapshot, createSnapshot } = require('./snapshot');

async function handleFlutterCommand(args, snapshotName) {
  const cmd = args[0];

  if (!await isFlutterAvailable()) {
    console.log('flutter not available on this machine');
    return;
  }

  if (cmd === 'capture') {
    const snapshot = await loadSnapshot(snapshotName);
    const version = await captureFlutterVersion();
    const packages = await captureFlutterPackages();
    snapshot.flutter = { version, packages };
    await createSnapshot(snapshotName, snapshot);
    console.log(`flutter captured: ${version}, ${packages.length} packages`);
    return;
  }

  if (cmd === 'diff') {
    const snapshot = await loadSnapshot(snapshotName);
    if (!snapshot.flutter) {
      console.log('no flutter data in snapshot');
      return;
    }
    const current = {
      version: await captureFlutterVersion(),
      packages: await captureFlutterPackages()
    };
    const d = diffFlutter(snapshot.flutter, current);
    console.log(formatFlutterDiff(d));
    return;
  }

  if (cmd === 'show') {
    const snapshot = await loadSnapshot(snapshotName);
    if (!snapshot.flutter) {
      console.log('no flutter data in snapshot');
      return;
    }
    const { version, packages } = snapshot.flutter;
    console.log(`flutter version: ${version}`);
    console.log(`packages (${packages.length}):`);
    packages.forEach(p => console.log(`  ${p.name} ${p.version}`));
    return;
  }

  console.log('usage: stackshot flutter <capture|diff|show> <snapshot>');
}

module.exports = { handleFlutterCommand };
