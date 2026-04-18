const { isDotnetAvailable, captureDotnetVersion, captureNugetPackages, diffDotnet, formatDotnetDiff } = require('./dotnet');
const { loadSnapshot, createSnapshot } = require('./snapshot');

async function handleDotnetCommand(args, snapshotName) {
  if (!isDotnetAvailable()) {
    console.log('dotnet not available on this machine');
    return;
  }

  const sub = args[0];

  if (sub === 'capture') {
    const version = captureDotnetVersion();
    const packages = captureNugetPackages();
    const snap = loadSnapshot(snapshotName);
    snap.dotnet = { version, packages };
    createSnapshot(snapshotName, snap);
    console.log(`dotnet captured: ${version}, ${packages.length} global tools`);
    return;
  }

  if (sub === 'diff') {
    const snap = loadSnapshot(snapshotName);
    if (!snap.dotnet) {
      console.log('no dotnet data in snapshot');
      return;
    }
    const current = { version: captureDotnetVersion(), packages: captureNugetPackages() };
    const diff = diffDotnet(snap.dotnet, current);
    const hasChanges = diff.versionChanged || diff.added.length || diff.removed.length;
    if (!hasChanges) {
      console.log('dotnet: no changes');
    } else {
      console.log('dotnet diff:');
      console.log(formatDotnetDiff(diff));
    }
    return;
  }

  if (sub === 'show') {
    const snap = loadSnapshot(snapshotName);
    if (!snap.dotnet) {
      console.log('no dotnet data in snapshot');
      return;
    }
    console.log(`version: ${snap.dotnet.version}`);
    console.log(`global tools (${snap.dotnet.packages.length}):`);
    for (const p of snap.dotnet.packages) {
      console.log(`  ${p.name} ${p.version}`);
    }
    return;
  }

  console.log('usage: stackshot dotnet <capture|diff|show> <snapshot>');
}

module.exports = { handleDotnetCommand };
