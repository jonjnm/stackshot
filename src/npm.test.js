const { isNpmAvailable, captureNpmConfig, diffNpmConfig, formatNpmDiff } = require('./npm');

describe('isNpmAvailable', () => {
  it('returns a boolean', () => {
    expect(typeof isNpmAvailable()).toBe('boolean');
  });
});

describe('captureNpmConfig', () => {
  it('returns an object', () => {
    const config = captureNpmConfig();
    expect(typeof config).toBe('object');
    expect(config).not.toBeNull();
  });
});

describe('diffNpmConfig', () => {
  const base = { registry: 'https://registry.npmjs.org/', loglevel: 'warn' };

  it('detects added keys', () => {
    const current = { ...base, cache: '/tmp/npm-cache' };
    const diff = diffNpmConfig(base, current);
    expect(diff.added).toHaveProperty('cache');
  });

  it('detects removed keys', () => {
    const current = { registry: base.registry };
    const diff = diffNpmConfig(base, current);
    expect(diff.removed).toHaveProperty('loglevel');
  });

  it('detects changed keys', () => {
    const current = { ...base, loglevel: 'verbose' };
    const diff = diffNpmConfig(base, current);
    expect(diff.changed.loglevel).toEqual({ from: 'warn', to: 'verbose' });
  });

  it('returns empty diff for identical configs', () => {
    const diff = diffNpmConfig(base, { ...base });
    expect(Object.keys(diff.added).length).toBe(0);
    expect(Object.keys(diff.removed).length).toBe(0);
    expect(Object.keys(diff.changed).length).toBe(0);
  });
});

describe('formatNpmDiff', () => {
  it('formats diff into readable lines', () => {
    const diff = {
      added: { cache: '/tmp' },
      removed: { loglevel: 'warn' },
      changed: { registry: { from: 'https://a.com', to: 'https://b.com' } }
    };
    const output = formatNpmDiff(diff);
    expect(output).toContain('+ cache');
    expect(output).toContain('- loglevel');
    expect(output).toContain('~ registry');
  });

  it('returns empty string for empty diff', () => {
    expect(formatNpmDiff({ added: {}, removed: {}, changed: {} })).toBe('');
  });
});
