const { loadSnapshot, createSnapshot } = require('./snapshot');
const { isJavaAvailable, captureJavaVersion, captureMavenPackages, diffJava, formatJavaDiff } = require('./java');

async function handleJavaCommand(args) {
  const [sub, snapshotName] = args;

  if (!isJavaAvailable()) {
    console.log('java not available on this machine');
    return;
  }

  if (sub === 'capture') {
    if (!snapshotName) { console.error('usage: stackshot java capture <name>'); process.exit(1); }
    const snapshot = await loadSnapshot(snapshotName) || {};
    snapshot.java = {
      version: captureJavaVersion(),
      packages: captureMavenPackages()
    };
    await createSnapshot(snapshotName, snapshot);
    console.log(`java config captured into snapshot '${snapshotName}'`);
    return;
  }

  if (sub === 'diff') {
    if (!snapshotName) { console.error('usage: stackshot java diff <name>'); process.exit(1); }
    const snapshot = await loadSnapshot(snapshotName);
    if (!snapshot || !snapshot.java) {
      console.error(`no java data found in snapshot '${snapshotName}'`);
      process.exit(1);
    }
    const current = {
      version: captureJavaVersion(),
      packages: captureMavenPackages()
    };
    const d = diffJava(snapshot.java, current);
    if (!d.versionChanged && !d.added.length && !d.removed.length) {
      console.log('no java differences found');
    } else {
      console.log('java diff:');
      console.log(formatJavaDiff(d));
    }
    return;
  }

  if (sub === 'show') {
    if (!snapshotName) { console.error('usage: stackshot java show <name>'); process.exit(1); }
    const snapshot = await loadSnapshot(snapshotName);
    if (!snapshot || !snapshot.java) {
      console.error(`no java data in snapshot '${snapshotName}'`);
      process.exit(1);
    }
    console.log('version:', snapshot.java.version);
    console.log('maven packages:', (snapshot.java.packages || []).length);
    (snapshot.java.packages || []).forEach(p => console.log(' ', p));
    return;
  }

  console.error('unknown java subcommand. use: capture, diff, show');
  process.exit(1);
}

module.exports = { handleJavaCommand };
