const { execSync } = require('child_process');

function isLuaAvailable() {
  try {
    execSync('lua -v', { stdio: 'pipe' });
    return true;
  } catch {
    return false;
  }
}

function captureLuaVersion() {
  try {
    const out = execSync('lua -v 2>&1', { stdio: 'pipe' }).toString().trim();
    return out.split('\n')[0];
  } catch {
    return null;
  }
}

function captureLuaRocks() {
  try {
    const out = execSync('luarocks list --porcelain 2>/dev/null', { stdio: 'pipe' }).toString().trim();
    if (!out) return [];
    return out.split('\n').map(line => {
      const [name, version] = line.split('\t');
      return { name: name.trim(), version: (version || '').trim() };
    }).filter(p => p.name);
  } catch {
    return [];
  }
}

function diffLua(snapshot, current) {
  const snapRocks = snapshot.luarocks || [];
  const currRocks = current.luarocks || [];
  const snapMap = Object.fromEntries(snapRocks.map(p => [p.name, p.version]));
  const currMap = Object.fromEntries(currRocks.map(p => [p.name, p.version]));
  const added = currRocks.filter(p => !snapMap[p.name]);
  const removed = snapRocks.filter(p => !currMap[p.name]);
  const changed = currRocks.filter(p => snapMap[p.name] && snapMap[p.name] !== p.version);
  return { added, removed, changed, versionChanged: snapshot.luaVersion !== current.luaVersion };
}

function formatLuaDiff(diff, snapshot, current) {
  const lines = [];
  if (diff.versionChanged) lines.push(`  lua version: ${snapshot.luaVersion} → ${current.luaVersion}`);
  diff.added.forEach(p => lines.push(`  + ${p.name}@${p.version}`));
  diff.removed.forEach(p => lines.push(`  - ${p.name}@${p.version}`));
  diff.changed.forEach(p => lines.push(`  ~ ${p.name}: ${snapshot.luarocks.find(r => r.name === p.name)?.version} → ${p.version}`));
  return lines.join('\n');
}

module.exports = { isLuaAvailable, captureLuaVersion, captureLuaRocks, diffLua, formatLuaDiff };
