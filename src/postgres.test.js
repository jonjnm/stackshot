const { diffPostgres, formatPostgresDiff } = require('./postgres');

describe('diffPostgres', () => {
  it('detects added databases', () => {
    const s1 = { postgres: { databases: ['mydb'], version: 'psql 14.0' } };
    const s2 = { postgres: { databases: ['mydb', 'newdb'], version: 'psql 14.0' } };
    const diff = diffPostgres(s1, s2);
    expect(diff.added).toContain('newdb');
    expect(diff.removed).toHaveLength(0);
    expect(diff.versionChanged).toBe(false);
  });

  it('detects removed databases', () => {
    const s1 = { postgres: { databases: ['mydb', 'olddb'], version: 'psql 14.0' } };
    const s2 = { postgres: { databases: ['mydb'], version: 'psql 14.0' } };
    const diff = diffPostgres(s1, s2);
    expect(diff.removed).toContain('olddb');
    expect(diff.added).toHaveLength(0);
  });

  it('detects version change', () => {
    const s1 = { postgres: { databases: [], version: 'psql 13.0' } };
    const s2 = { postgres: { databases: [], version: 'psql 14.0' } };
    const diff = diffPostgres(s1, s2);
    expect(diff.versionChanged).toBe(true);
  });

  it('handles missing postgres key', () => {
    const diff = diffPostgres({}, {});
    expect(diff.added).toHaveLength(0);
    expect(diff.removed).toHaveLength(0);
  });
});

describe('formatPostgresDiff', () => {
  it('formats added and removed databases', () => {
    const diff = { added: ['newdb'], removed: ['olddb'], versionChanged: false };
    const out = formatPostgresDiff(diff);
    expect(out).toContain('+ database: newdb');
    expect(out).toContain('- database: olddb');
  });

  it('formats version change', () => {
    const diff = { added: [], removed: [], versionChanged: true, version1: 'psql 13.0', version2: 'psql 14.0' };
    const out = formatPostgresDiff(diff);
    expect(out).toContain('psql 13.0');
    expect(out).toContain('psql 14.0');
  });
});
