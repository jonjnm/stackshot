const { diffSsh, formatSshDiff } = require('./ssh');

describe('diffSsh', () => {
  const base = {
    keys: ['id_rsa', 'id_ed25519'],
    hosts: [{ host: 'github.com', options: { hostname: 'github.com' } }]
  };

  test('no changes returns empty diffs', () => {
    const result = diffSsh(base, base);
    expect(result.keys.added).toEqual([]);
    expect(result.keys.removed).toEqual([]);
    expect(result.hosts.added).toEqual([]);
    expect(result.hosts.removed).toEqual([]);
  });

  test('detects added key', () => {
    const current = { ...base, keys: [...base.keys, 'id_work'] };
    const result = diffSsh(base, current);
    expect(result.keys.added).toContain('id_work');
  });

  test('detects removed key', () => {
    const current = { ...base, keys: ['id_rsa'] };
    const result = diffSsh(base, current);
    expect(result.keys.removed).toContain('id_ed25519');
  });

  test('detects added ssh host', () => {
    const current = { ...base, hosts: [...base.hosts, { host: 'myserver', options: {} }] };
    const result = diffSsh(base, current);
    expect(result.hosts.added).toContain('myserver');
  });

  test('detects removed ssh host', () => {
    const current = { ...base, hosts: [] };
    const result = diffSsh(base, current);
    expect(result.hosts.removed).toContain('github.com');
  });
});

describe('formatSshDiff', () => {
  test('returns no changes message when empty', () => {
    const diff = { keys: { added: [], removed: [] }, hosts: { added: [], removed: [] } };
    expect(formatSshDiff(diff)).toContain('No SSH changes');
  });

  test('formats added keys', () => {
    const diff = { keys: { added: ['id_work'], removed: [] }, hosts: { added: [], removed: [] } };
    expect(formatSshDiff(diff)).toContain('id_work');
  });

  test('formats removed hosts', () => {
    const diff = { keys: { added: [], removed: [] }, hosts: { added: [], removed: ['myserver'] } };
    expect(formatSshDiff(diff)).toContain('myserver');
  });
});
