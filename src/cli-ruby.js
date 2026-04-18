const { isRubyAvailable, captureRubyVersion, captureGemPackages, diffRuby, formatRubyDiff } = require('./ruby');
const { loadSnapshot, createSnapshot } = require('./snapshot');

async function handleRubyCommand(args) {
  const [sub, snapshotName] = args;

  if (sub === 'capture') {
    if (!snapshotName) return console.error('Usage: stackshot ruby capture <snapshot>');
    if (!isRubyAvailable()) return console.error('ruby not found in PATH');
    const existing = await loadSnapshot(snapshotName) || {};
    const ruby = {
      version: captureRubyVersion(),
      gems: captureGemPackages()
    };
    await createSnapshot(snapshotName, { ...existing, ruby });
    const gemCount = Object.keys(ruby.gems).length;
    console.log(`captured ruby ${ruby.version} with ${gemCount} gems into "${snapshotName}"`);
    return;
  }

  if (sub === 'diff') {
    if (!snapshotName) return console.error('Usage: stackshot ruby diff <snapshot>');
    const snapshot = await loadSnapshot(snapshotName);
    if (!snapshot) return console.error(`snapshot "${snapshotName}" not found`);
    if (!snapshot.ruby) return console.error(`no ruby data in snapshot "${snapshotName}"`);
    if (!isRubyAvailable()) return console.error('ruby not found in PATH');
    const current = {
      version: captureRubyVersion(),
      gems: captureGemPackages()
    };
    const diff = diffRuby(snapshot.ruby, current);
    const output = formatRubyDiff(diff);
    if (!output) {
      console.log('no differences found');
    } else {
      console.log(output);
    }
    return;
  }

  if (sub === 'show') {
    if (!snapshotName) return console.error('Usage: stackshot ruby show <snapshot>');
    const snapshot = await loadSnapshot(snapshotName);
    if (!snapshot) return console.error(`snapshot "${snapshotName}" not found`);
    if (!snapshot.ruby) return console.error(`no ruby data in snapshot "${snapshotName}"`);
    console.log(`ruby version: ${snapshot.ruby.version}`);
    console.log(`gems (${Object.keys(snapshot.ruby.gems).length}):`);
    for (const [name, ver] of Object.entries(snapshot.ruby.gems)) {
      console.log(`  ${name}: ${ver}`);
    }
    return;
  }

  console.error('Usage: stackshot ruby <capture|diff|show> <snapshot>');
}

module.exports = { handleRubyCommand };
