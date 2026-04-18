const { diffKotlin, formatKotlinDiff } = require('./kotlin');

describe('diffKotlin', () => {
  it('returns empty diff when identical', () => {
    const snap = { kotlinVersion: '1.9.0', gradleDeps: ['com.squareup.okhttp3:okhttp:4.9.0'] };
    const curr = { kotlinVersion: '1.9.0', gradleDeps: ['com.squareup.okhttp3:okhttp:4.9.0'] };
    const diff = diffKotlin(snap, curr);
    expect(diff.kotlinVersion).toBeNull();
    expect(diff.added).toHaveLength(0);
    expect(diff.removed).toHaveLength(0);
  });

  it('detects version change', () => {
    const snap = { kotlinVersion: '1.8.0', gradleDeps: [] };
    const curr = { kotlinVersion: '1.9.0', gradleDeps: [] };
    const diff = diffKotlin(snap, curr);
    expect(diff.kotlinVersion).toEqual({ from: '1.8.0', to: '1.9.0' });
  });

  it('detects added and removed deps', () => {
    const snap = { kotlinVersion: '1.9.0', gradleDeps: ['old:dep:1.0'] };
    const curr = { kotlinVersion: '1.9.0', gradleDeps: ['new:dep:2.0'] };
    const diff = diffKotlin(snap, curr);
    expect(diff.added).toContain('new:dep:2.0');
    expect(diff.removed).toContain('old:dep:1.0');
  });

  it('handles missing gradleDeps gracefully', () => {
    const snap = { kotlinVersion: '1.9.0' };
    const curr = { kotlinVersion: '1.9.0' };
    const diff = diffKotlin(snap, curr);
    expect(diff.added).toHaveLength(0);
    expect(diff.removed).toHaveLength(0);
  });
});

describe('formatKotlinDiff', () => {
  it('formats version and dep changes', () => {
    const diff = { kotlinVersion: { from: '1.8.0', to: '1.9.0' }, added: ['new:dep:1.0'], removed: ['old:dep:0.9'] };
    const out = formatKotlinDiff(diff);
    expect(out).toContain('1.8.0 → 1.9.0');
    expect(out).toContain('+ new:dep:1.0');
    expect(out).toContain('- old:dep:0.9');
  });

  it('returns empty string when no changes', () => {
    const diff = { kotlinVersion: null, added: [], removed: [] };
    expect(formatKotlinDiff(diff)).toBe('');
  });
});
