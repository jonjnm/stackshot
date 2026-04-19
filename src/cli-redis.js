const { createSnapshot, loadSnapshot } = require('./snapshot');
const { isRedisAvailable, captureRedisVersion, captureRedisConfig, diffRedis, formatRedisDiff } = require('./redis');

async function handleRedisCommand(args) {
  const [sub, snapName] = args;

  if (!isRedisAvailable()) {
    console.log('redis-cli not found, skipping redis capture');
    return;
  }

  if (sub === 'capture') {
    if (!snapName) { console.error('Usage: stackshot redis capture <name>'); process.exit(1); }
    const version = captureRedisVersion();
    const config = captureRedisConfig();
    const existing = await loadSnapshot(snapName) || {};
    existing.redis = { version, config };
    await createSnapshot(snapName, existing);
    console.log(`Redis config captured into snapshot "${snapName}"`);
    if (version) console.log(`  version: ${version}`);
    console.log(`  ${Object.keys(config).length} config keys saved`);
    return;
  }

  if (sub === 'diff') {
    if (!snapName) { console.error('Usage: stackshot redis diff <name>'); process.exit(1); }
    const snap = await loadSnapshot(snapName);
    if (!snap || !snap.redis) { console.error(`No redis data in snapshot "${snapName}"`); process.exit(1); }
    const current = captureRedisConfig();
    const d = diffRedis(snap.redis.config, current);
    const out = formatRedisDiff(d);
    if (!out) { console.log('No redis config changes.'); return; }
    console.log(out);
    return;
  }

  console.error('Unknown redis subcommand. Use: capture, diff');
  process.exit(1);
}

module.exports = { handleRedisCommand };
