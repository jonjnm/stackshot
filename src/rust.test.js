const { diffRust, formatRustDiff } = require('./rust');

describe('diffRust', () => {
  const base = {
    version: { version: 'rustc 1.75.0', toolchain: 'stable-x86_64' },
    packages: { 'cargo-watch': '8.4.0', 'cargo-edit': '0.12.0' }
  };

  test('no diff when identical', () => {
    const diff = diffRust(base, base);
    expect(Object.keys(diff.added)).toHaveLength(0);
    expect(Object.keys(diff.removed)).toHaveLength(0);
    expect(Object.keys(diff.changed)).toHaveLength(0);
    expect(diff.versionChanged).toBeNull();
  });

  test('detects added package', () => {
    const current = { ...base, packages: { ...base.packages, 'tokei': '12.1.2' } };
    const diff = diffRust(base, current);
    expect(diff.added['tokei']).toBe('12.1.2');
  });

  test('detects removed package', () => {
    const current = { ...base, packages: { 'cargo-watch': '8.4.0' } };
    const diff = diffRust(base, current);
    expect(diff.removed['cargo-edit']).toBe('0.12.0');
  });

  test('detects changed package version', () => {
    const current = { ...base, packages: { ...base.packages, 'cargo-watch': '8.5.0' } };
    const diff = diffRust(base, current);
    expect(diff.changed['cargo-watch']).toEqual({ from: '8.4.0', to: '8.5.0' });
  });

  test('detects rust version change', () => {
    const current = { ...base, version: { version: 'rustc 1.76.0', toolchain: 'stable-x86_64' } };
    const diff = diffRust(base, current);
    expect(diff.versionChanged).toEqual({ from: 'rustc 1.75.0', to: 'rustc 1.76.0' });
  });
});

describe('formatRustDiff', () => {
  test('formats all diff types', () => {
    const diff = {
      versionChanged: { from: 'rustc 1.75.0', to: 'rustc 1.76.0' },
      added: { 'tokei': '12.1.2' },
      removed: { 'cargo-edit': '0.12.0' },
      changed: { 'cargo-watch': { from: '8.4.0', to: '8.5.0' } }
    };
    const output = formatRustDiff(diff);
    expect(output).toContain('rustc 1.75.0 → rustc 1.76.0');
    expect(output).toContain('+ tokei@12.1.2');
    expect(output).toContain('- cargo-edit@0.12.0');
    expect(output).toContain('~ cargo-watch: 8.4.0 → 8.5.0');
  });

  test('returns empty string for empty diff', () => {
    expect(formatRustDiff({ versionChanged: null, added: {}, removed: {}, changed: {} })).toBe('');
  });
});
