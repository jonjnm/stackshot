const { diffHaskell, formatHaskellDiff } = require('./haskell');

describe('diffHaskell', () => {
  const base = {
    version: 'The Glorious Glasgow Haskell Compilation System, version 9.4.7',
    packages: ['base-4.17.0.0', 'bytestring-0.11.4.0', 'containers-0.6.7']
  };

  test('no diff when identical', () => {
    const diff = diffHaskell(base, { ...base, packages: [...base.packages] });
    expect(diff.version).toBeNull();
    expect(diff.packages.added).toHaveLength(0);
    expect(diff.packages.removed).toHaveLength(0);
  });

  test('detects version change', () => {
    const diff = diffHaskell(base, { ...base, version: 'The Glorious Glasgow Haskell Compilation System, version 9.6.1' });
    expect(diff.version).toEqual({
      from: base.version,
      to: 'The Glorious Glasgow Haskell Compilation System, version 9.6.1'
    });
  });

  test('detects added packages', () => {
    const current = { ...base, packages: [...base.packages, 'text-2.0.1'] };
    const diff = diffHaskell(base, current);
    expect(diff.packages.added).toContain('text-2.0.1');
    expect(diff.packages.removed).toHaveLength(0);
  });

  test('detects removed packages', () => {
    const current = { ...base, packages: ['base-4.17.0.0'] };
    const diff = diffHaskell(base, current);
    expect(diff.packages.removed).toContain('bytestring-0.11.4.0');
    expect(diff.packages.removed).toContain('containers-0.6.7');
  });
});

describe('formatHaskellDiff', () => {
  test('formats version and package changes', () => {
    const diff = {
      version: { from: '9.4.7', to: '9.6.1' },
      packages: { added: ['text-2.0.1'], removed: ['old-pkg-1.0'] }
    };
    const output = formatHaskellDiff(diff);
    expect(output).toContain('9.4.7 → 9.6.1');
    expect(output).toContain('+ text-2.0.1');
    expect(output).toContain('- old-pkg-1.0');
  });

  test('returns empty string for empty diff', () => {
    const diff = { version: null, packages: { added: [], removed: [] } };
    expect(formatHaskellDiff(diff)).toBe('');
  });
});
