const { diffGo, formatGoDiff } = require('./golang');

describe('diffGo', () => {
  const base = {
    version: '1.21.0',
    packages: [
      { name: 'github.com/gin-gonic/gin', version: 'v1.9.0' },
      { name: 'github.com/stretchr/testify', version: 'v1.8.0' }
    ]
  };

  test('no diff when identical', () => {
    const diff = diffGo(base, base);
    expect(diff.added).toHaveLength(0);
    expect(diff.removed).toHaveLength(0);
    expect(diff.changed).toHaveLength(0);
    expect(diff.versionChanged).toBe(false);
  });

  test('detects added package', () => {
    const current = { ...base, packages: [...base.packages, { name: 'github.com/spf13/cobra', version: 'v1.7.0' }] };
    const diff = diffGo(base, current);
    expect(diff.added).toHaveLength(1);
    expect(diff.added[0].name).toBe('github.com/spf13/cobra');
  });

  test('detects removed package', () => {
    const current = { ...base, packages: [base.packages[0]] };
    const diff = diffGo(base, current);
    expect(diff.removed).toHaveLength(1);
    expect(diff.removed[0].name).toBe('github.com/stretchr/testify');
  });

  test('detects version change', () => {
    const current = { ...base, version: '1.22.0' };
    const diff = diffGo(base, current);
    expect(diff.versionChanged).toBe(true);
  });

  test('detects changed package version', () => {
    const current = { ...base, packages: [{ name: 'github.com/gin-gonic/gin', version: 'v1.9.1' }, base.packages[1]] };
    const diff = diffGo(base, current);
    expect(diff.changed).toHaveLength(1);
  });
});

describe('formatGoDiff', () => {
  test('formats diff output', () => {
    const diff = {
      versionChanged: true,
      snapshotVersion: '1.21.0',
      currentVersion: '1.22.0',
      added: [{ name: 'github.com/foo/bar', version: 'v1.0.0' }],
      removed: [],
      changed: []
    };
    const out = formatGoDiff(diff);
    expect(out).toContain('1.21.0');
    expect(out).toContain('1.22.0');
    expect(out).toContain('github.com/foo/bar');
  });
});
