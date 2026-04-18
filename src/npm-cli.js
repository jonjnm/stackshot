const { loadSnapshot, createSnapshot } = require('./snapshot');
const { isNpmAvailable, captureNpmConfig, diffNpmConfig, formatNpmDiff } = require('./npm');

async function handleNpmCommand(args) {
  const [sub, ...rest] = args;

  if (!isNpmAvailable()) {
    console.error('npm is not available on this system');
    process.exit(1);
  }

  if (sub === 'capture') {
    const [snapshotName] = rest;
    if (!snapshotName) {
      console.error('Usage: stackshot npm capture <snapshot-name>');
      process.exit(1);
    }
    const existing = await loadSnapshot(snapshotName) || {};
    const npmConfig = await captureNpmConfig();
    existing.npm = npmConfig;
    await createSnapshot(snapshotName, existing);
    console.log(`npm config captured into snapshot "${snapshotName}"`);
    return;
  }

  if (sub === 'diff') {
    const [snapshotName] = rest;
    if (!snapshotName) {
      console.error('Usage: stackshot npm diff <snapshot-name>');
      process.exit(1);
    }
    const snapshot = await loadSnapshot(snapshotName);
    if (!snapshot || !snapshot.npm) {
      console.error(`No npm config found in snapshot "${snapshotName}"`);
      process.exit(1);
    }
    const current = await captureNpmConfig();
    const diff = diffNpmConfig(snapshot.npm, current);
    const output = formatNpmDiff(diff);
    if (!output) {
      console.log('No differences found.');
    } else {
      console.log(output);
    }
    return;
  }

  if (sub === 'show') {
    const [snapshotName] = rest;
    if (!snapshotName) {
      console.error('Usage: stackshot npm show <snapshot-name>');
      process.exit(1);
    }
    const snapshot = await loadSnapshot(snapshotName);
    if (!snapshot || !snapshot.npm) {
      console.error(`No npm config found in snapshot "${snapshotName}"`);
      process.exit(1);
    }
    console.log(JSON.stringify(snapshot.npm, null, 2));
    return;
  }

  console.error(`Unknown npm subcommand: ${sub}`);
  console.error('Available: capture, diff, show');
  process.exit(1);
}

module.exports = { handleNpmCommand };
