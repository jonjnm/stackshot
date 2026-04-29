const { isNvmAvailable, captureNvmVersion, captureNvmInstalledVersions, captureNvmDefault, diffNvm, formatNvmDiff } = require('./nvm');
const { loadSnapshot, createSnapshot } = require('./snapshot');

async function handleNvmCommand(args) {
  const sub = args[0];

  if (sub === 'capture') {
    const name = args[1];
    if (!name) {
      console.error('Usage: stackshot nvm capture <snapshot-name>');
      process.exit(1);
    }
    if (!isNvmAvailable()) {
      console.error('nvm is not available on this system');
      process.exit(1);
    }
    const data = {
      version: captureNvmVersion(),
      installed: captureNvmInstalledVersions(),
      default: captureNvmDefault()
    };
    const snapshot = await loadSnapshot(name) || {};
    snapshot.nvm = data;
    await createSnapshot(name, snapshot);
    console.log(`nvm config captured into snapshot "${name}"`);
    console.log(`  nvm version : ${data.version}`);
    console.log(`  installed   : ${data.installed.join(', ') || 'none'}`);
    console.log(`  default     : ${data.default || 'none'}`);
    return;
  }

  if (sub === 'diff') {
    const name = args[1];
    if (!name) {
      console.error('Usage: stackshot nvm diff <snapshot-name>');
      process.exit(1);
    }
    if (!isNvmAvailable()) {
      console.error('nvm is not available on this system');
      process.exit(1);
    }
    const snapshot = await loadSnapshot(name);
    if (!snapshot || !snapshot.nvm) {
      console.error(`No nvm data found in snapshot "${name}"`);
      process.exit(1);
    }
    const current = {
      version: captureNvmVersion(),
      installed: captureNvmInstalledVersions(),
      default: captureNvmDefault()
    };
    const diff = diffNvm(snapshot.nvm, current);
    if (!diff.added.length && !diff.removed.length && !diff.defaultChanged) {
      console.log('nvm: no changes detected');
    } else {
      console.log('nvm diff:');
      console.log(formatNvmDiff(diff));
    }
    return;
  }

  console.error(`Unknown nvm subcommand: ${sub}`);
  console.error('Available subcommands: capture, diff');
  process.exit(1);
}

module.exports = { handleNvmCommand };
