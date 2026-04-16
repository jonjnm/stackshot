const { captureBrewPackages, diffBrew, formatBrewDiff, isBrewAvailable } = require('./brew');
const { loadSnapshot, createSnapshot, listSnapshots } = require('./snapshot');

function handleBrewCommand(args) {
  const [sub, ...rest] = args;

  if (!isBrewAvailable()) {
    console.error('brew not found on this system');
    process.exit(1);
  }

  if (sub === 'capture') {
    const name = rest[0];
    if (!name) {
      console.error('Usage: stackshot brew capture <snapshot-name>');
      process.exit(1);
    }
    const existing = loadSnapshot(name) || {};
    existing.brew = captureBrewPackages();
    createSnapshot(name, existing);
    const { formulae, casks } = existing.brew;
    console.log(`Captured ${formulae.length} formulae and ${casks.length} casks into "${name}"`);
    return;
  }

  if (sub === 'diff') {
    const name = rest[0];
    if (!name) {
      console.error('Usage: stackshot brew diff <snapshot-name>');
      process.exit(1);
    }
    const snapshot = loadSnapshot(name);
    if (!snapshot) {
      console.error(`Snapshot "${name}" not found`);
      process.exit(1);
    }
    if (!snapshot.brew) {
      console.error(`Snapshot "${name}" has no brew data`);
      process.exit(1);
    }
    const current = captureBrewPackages();
    const diff = diffBrew(snapshot.brew, current);
    const lines = formatBrewDiff(diff);
    if (lines.length === 0) {
      console.log('No differences found');
    } else {
      lines.forEach(l => console.log(l));
    }
    return;
  }

  if (sub === 'list') {
    const snapshots = listSnapshots();
    const withBrew = snapshots.filter(n => {
      const s = loadSnapshot(n);
      return s && s.brew;
    });
    if (withBrew.length === 0) {
      console.log('No snapshots with brew data');
    } else {
      withBrew.forEach(n => console.log(n));
    }
    return;
  }

  console.error('Unknown brew subcommand. Use: capture, diff, list');
  process.exit(1);
}

module.exports = { handleBrewCommand };
