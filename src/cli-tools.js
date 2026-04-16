const { captureToolVersions, captureNpmGlobals, diffTools } = require('./tools');
const { loadSnapshot, createSnapshot, listSnapshots } = require('./snapshot');

function handleToolsCommand(args) {
  const sub = args[0];

  if (sub === 'capture') {
    const name = args[1];
    if (!name) {
      console.error('Usage: stackshot tools capture <snapshot-name>');
      process.exit(1);
    }
    const existing = loadSnapshot(name) || {};
    const tools = captureToolVersions();
    const npmGlobals = captureNpmGlobals();
    const updated = { ...existing, tools, npmGlobals };
    createSnapshot(name, updated);
    console.log(`Tool versions captured into snapshot "${name}".`);
    console.log('Tools:', JSON.stringify(tools, null, 2));
    return;
  }

  if (sub === 'diff') {
    const name = args[1];
    if (!name) {
      console.error('Usage: stackshot tools diff <snapshot-name>');
      process.exit(1);
    }
    const snap = loadSnapshot(name);
    if (!snap || !snap.tools) {
      console.error(`No tool data found in snapshot "${name}".`);
      process.exit(1);
    }
    const current = captureToolVersions();
    const changes = diffTools(snap.tools, current);
    if (Object.keys(changes).length === 0) {
      console.log('No tool version differences detected.');
    } else {
      console.log('Tool version differences:');
      for (const [tool, { from, to }] of Object.entries(changes)) {
        console.log(`  ${tool}: ${from ?? '(none)'} -> ${to ?? '(none)'}`);
      }
    }
    return;
  }

  if (sub === 'show') {
    const name = args[1];
    if (!name) {
      console.error('Usage: stackshot tools show <snapshot-name>');
      process.exit(1);
    }
    const snap = loadSnapshot(name);
    if (!snap || !snap.tools) {
      console.error(`No tool data found in snapshot "${name}".`);
      process.exit(1);
    }
    console.log(`Tools in snapshot "${name}":`);
    for (const [tool, version] of Object.entries(snap.tools)) {
      console.log(`  ${tool}: ${version ?? '(not installed)'}`);
    }
    if (snap.npmGlobals && snap.npmGlobals.length > 0) {
      console.log('\nGlobal npm packages:');
      for (const pkg of snap.npmGlobals) {
        console.log(`  ${pkg.name}@${pkg.version}`);
      }
    }
    return;
  }

  console.error('Unknown tools subcommand. Available: capture, diff, show');
  process.exit(1);
}

module.exports = { handleToolsCommand };
