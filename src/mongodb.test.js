const { diffMongo, formatMongoDiff } = require('./mongodb');

describe('diffMongo', () => {
  it('returns empty diff when snapshots match', () => {
    const snap = { version: '2.0.0', databases: ['admin', 'mydb'] };
    const curr = { version: '2.0.0', databases: ['admin', 'mydb'] };
    const diff = diffMongo(snap, curr);
    expect(diff.added).toEqual([]);
    expect(diff.removed).toEqual([]);
    expect(diff.versionChanged).toBe(false);
  });

  it('detects added databases', () => {
    const snap = { version: '2.0.0', databases: ['admin'] };
    const curr = { version: '2.0.0', databases: ['admin', 'newdb'] };
    const diff = diffMongo(snap, curr);
    expect(diff.added).toContain('newdb');
    expect(diff.removed).toEqual([]);
  });

  it('detects removed databases', () => {
    const snap = { version: '2.0.0', databases: ['admin', 'olddb'] };
    const curr = { version: '2.0.0', databases: ['admin'] };
    const diff = diffMongo(snap, curr);
    expect(diff.removed).toContain('olddb');
    expect(diff.added).toEqual([]);
  });

  it('detects version change', () => {
    const snap = { version: '2.0.0', databases: [] };
    const curr = { version: '2.1.0', databases: [] };
    const diff = diffMongo(snap, curr);
    expect(diff.versionChanged).toBe(true);
    expect(diff.prevVersion).toBe('2.0.0');
    expect(diff.currVersion).toBe('2.1.0');
  });
});

describe('formatMongoDiff', () => {
  it('formats version change', () => {
    const diff = { versionChanged: true, prevVersion: '2.0.0', currVersion: '2.1.0', added: [], removed: [] };
    expect(formatMongoDiff(diff)).toContain('2.0.0 → 2.1.0');
  });

  it('formats added and removed databases', () => {
    const diff = { versionChanged: false, prevVersion: null, currVersion: null, added: ['newdb'], removed: ['olddb'] };
    const out = formatMongoDiff(diff);
    expect(out).toContain('+ database: newdb');
    expect(out).toContain('- database: olddb');
  });

  it('returns empty string when no changes', () => {
    const diff = { versionChanged: false, prevVersion: null, currVersion: null, added: [], removed: [] };
    expect(formatMongoDiff(diff)).toBe('');
  });
});
