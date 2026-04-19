const { isAnsibleAvailable, captureAnsibleVersion, captureAnsibleCollections, diffAnsible, formatAnsibleDiff } = require('./ansible');
const { loadSnapshot, createSnapshot } = require('./snapshot');

async function handleAnsibleCommand(args) {
  const [sub, ...rest] = args;

  if (sub === 'capture') {
    const [snapshotName] = rest;
    if (!snapshotName) return console.error('Usage: stackshot ansible capture <snapshot>');
    if (!isAnsibleAvailable()) return console.error('ansible not found in PATH');
    const version = captureAnsibleVersion();
    const collections = captureAnsibleCollections();
    const snap = await loadSnapshot(snapshotName) || {};
    snap.ansible = { version, collections };
    await createSnapshot(snapshotName, snap);
    console.log(`Captured ansible v${version} with ${Object.keys(collections).length} collections into '${snapshotName}'`);
    return;
  }

  if (sub === 'diff') {
    const [snap1Name, snap2Name] = rest;
    if (!snap1Name || !snap2Name) return console.error('Usage: stackshot ansible diff <snap1> <snap2>');
    const snap1 = await loadSnapshot(snap1Name);
    const snap2 = await loadSnapshot(snap2Name);
    if (!snap1) return console.error(`Snapshot '${snap1Name}' not found`);
    if (!snap2) return console.error(`Snapshot '${snap2Name}' not found`);
    if (!snap1.ansible && !snap2.ansible) return console.log('No ansible data in either snapshot');
    const diff = diffAnsible(snap1.ansible || {}, snap2.ansible || {});
    const out = formatAnsibleDiff(diff);
    if (!out) return console.log('No ansible differences');
    console.log(`Ansible diff (${snap1Name} -> ${snap2Name}):\n${out}`);
    return;
  }

  if (sub === 'show') {
    const [snapshotName] = rest;
    if (!snapshotName) return console.error('Usage: stackshot ansible show <snapshot>');
    const snap = await loadSnapshot(snapshotName);
    if (!snap || !snap.ansible) return console.log('No ansible data in snapshot');
    console.log(`Ansible v${snap.ansible.version}`);
    console.log('Collections:');
    for (const [name, ver] of Object.entries(snap.ansible.collections || {})) {
      console.log(`  ${name} ${ver}`);
    }
    return;
  }

  console.error('Unknown ansible subcommand. Use: capture, diff, show');
}

module.exports = { handleAnsibleCommand };
