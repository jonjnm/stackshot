const { diffPerl, formatPerlDiff } = require('./perl');

describe('diffPerl', () => {
  it('detects added packages', () => {
    const snap = { version: '5.030', packages: {} };
    const cur = { version: '5.030', packages: { 'Moose': '2.2015' } };
    const diff = diffPerl(snap, cur);
    expect(diff.added['Moose']).toBe('2.2015');
    expect(Object.keys(diff.removed)).toHaveLength(0);
  });

  it('detects removed packages', () => {
    const snap = { version: '5.030', packages: { 'Moose': '2.2015' } };
    const cur = { version: '5.030', packages: {} };
    const diff = diffPerl(snap, cur);
    expect(diff.removed['Moose']).toBe('2.2015');
  });

  it('detects changed packages', () => {
    const snap = { version: '5.030', packages: { 'Moose': '2.2014' } };
    const cur = { version: '5.030', packages: { 'Moose': '2.2015' } };
    const diff = diffPerl(snap, cur);
    expect(diff.changed['Moose']).toEqual({ from: '2.2014', to: '2.2015' });
  });

  it('detects version change', () => {
    const snap = { version: '5.028', packages: {} };
    const cur = { version: '5.030', packages: {} };
    const diff = diffPerl(snap, cur);
    expect(diff.versionChanged).toEqual({ from: '5.028', to: '5.030' });
  });

  it('returns no diff when identical', () => {
    const snap = { version: '5.030', packages: { 'Moose': '2.2015' } };
    const diff = diffPerl(snap, { ...snap, packages: { ...snap.packages } });
    expect(diff.versionChanged).toBeNull();
    expect(Object.keys(diff.added)).toHaveLength(0);
    expect(Object.keys(diff.removed)).toHaveLength(0);
  });
});

describe('formatPerlDiff', () => {
  it('formats diffs into readable lines', () => {
    const diff = {
      versionChanged: { from: '5.028', to: '5.030' },
      added: { 'Try::Tiny': '0.31' },
      removed: { 'OldModule': '1.0' },
      changed: {}
    };
    const out = formatPerlDiff(diff);
    expect(out).toContain('perl version: 5.028 → 5.030');
    expect(out).toContain('+ Try::Tiny@0.31');
    expect(out).toContain('- OldModule@1.0');
  });

  it('returns empty string for empty diff', () => {
    const out = formatPerlDiff({ versionChanged: null, added: {}, removed: {}, changed: {} });
    expect(out).toBe('');
  });
});
