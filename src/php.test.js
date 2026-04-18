const { diffPhp, formatPhpDiff } = require('./php');

describe('diffPhp', () => {
  const base = {
    phpVersion: '8.1.0',
    composerPackages: { 'laravel/installer': '4.2.0', 'phpunit/phpunit': '9.5.0' }
  };

  test('no diff when identical', () => {
    const diff = diffPhp(base, base);
    expect(diff.versionChanged).toBe(false);
    expect(Object.keys(diff.added)).toHaveLength(0);
    expect(Object.keys(diff.removed)).toHaveLength(0);
    expect(Object.keys(diff.changed)).toHaveLength(0);
  });

  test('detects version change', () => {
    const curr = { ...base, phpVersion: '8.2.1' };
    const diff = diffPhp(base, curr);
    expect(diff.versionChanged).toBe(true);
    expect(diff.oldVersion).toBe('8.1.0');
    expect(diff.newVersion).toBe('8.2.1');
  });

  test('detects added package', () => {
    const curr = { ...base, composerPackages: { ...base.composerPackages, 'symfony/console': '6.0.0' } };
    const diff = diffPhp(base, curr);
    expect(diff.added['symfony/console']).toBe('6.0.0');
  });

  test('detects removed package', () => {
    const curr = { ...base, composerPackages: { 'laravel/installer': '4.2.0' } };
    const diff = diffPhp(base, curr);
    expect(diff.removed['phpunit/phpunit']).toBe('9.5.0');
  });

  test('detects changed package version', () => {
    const curr = { ...base, composerPackages: { ...base.composerPackages, 'laravel/installer': '4.3.0' } };
    const diff = diffPhp(base, curr);
    expect(diff.changed['laravel/installer']).toEqual({ from: '4.2.0', to: '4.3.0' });
  });
});

describe('formatPhpDiff', () => {
  test('formats diff output', () => {
    const diff = {
      versionChanged: true, oldVersion: '8.1.0', newVersion: '8.2.0',
      added: { 'foo/bar': '1.0.0' }, removed: {}, changed: {}
    };
    const out = formatPhpDiff(diff);
    expect(out).toContain('8.1.0 → 8.2.0');
    expect(out).toContain('+ foo/bar@1.0.0');
  });

  test('returns empty string for no changes', () => {
    const diff = { versionChanged: false, added: {}, removed: {}, changed: {} };
    expect(formatPhpDiff(diff)).toBe('');
  });
});
