const { diffFlutter, formatFlutterDiff } = require('./flutter');

describe('diffFlutter', () => {
  it('detects added packages', () => {
    const snap = { flutter: '3.0.0' };
    const cur = { flutter: '3.0.0', provider: '6.0.0' };
    const d = diffFlutter(snap, cur);
    expect(d.added).toEqual({ provider: '6.0.0' });
    expect(d.removed).toEqual({});
    expect(d.changed).toEqual({});
  });

  it('detects removed packages', () => {
    const snap = { flutter: '3.0.0', riverpod: '2.0.0' };
    const cur = { flutter: '3.0.0' };
    const d = diffFlutter(snap, cur);
    expect(d.removed).toEqual({ riverpod: '2.0.0' });
    expect(d.added).toEqual({});
  });

  it('detects changed versions', () => {
    const snap = { flutter: '3.0.0' };
    const cur = { flutter: '3.10.0' };
    const d = diffFlutter(snap, cur);
    expect(d.changed).toEqual({ flutter: { from: '3.0.0', to: '3.10.0' } });
  });

  it('returns empty diff for identical snapshots', () => {
    const snap = { flutter: '3.0.0' };
    const d = diffFlutter(snap, { ...snap });
    expect(d.added).toEqual({});
    expect(d.removed).toEqual({});
    expect(d.changed).toEqual({});
  });
});

describe('formatFlutterDiff', () => {
  it('formats all diff types', () => {
    const diff = {
      added: { provider: '6.0.0' },
      removed: { bloc: '8.0.0' },
      changed: { flutter: { from: '3.0.0', to: '3.10.0' } }
    };
    const out = formatFlutterDiff(diff);
    expect(out).toContain('+ provider@6.0.0');
    expect(out).toContain('- bloc@8.0.0');
    expect(out).toContain('~ flutter: 3.0.0 -> 3.10.0');
  });

  it('returns empty string for no diff', () => {
    const out = formatFlutterDiff({ added: {}, removed: {}, changed: {} });
    expect(out).toBe('');
  });
});
