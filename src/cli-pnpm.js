const { isPnpmAvailable, capturePnpmVersion, capturePnpmGlobals, diffPnpm, formatPnpmDiff } = require('./pnpm');
const { createSnapshot, loadSnapshot } = require('./snapshot');

async function handlePnpmCommand(args) {
  const [subcommand, snapshotName] = args;

  if (!isPnpmAvailable()) {
    console.log('pnpm is not available on this system.');
    return;
  }

  switch (subcommand) {
    case 'capture': {
      if (!snapshotName) {
        console.error('Usage: stackshot pnpm capture <snapshot-name>');
        process.exit(1);
      }
      const version = capturePnpmVersion();
      const globals = capturePnpmGlobals();
      const existing = await loadSnapshot(snapshotName) || {};
      await createSnapshot(snapshotName, { ...existing, pnpm: { version, globals } });
      console.log(`pnpm config captured into snapshot "${snapshotName}"`);
      console.log(`  version: ${version}`);
      console.log(`  global packages: ${globals.length}`);
      break;
    }

    case 'diff': {
      if (!snapshotName) {
        console.error('Usage: stackshot pnpm diff <snapshot-name>');
        process.exit(1);
      }
      const snapshot = await loadSnapshot(snapshotName);
      if (!snapshot) {
        console.error(`Snapshot "${snapshotName}" not found.`);
        process.exit(1);
      }
      if (!snapshot.pnpm) {
        console.log(`No pnpm data in snapshot "${snapshotName}".`);
        return;
      }
      const current = { globals: capturePnpmGlobals() };
      const diff = diffPnpm(snapshot.pnpm, current);
      const hasChanges = diff.added.length || diff.removed.length || diff.changed.length;
      if (!hasChanges) {
        console.log('pnpm globals match snapshot.');
      } else {
        console.log('pnpm globals diff:');
        console.log(formatPnpmDiff(diff));
      }
      break;
    }

    case 'show': {
      if (!snapshotName) {
        console.error('Usage: stackshot pnpm show <snapshot-name>');
        process.exit(1);
      }
      const snapshot = await loadSnapshot(snapshotName);
      if (!snapshot?.pnpm) {
        console.log(`No pnpm data in snapshot "${snapshotName}".`);
        return;
      }
      console.log(`pnpm version: ${snapshot.pnpm.version}`);
      console.log(`Global packages (${snapshot.pnpm.globals.length}):`);
      snapshot.pnpm.globals.forEach(p => console.log(`  ${p.name}@${p.version}`));
      break;
    }

    default:
      console.error('Unknown pnpm subcommand. Use: capture, diff, show');
      process.exit(1);
  }
}

module.exports = { handlePnpmCommand };
