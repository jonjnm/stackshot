const { diffElixir, formatElixirDiff } = require('./elixir');

describe('diffElixir', () => {
  const base = { version: '1.14.0', packages: ['phoenix', 'ecto', 'plug'] };

  test('no changes', () => {
    const diff = diffElixir(base, { ...base });
    expect(diff.added).toHaveLength(0);
    expect(diff.removed).toHaveLength(0);
    expect(diff.versionChanged).toBe(false);
  });

  test('detects added packages', () => {
    const current = { ...base, packages: [...base.packages, 'broadway'] };
    const diff = diffElixir(base, current);
    expect(diff.added).toContain('broadway');
    expect(diff.removed).toHaveLength(0);
  });

  test('detects removed packages', () => {
    const current = { ...base, packages: ['phoenix', 'ecto'] };
    const diff = diffElixir(base, current);
    expect(diff.removed).toContain('plug');
    expect(diff.added).toHaveLength(0);
  });

  test('detects version change', () => {
    const current = { ...base, version: '1.15.0' };
    const diff = diffElixir(base, current);
    expect(diff.versionChanged).toBe(true);
    expect(diff.oldVersion).toBe('1.14.0');
    expect(diff.newVersion).toBe('1.15.0');
  });
});

describe('formatElixirDiff', () => {
  test('formats version change', () => {
    const diff = { versionChanged: true, oldVersion: '1.14.0', newVersion: '1.15.0', added: [], removed: [] };
    expect(formatElixirDiff(diff)).toContain('1.14.0 → 1.15.0');
  });

  test('formats added and removed', () => {
    const diff = { versionChanged: false, oldVersion: null, newVersion: null, added: ['broadway'], removed: ['plug'] };
    const out = formatElixirDiff(diff);
    expect(out).toContain('+ broadway');
    expect(out).toContain('- plug');
  });

  test('returns empty string when no diff', () => {
    const diff = { versionChanged: false, oldVersion: null, newVersion: null, added: [], removed: [] };
    expect(formatElixirDiff(diff)).toBe('');
  });
});
