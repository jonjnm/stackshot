const { createSnapshot, loadSnapshot } = require('./snapshot');
const { isPhpAvailable, capturePhpVersion, captureComposerPackages, diffPhp, formatPhpDiff } = require('./php');

async function handlePhpCommand(args) {
  const sub = args[0];

  if (!isPhpAvailable()) {
    console.log('php is not available on this machine');
    return;
  }

  if (sub === 'capture') {
    const name = args[1];
    if (!name) { console.error('usage: stackshot php capture <snapshot>'); process.exit(1); }
    const existing = await loadSnapshot(name) || {};
    existing.phpVersion = capturePhpVersion();
    existing.composerPackages = captureComposerPackages();
    await createSnapshot(name, existing);
    console.log(`captured php config into snapshot "${name}"`);
    return;
  }

  if (sub === 'diff') {
    const name = args[1];
    if (!name) { console.error('usage: stackshot php diff <snapshot>'); process.exit(1); }
    const snapshot = await loadSnapshot(name);
    if (!snapshot) { console.error(`snapshot "${name}" not found`); process.exit(1); }
    const current = {
      phpVersion: capturePhpVersion(),
      composerPackages: captureComposerPackages()
    };
    const diff = diffPhp(snapshot, current);
    const out = formatPhpDiff(diff);
    if (!out) {
      console.log('no php changes detected');
    } else {
      console.log('php diff:');
      console.log(out);
    }
    return;
  }

  if (sub === 'show') {
    const name = args[1];
    if (!name) { console.error('usage: stackshot php show <snapshot>'); process.exit(1); }
    const snapshot = await loadSnapshot(name);
    if (!snapshot) { console.error(`snapshot "${name}" not found`); process.exit(1); }
    console.log(`php version: ${snapshot.phpVersion || 'n/a'}`);
    const pkgs = snapshot.composerPackages || {};
    const keys = Object.keys(pkgs);
    if (keys.length === 0) {
      console.log('no composer packages captured');
    } else {
      console.log(`composer packages (${keys.length}):`);
      for (const k of keys) console.log(`  ${k}@${pkgs[k]}`);
    }
    return;
  }

  console.log('usage: stackshot php <capture|diff|show> <snapshot>');
}

module.exports = { handlePhpCommand };
