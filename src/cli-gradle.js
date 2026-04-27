const {
  isGradleAvailable,
  captureGradleVersion,
  captureGradlePlugins,
  diffGradle,
  formatGradleDiff
} = require('./gradle');
const { loadSnapshot, createSnapshot } = require('./snapshot');

async function handleGradleCommand(args) {
  const [subcommand, snapshotName] = args;

  if (!isGradleAvailable()) {
    console.log('gradle is not available on this system');
    return;
  }

  switch (subcommand) {
    case 'capture': {
      if (!snapshotName) {
        console.error('usage: stackshot gradle capture <snapshot-name>');
        process.exit(1);
      }
      const version = captureGradleVersion();
      const plugins = captureGradlePlugins();
      const snapshot = await loadSnapshot(snapshotName) || {};
      snapshot.gradle = { version, plugins };
      await createSnapshot(snapshotName, snapshot);
      console.log(`captured gradle: v${version}, ${plugins.length} plugin(s)`);
      break;
    }

    case 'diff': {
      if (!snapshotName) {
        console.error('usage: stackshot gradle diff <snapshot-name>');
        process.exit(1);
      }
      const snapshot = await loadSnapshot(snapshotName);
      if (!snapshot || !snapshot.gradle) {
        console.log(`no gradle data in snapshot "${snapshotName}"`);
        return;
      }
      const current = {
        version: captureGradleVersion(),
        plugins: captureGradlePlugins()
      };
      const diff = diffGradle(snapshot.gradle, current);
      const hasChanges = diff.versionChanged || diff.added.length || diff.removed.length || diff.changed.length;
      if (!hasChanges) {
        console.log('gradle: no changes');
      } else {
        console.log('gradle diff:');
        console.log(formatGradleDiff(diff));
      }
      break;
    }

    case 'show': {
      const version = captureGradleVersion();
      const plugins = captureGradlePlugins();
      console.log(`gradle version: ${version}`);
      console.log(`plugins (${plugins.length}):`);
      plugins.forEach(p => console.log(`  ${p.name}@${p.version}`));
      break;
    }

    default:
      console.error('unknown gradle subcommand. use: capture, diff, show');
      process.exit(1);
  }
}

module.exports = { handleGradleCommand };
