const { isElixirAvailable, captureElixirVersion, captureHexPackages, diffElixir, formatElixirDiff } = require('./elixir');
const { loadSnapshot, createSnapshot } = require('./snapshot');

async function handleElixirCommand(args) {
  const [subcommand, snapshotName] = args;

  if (!isElixirAvailable()) {
    console.log('elixir not available on this machine');
    return;
  }

  if (subcommand === 'capture') {
    if (!snapshotName) {
      console.error('usage: stackshot elixir capture <snapshot-name>');
      process.exit(1);
    }
    const version = captureElixirVersion();
    const packages = captureHexPackages();
    const existing = await loadSnapshot(snapshotName) || {};
    await createSnapshot(snapshotName, { ...existing, elixir: { version, packages } });
    console.log(`elixir captured: version=${version}, ${packages.length} hex packages`);
    return;
  }

  if (subcommand === 'diff') {
    if (!snapshotName) {
      console.error('usage: stackshot elixir diff <snapshot-name>');
      process.exit(1);
    }
    const snapshot = await loadSnapshot(snapshotName);
    if (!snapshot || !snapshot.elixir) {
      console.error(`no elixir data in snapshot '${snapshotName}'`);
      process.exit(1);
    }
    const current = { version: captureElixirVersion(), packages: captureHexPackages() };
    const diff = diffElixir(snapshot.elixir, current);
    const formatted = formatElixirDiff(diff);
    if (!formatted) {
      console.log('no elixir changes detected');
    } else {
      console.log('elixir diff:');
      console.log(formatted);
    }
    return;
  }

  if (subcommand === 'show') {
    const version = captureElixirVersion();
    const packages = captureHexPackages();
    console.log(`elixir version: ${version}`);
    console.log(`hex packages (${packages.length}): ${packages.join(', ') || 'none'}`);
    return;
  }

  console.error('unknown elixir subcommand. use: capture, diff, show');
  process.exit(1);
}

module.exports = { handleElixirCommand };
