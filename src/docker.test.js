const { diffDocker, formatDockerDiff } = require('./docker');

describe('diffDocker', () => {
  const base = { images: ['nginx:latest', 'node:18', 'postgres:14'] };

  test('no diff when identical', () => {
    const diff = diffDocker(base, base);
    expect(diff.added).toHaveLength(0);
    expect(diff.removed).toHaveLength(0);
  });

  test('detects added images', () => {
    const current = { images: [...base.images, 'redis:7'] };
    const diff = diffDocker(base, current);
    expect(diff.added).toContain('redis:7');
    expect(diff.removed).toHaveLength(0);
  });

  test('detects removed images', () => {
    const current = { images: ['nginx:latest', 'node:18'] };
    const diff = diffDocker(base, current);
    expect(diff.removed).toContain('postgres:14');
    expect(diff.added).toHaveLength(0);
  });

  test('detects both added and removed', () => {
    const current = { images: ['nginx:latest', 'alpine:3'] };
    const diff = diffDocker(base, current);
    expect(diff.added).toContain('alpine:3');
    expect(diff.removed).toContain('node:18');
  });
});

describe('formatDockerDiff', () => {
  test('formats added and removed', () => {
    const diff = { added: ['redis:7'], removed: ['postgres:14'] };
    const out = formatDockerDiff(diff);
    expect(out).toContain('+ redis:7');
    expect(out).toContain('- postgres:14');
  });

  test('returns empty string for no diff', () => {
    const out = formatDockerDiff({ added: [], removed: [] });
    expect(out).toBe('');
  });
});
