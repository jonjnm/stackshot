const { diffScala, formatScalaDiff } = require('./scala');

describe('diffScala', () => {
  const base = {
    version: 'Scala 3.3.0',
    packages: [
      { org: 'org.typelevel', name: 'cats-core', version: '2.9.0' },
      { org: 'com.typesafe.akka', name: 'akka-actor', version: '2.8.0' }
    ]
  };

  test('no diff when identical', () => {
    const diff = diffScala(base, base);
    expect(diff.added).toHaveLength(0);
    expect(diff.removed).toHaveLength(0);
    expect(diff.versionChanged).toHaveLength(0);
    expect(diff.versionDiff).toBe(false);
  });

  test('detects added package', () => {
    const current = { ...base, packages: [...base.packages, { org: 'io.circe', name: 'circe-core', version: '0.14.5' }] };
    const diff = diffScala(base, current);
    expect(diff.added).toHaveLength(1);
    expect(diff.added[0].name).toBe('circe-core');
  });

  test('detects removed package', () => {
    const current = { ...base, packages: [base.packages[0]] };
    const diff = diffScala(base, current);
    expect(diff.removed).toHaveLength(1);
    expect(diff.removed[0].name).toBe('akka-actor');
  });

  test('detects version change', () => {
    const current = { ...base, packages: [{ ...base.packages[0], version: '2.10.0' }, base.packages[1]] };
    const diff = diffScala(base, current);
    expect(diff.versionChanged).toHaveLength(1);
  });

  test('detects scala version diff', () => {
    const current = { ...base, version: 'Scala 3.4.0' };
    const diff = diffScala(base, current);
    expect(diff.versionDiff).toBe(true);
  });
});

describe('formatScalaDiff', () => {
  test('formats diff output', () => {
    const diff = {
      versionDiff: true,
      added: [{ name: 'circe-core', version: '0.14.5' }],
      removed: [],
      versionChanged: []
    };
    const out = formatScalaDiff(diff);
    expect(out).toContain('scala version changed');
    expect(out).toContain('+ circe-core');
  });

  test('returns empty string for no diff', () => {
    const out = formatScalaDiff({ versionDiff: false, added: [], removed: [], versionChanged: [] });
    expect(out).toBe('');
  });
});
