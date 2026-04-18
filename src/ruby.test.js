const { diffRuby, formatRubyDiff } = require('./ruby');

describe('diffRuby', () => {
  const base = {
    version: 'ruby 3.1.0p0',
    gems: { rails: '7.0.0', sinatra: '3.0.0' }
  };

  test('no diff returns empty', () => {
    const result = diffRuby(base, { ...base, gems: { ...base.gems } });
    expect(result.added).toEqual({});
    expect(result.removed).toEqual({});
    expect(result.changed).toEqual({});
    expect(result.versionChanged).toBeNull();
  });

  test('detects added gem', () => {
    const current = { ...base, gems: { ...base.gems, rspec: '3.12.0' } };
    const result = diffRuby(base, current);
    expect(result.added).toHaveProperty('rspec');
  });

  test('detects removed gem', () => {
    const current = { ...base, gems: { rails: '7.0.0' } };
    const result = diffRuby(base, current);
    expect(result.removed).toHaveProperty('sinatra');
  });

  test('detects changed gem version', () => {
    const current = { ...base, gems: { rails: '7.1.0', sinatra: '3.0.0' } };
    const result = diffRuby(base, current);
    expect(result.changed.rails).toEqual({ from: '7.0.0', to: '7.1.0' });
  });

  test('detects ruby version change', () => {
    const current = { ...base, version: 'ruby 3.2.0p0' };
    const result = diffRuby(base, current);
    expect(result.versionChanged).toEqual({ from: 'ruby 3.1.0p0', to: 'ruby 3.2.0p0' });
  });
});

describe('formatRubyDiff', () => {
  test('formats all diff types', () => {
    const diff = {
      versionChanged: { from: '3.1.0', to: '3.2.0' },
      added: { rspec: '3.12.0' },
      removed: { sinatra: '3.0.0' },
      changed: { rails: { from: '7.0.0', to: '7.1.0' } }
    };
    const output = formatRubyDiff(diff);
    expect(output).toContain('ruby version:');
    expect(output).toContain('+ rspec');
    expect(output).toContain('- sinatra');
    expect(output).toContain('~ rails');
  });

  test('returns empty string for no diff', () => {
    const diff = { versionChanged: null, added: {}, removed: {}, changed: {} };
    expect(formatRubyDiff(diff)).toBe('');
  });
});
