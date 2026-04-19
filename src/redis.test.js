const { diffRedis, formatRedisDiff } = require('./redis');

describe('diffRedis', () => {
  test('detects added keys', () => {
    const diff = diffRedis({}, { maxmemory: '100mb' });
    expect(diff.added).toEqual({ maxmemory: '100mb' });
  });

  test('detects removed keys', () => {
    const diff = diffRedis({ maxmemory: '100mb' }, {});
    expect(diff.removed).toEqual({ maxmemory: '100mb' });
  });

  test('detects changed values', () => {
    const diff = diffRedis({ maxmemory: '100mb' }, { maxmemory: '200mb' });
    expect(diff.changed).toEqual({ maxmemory: { from: '100mb', to: '200mb' } });
  });

  test('returns empty diff for identical configs', () => {
    const cfg = { maxmemory: '100mb', timeout: '0' };
    const diff = diffRedis(cfg, { ...cfg });
    expect(diff.added).toEqual({});
    expect(diff.removed).toEqual({});
    expect(diff.changed).toEqual({});
  });
});

describe('formatRedisDiff', () => {
  test('formats added, removed, changed', () => {
    const diff = {
      added: { hz: '10' },
      removed: { loglevel: 'notice' },
      changed: { maxmemory: { from: '100mb', to: '200mb' } }
    };
    const out = formatRedisDiff(diff);
    expect(out).toContain('+ hz: 10');
    expect(out).toContain('- loglevel: notice');
    expect(out).toContain('~ maxmemory: 100mb});

  test('returns empty string for no changes', () => {
    expect(formatRedisDiff({ added: {}, removed: {}, changed: {} })).toBe('');
  });
});
