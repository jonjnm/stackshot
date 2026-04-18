const { diffJava, formatJavaDiff } = require('./java');

describe('diffJava', () => {
  const base = {
    version: 'openjdk version "17.0.1"',
    packages: ['com.example:lib-a:1.0:compile', 'com.example:lib-b:2.0:compile']
  };

  test('no diff when identical', () => {
    const diff = diffJava(base, { ...base });
    expect(diff.versionChanged).toBe(false);
    expect(diff.added).toHaveLength(0);
    expect(diff.removed).toHaveLength(0);
  });

  test('detects version change', () => {
    const diff = diffJava(base, { ...base, version: 'openjdk version "21.0.0"' });
    expect(diff.versionChanged).toBe(true);
    expect(diff.oldVersion).toBe(base.version);
    expect(diff.newVersion).toBe('openjdk version "21.0.0"');
  });

  test('detects added packages', () => {
    const current = { ...base, packages: [...base.packages, 'com.example:lib-c:3.0:compile'] };
    const diff = diffJava(base, current);
    expect(diff.added).toContain('com.example:lib-c:3.0:compile');
  });

  test('detects removed packages', () => {
    const current = { ...base, packages: ['com.example:lib-a:1.0:compile'] };
    const diff = diffJava(base, current);
    expect(diff.removed).toContain('com.example:lib-b:2.0:compile');
  });

  test('handles missing packages gracefully', () => {
    const diff = diffJava({ version: 'v1' }, { version: 'v1' });
    expect(diff.added).toHaveLength(0);
    expect(diff.removed).toHaveLength(0);
  });
});

describe('formatJavaDiff', () => {
  test('formats version change', () => {
    const out = formatJavaDiff({ versionChanged: true, oldVersion: 'v17', newVersion: 'v21', added: [], removed: [] });
    expect(out).toContain('v17 → v21');
  });

  test('formats added and removed', () => {
    const out = formatJavaDiff({ versionChanged: false, added: ['pkg-new'], removed: ['pkg-old'] });
    expect(out).toContain('+ pkg-new');
    expect(out).toContain('- pkg-old');
  });

  test('returns empty string when no diff', () => {
    const out = formatJavaDiff({ versionChanged: false, added: [], removed: [] });
    expect(out).toBe('');
  });
});
