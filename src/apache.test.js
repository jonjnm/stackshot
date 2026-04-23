const { diffApache, formatApacheDiff } = require('./apache');

describe('diffApache', () => {
  const base = {
    version: '2.4.51',
    modules: ['core_module', 'http_module', 'ssl_module']
  };

  test('returns empty diff when snapshots are identical', () => {
    const diff = diffApache(base, { ...base, modules: [...base.modules] });
    expect(Object.keys(diff)).toHaveLength(0);
  });

  test('detects version change', () => {
    const diff = diffApache(base, { ...base, modules: base.modules, version: '2.4.57' });
    expect(diff.version).toEqual({ from: '2.4.51', to: '2.4.57' });
  });

  test('detects added module', () => {
    const snap2 = { ...base, modules: [...base.modules, 'rewrite_module'] };
    const diff = diffApache(base, snap2);
    expect(diff.modules.added).toContain('rewrite_module');
    expect(diff.modules.removed).toHaveLength(0);
  });

  test('detects removed module', () => {
    const snap2 = { ...base, modules: ['core_module', 'http_module'] };
    const diff = diffApache(base, snap2);
    expect(diff.modules.removed).toContain('ssl_module');
    expect(diff.modules.added).toHaveLength(0);
  });

  test('handles missing modules array gracefully', () => {
    const diff = diffApache({ version: '2.4.51' }, { version: '2.4.51' });
    expect(Object.keys(diff)).toHaveLength(0);
  });
});

describe('formatApacheDiff', () => {
  test('formats version change', () => {
    const out = formatApacheDiff({ version: { from: '2.4.51', to: '2.4.57' } });
    expect(out).toContain('2.4.51');
    expect(out).toContain('2.4.57');
  });

  test('formats added and removed modules', () => {
    const out = formatApacheDiff({
      modules: { added: ['rewrite_module'], removed: ['ssl_module'] }
    });
    expect(out).toContain('+ rewrite_module');
    expect(out).toContain('- ssl_module');
  });

  test('returns empty string for empty diff', () => {
    expect(formatApacheDiff({})).toBe('');
  });
});
