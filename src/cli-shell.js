const { captureShellAliases, captureShellConfig, diffShell, formatShellDiff } = require('./shell');
const { createSnapshot, loadSnapshot } = require('./snapshot');

async function handleShellCommand(args) {
  const sub = args[0];

  if (sub === 'capture') {
    const name = args[1];
    if (!name) { console.error('Usage: stackshot shell capture <name>'); process.exit(1); }
    const existing = await loadSnapshot(name) || {};
    const updated = {
      ...existing,
      shell: {
        aliases: captureShellAliases(),
        configs: captureShellConfig(),
      },
    };
    await createSnapshot(name, updated);
    console.log(`Shell aliases and configs captured into snapshot "${name}".`);
    return;
  }

  if (sub === 'diff') {
    const name = args[1];
    if (!name) { console.error('Usage: stackshot shell diff <name>'); process.exit(1); }
    const snapshot = await loadSnapshot(name);
    if (!snapshot) { console.error(`Snapshot "${name}" not found.`); process.exit(1); }
    if (!snapshot.shell) { console.error(`No shell data in snapshot "${name}".`); process.exit(1); }
    const current = { aliases: captureShellAliases(), configs: captureShellConfig() };
    const diff = diffShell(snapshot.shell, current);
    const lines = formatShellDiff(diff);
    if (lines.length === 0) {
      console.log('No shell differences found.');
    } else {
      console.log(`Shell diff vs snapshot "${name}":`);
      lines.forEach(l => console.log(' ', l));
    }
    return;
  }

  if (sub === 'show') {
    const name = args[1];
    if (!name) { console.error('Usage: stackshot shell show <name>'); process.exit(1); }
    const snapshot = await loadSnapshot(name);
    if (!snapshot || !snapshot.shell) { console.error(`No shell data in snapshot "${name}".`); process.exit(1); }
    const { aliases, configs } = snapshot.shell;
    console.log(`Aliases in "${name}":`);
    for (const [k, v] of Object.entries(aliases || {})) console.log(`  ${k}='${v}'`);
    console.log(`Config files in "${name}":`);
    for (const f of Object.keys(configs || {})) console.log(`  ${f}`);
    return;
  }

  console.error('Unknown shell subcommand. Use: capture | diff | show');
  process.exit(1);
}

module.exports = { handleShellCommand };
