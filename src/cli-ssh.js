const { loadSnapshot, createSnapshot } = require('./snapshot');
const { isSshAvailable, captureSshKeys, captureSshConfig, diffSsh, formatSshDiff } = require('./ssh');

async function handleSshCommand(args) {
  const [subcommand, snapshotName] = args;

  if (!isSshAvailable()) {
    console.error('SSH is not available on this system.');
    process.exit(1);
  }

  if (subcommand === 'capture') {
    if (!snapshotName) {
      console.error('Usage: stackshot ssh capture <snapshot-name>');
      process.exit(1);
    }
    try {
      const keys = await captureSshKeys();
      const config = await captureSshConfig();
      const existing = await loadSnapshot(snapshotName).catch(() => ({}));
      await createSnapshot(snapshotName, { ...existing, ssh: { keys, config } });
      console.log(`SSH config captured into snapshot "${snapshotName}".`);
      console.log(`  ${keys.length} key(s) found.`);
    } catch (err) {
      console.error('Failed to capture SSH config:', err.message);
      process.exit(1);
    }
  } else if (subcommand === 'diff') {
    if (!snapshotName) {
      console.error('Usage: stackshot ssh diff <snapshot-name>');
      process.exit(1);
    }
    try {
      const snapshot = await loadSnapshot(snapshotName);
      if (!snapshot.ssh) {
        console.log(`No SSH data in snapshot "${snapshotName}".`);
        return;
      }
      const currentKeys = await captureSshKeys();
      const currentConfig = await captureSshConfig();
      const result = diffSsh(snapshot.ssh, { keys: currentKeys, config: currentConfig });
      if (!result.added.length && !result.removed.length && !result.configChanged) {
        console.log('No SSH differences found.');
      } else {
        console.log(formatSshDiff(result));
      }
    } catch (err) {
      console.error('Failed to diff SSH config:', err.message);
      process.exit(1);
    }
  } else {
    console.error('Unknown ssh subcommand. Use: capture, diff');
    process.exit(1);
  }
}

module.exports = { handleSshCommand };
