const { isKotlinAvailable, captureKotlinVersion, captureGradleDependencies, diffKotlin, formatKotlinDiff } = require('./kotlin');
const { loadSnapshot, createSnapshot } = require('./snapshot');

async function handleKotlinCommand(args) {
  const [sub, ...rest] = args;

  if (sub === 'capture') {
    const name = rest[0];
    if (!name) { console.error('Usage: stackshot kotlin capture <snapshot>'); process.exit(1); }
    if (!isKotlinAvailable()) { console.error('kotlin not available'); process.exit(1); }
    const data = await loadSnapshot(name) || {};
    data.kotlin = {
      kotlinVersion: captureKotlinVersion(),
      gradleDeps: captureGradleDependencies()
    };
    await createSnapshot(name, data);
    console.log(`Kotlin config captured into snapshot "${name}"`);
    return;
  }

  if (sub === 'diff') {
    const name = rest[0];
    if (!name) { console.error('Usage: stackshot kotlin diff <snapshot>'); process.exit(1); }
    const snapshot = await loadSnapshot(name);
    if (!snapshot?.kotlin) { console.error('No kotlin data in snapshot'); process.exit(1); }
    if (!isKotlinAvailable()) { console.error('kotlin not available'); process.exit(1); }
    const current = {
      kotlinVersion: captureKotlinVersion(),
      gradleDeps: captureGradleDependencies()
    };
    const diff = diffKotlin(snapshot.kotlin, current);
    const out = formatKotlinDiff(diff);
    if (!out) { console.log('No kotlin differences'); }
    else { console.log('Kotlin differences:\n' + out); }
    return;
  }

  if (sub === 'show') {
    const name = rest[0];
    if (!name) { console.error('Usage: stackshot kotlin show <snapshot>'); process.exit(1); }
    const snapshot = await loadSnapshot(name);
    if (!snapshot?.kotlin) { console.error('No kotlin data in snapshot'); process.exit(1); }
    console.log(`Kotlin version: ${snapshot.kotlin.kotlinVersion}`);
    console.log(`Gradle deps (${snapshot.kotlin.gradleDeps.length}):`);
    snapshot.kotlin.gradleDeps.forEach(d => console.log(`  ${d}`));
    return;
  }

  console.error('Unknown kotlin subcommand. Use: capture, diff, show');
  process.exit(1);
}

module.exports = { handleKotlinCommand };
