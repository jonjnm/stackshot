const { isMavenAvailable, captureMavenVersion, captureMavenPlugins, diffMaven, formatMavenDiff } = require('./maven');
const { loadSnapshot, createSnapshot } = require('./snapshot');

async function handleMavenCommand(args, flags) {
  const [subcommand] = args;

  if (!isMavenAvailable()) {
    console.log('maven is not available on this system');
    return;
  }

  if (subcommand === 'capture') {
    const name = flags.name || flags.n;
    if (!name) {
      console.error('error: --name <snapshot> is required');
      process.exit(1);
    }
    const data = {
      version: captureMavenVersion(),
      plugins: captureMavenPlugins()
    };
    const snapshot = await loadSnapshot(name) || {};
    snapshot.maven = data;
    await createSnapshot(name, snapshot);
    console.log(`maven config captured into snapshot "${name}"`);
    return;
  }

  if (subcommand === 'diff') {
    const name = flags.name || flags.n;
    if (!name) {
      console.error('error: --name <snapshot> is required');
      process.exit(1);
    }
    const snapshot = await loadSnapshot(name);
    if (!snapshot || !snapshot.maven) {
      console.log(`no maven data found in snapshot "${name}"`);
      return;
    }
    const current = {
      version: captureMavenVersion(),
      plugins: captureMavenPlugins()
    };
    const diff = diffMaven(snapshot.maven, current);
    if (Object.keys(diff).length === 0) {
      console.log('no maven changes detected');
    } else {
      console.log('maven diff:');
      console.log(formatMavenDiff(diff));
    }
    return;
  }

  if (subcommand === 'show') {
    console.log('maven version:', captureMavenVersion());
    const plugins = captureMavenPlugins();
    if (plugins.length) {
      console.log('plugins:', plugins.join(', '));
    } else {
      console.log('plugins: (none detected)');
    }
    return;
  }

  console.log('usage: stackshot maven <capture|diff|show> [--name <snapshot>]');
}

module.exports = { handleMavenCommand };
