const { diffLua, formatLuaDiff } = require('./lua');

describe('diffLua', () => {
  const base = {
    luaVersion: 'Lua 5.4.4',
    luarocks: [
      { name: 'luasocket', version: '3.0' },
      { name: 'inspect', version: '3.1.1' },
    ],
  };

  test('no diff when identical', () => {
    const diff = diffLua(base, { ...base });
    expect(diff.added).toHaveLength(0);
    expect(diff.removed).toHaveLength(0);
    expect(diff.changed).toHaveLength(0);
    expect(diff.versionChanged).toBe(false);
  });

  test('detects added package', () => {
    const current = { ...base, luarocks: [...base.luarocks, { name: 'penlight', version: '1.13.1' }] };
    const diff = diffLua(base, current);
    expect(diff.added).toHaveLength(1);
    expect(diff.added[0].name).toBe('penlight');
  });

  test('detects removed package', () => {
    const current = { ...base, luarocks: [{ name: 'luasocket', version: '3.0' }] };
    const diff = diffLua(base, current);
    expect(diff.removed).toHaveLength(1);
    expect(diff.removed[0].name).toBe('inspect');
  });

  test('detects version change', () => {
    const current = { ...base, luarocks: [{ name: 'luasocket', version: '3.1' }, { name: 'inspect', version: '3.1.1' }] };
    const diff = diffLua(base, current);
    expect(diff.changed).toHaveLength(1);
    expect(diff.changed[0].name).toBe('luasocket');
  });

  test('detects lua version change', () => {
    const current = { ...base, luaVersion: 'Lua 5.4.6' };
    const diff = diffLua(base, current);
    expect(diff.versionChanged).toBe(true);
  });

  test('formatLuaDiff returns lines', () => {
    const current = { luaVersion: 'Lua 5.4.6', luarocks: [{ name: 'penlight', version: '1.0' }] };
    const diff = diffLua(base, current);
    const out = formatLuaDiff(diff, base, current);
    expect(out).toContain('Lua 5.4.4');
    expect(out).toContain('penlight');
  });
});
