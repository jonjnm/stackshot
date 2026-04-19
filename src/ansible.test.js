const { diffAnsible, formatAnsibleDiff } = require('./ansible');

describe('diffAnsible', () => {
  const base = {
    version: '2.14.0',
    collections: { 'community.general': '7.0.0', 'ansible.posix': '1.5.0' }
  };

  test('no diff returns empty arrays', () => {
    const result = diffAnsible(base, base);
    expect(result.added).toHaveLength(0);
    expect(result.removed).toHaveLength(0);
    expect(result.changed).toHaveLength(0);
    expect(result.versionChanged).toBe(false);
  });

  test('detects added collection', () => {
    const snap2 = { ...base, collections: { ...base.collections, 'community.docker': '3.0.0' } };
    const result = diffAnsible(base, snap2);
    expect(result.added).toContain('community.docker');
  });

  test('detects removed collection', () => {
    const snap2 = { ...base, collections: { 'community.general': '7.0.0' } };
    const result = diffAnsible(base, snap2);
    expect(result.removed).toContain('ansible.posix');
  });

  test('detects changed version', () => {
    const snap2 = { ...base, collections: { ...base.collections, 'community.general': '7.1.0' } };
    const result = diffAnsible(base, snap2);
    expect(result.changed[0]).toMatchObject({ name: 'community.general', from: '7.0.0', to: '7.1.0' });
  });

  test('detects ansible version change', () => {
    const snap2 = { ...base, version: '2.15.0' };
    const result = diffAnsible(base, snap2);
    expect(result.versionChanged).toBe(true);
  });
});

describe('formatAnsibleDiff', () => {
  test('formats diff output', () => {
    const diff = {
      versionChanged: true,
      added: ['community.docker'],
      removed: ['ansible.posix'],
      changed: [{ name: 'community.general', from: '7.0.0', to: '7.1.0' }]
    };
    const out = formatAnsibleDiff(diff);
    expect(out).toContain('+ community.docker');
    expect(out).toContain('- ansible.posix');
    expect(out).toContain('~ community.general');
    expect(out).toContain('ansible version changed');
  });

  test('returns empty string for no diff', () => {
    const out = formatAnsibleDiff({ versionChanged: false, added: [], removed: [], changed: [] });
    expect(out).toBe('');
  });
});
