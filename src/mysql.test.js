const { diffMysql, formatMysqlDiff } = require('./mysql');

describe('diffMysql', () => {
  const base = { mysql: { version: 'mysql  Ver 8.0.32', databases: ['myapp', 'test'] } };

  test('no changes returns empty diff', () => {
    const diff = diffMysql(base, base);
    expect(diff.added).toEqual([]);
    expect(diff.removed).toEqual([]);
    expect(diff.versionChanged).toBe(false);
  });

  test('detects added database', () => {
    const snap2 = { mysql: { ...base.mysql, databases: ['myapp', 'test', 'newdb'] } };
    const diff = diffMysql(base, snap2);
    expect(diff.added).toContain('newdb');
    expect(diff.removed).toEqual([]);
  });

  test('detects removed database', () => {
    const snap2 = { mysql: { ...base.mysql, databases: ['myapp'] } };
    const diff = diffMysql(base, snap2);
    expect(diff.removed).toContain('test');
    expect(diff.added).toEqual([]);
  });

  test('detects version change', () => {
    const snap2 = { mysql: { ...base.mysql, version: 'mysql  Ver 8.1.0' } };
    const diff = diffMysql(base, snap2);
    expect(diff.versionChanged).toBe(true);
    expect(diff.newVersion).toBe('mysql  Ver 8.1.0');
  });

  test('handles missing mysql in snapshot', () => {
    const diff = diffMysql({}, {});
    expect(diff.added).toEqual([]);
    expect(diff.removed).toEqual([]);
  });
});

describe('formatMysqlDiff', () => {
  test('formats added and removed databases', () => {
    const diff = { added: ['newdb'], removed: ['olddb'], versionChanged: false };
    const out = formatMysqlDiff(diff);
    expect(out).toContain('+ database: newdb');
    expect(out).toContain('- database: olddb');
  });

  test('formats version change', () => {
    const diff = { added: [], removed: [], versionChanged: true, oldVersion: '8.0.32', newVersion: '8.1.0' };
    const out = formatMysqlDiff(diff);
    expect(out).toContain('8.0.32 -> 8.1.0');
  });

  test('returns empty string when no diff', () => {
    const diff = { added: [], removed: [], versionChanged: false };
    expect(formatMysqlDiff(diff)).toBe('');
  });
});
