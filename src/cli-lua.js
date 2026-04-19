const { isLuaAvailable, captureLuaVersion, captureLuaRocks, diffLua, formatLuaDiff } = require('./lua');
const { loadSnapshot, createSnapshot } = require('./snapshot');

async function handleLuaCommand(args, snapshotName) {
  const [sub] = args;

  if (sub === 'capture') {
    if (!isLuaAvailable()) {
      console.log('lua not available on this machine, skipping');
      return;
    }
    const snap = await loadSnapshot(snapshotName);
    snap.luaVersion = captureLuaVersion();
    snap.luarocks = captureLuaRocks();
    await createSnapshot(snapshotName, snap);
    console.log(`lua: captured version ${snap.luaVersion} and ${snap.luarocks.length} luarocks package(s)`);
    return;
  }

  if (sub === 'diff') {
    const snap = await loadSnapshot(snapshotName);
    if (!snap.luaVersion && !snap.luarocks) {
      console.log('no lua data in snapshot');
      return;
    }
    if (!isLuaAvailable()) {
      console.log('lua not available on this machine');
      return;
    }
    const current = { luaVersion: captureLuaVersion(), luarocks: captureLuaRocks() };
    const diff = diffLua(snap, current);
    const hasChanges = diff.added.length || diff.removed.length || diff.changed.length || diff.versionChanged;
    if (!hasChanges) {
      console.log('lua: no changes');
      return;
    }
    console.log('lua diff:');
    console.log(formatLuaDiff(diff, snap, current));
    return;
  }

  if (sub === 'show') {
    const snap = await loadSnapshot(snapshotName);
    if (!snap.luarocks) { console.log('no lua data in snapshot'); return; }
    console.log(`lua version: ${snap.luaVersion || 'unknown'}`);
    console.log(`luarocks packages (${snap.luarocks.length}):`);
    snap.luarocks.forEach(p => console.log(`  ${p.name}@${p.version}`));
    return;
  }

  console.log('usage: stackshot lua <capture|diff|show> <snapshot>');
}

module.exports = { handleLuaCommand };
