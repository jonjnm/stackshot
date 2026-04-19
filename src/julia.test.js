const { diffJulia, formatJuliaDiff } = require('./julia');

describe('diffJulia', () => {
  const base = { version: '1.9.0', packages: { DataFrames: '1.5.0', Plots: '1.38.0' } };

  test('no diff when identical', () => {
    const d = diffJulia(base, base);
    expect(d.versionChanged).toBe(false);
    expect(Object.keys(d.added)).toHaveLength(0);
    expect(Object.keys(d.removed)).toHaveLength(0);
    expect(Object.keys(d.changed)).toHaveLength(0);
  });

  test('detects added package', () => {
    const snap2 = { ...base, packages: { ...base.packages, Flux: '0.13.0' } };
    const d = diffJulia(base, snap2);
    expect(d.added).toHaveProperty('Flux', '0.13.0');
  });

  test('detects removed package', () => {
    const snap2 = { ...base, packages: { DataFrames: '1.5.0' } };
    const d = diffJulia(base, snap2);
    expect(d.removed).toHaveProperty('Plots');
  });

  test('detects changed version', () => {
    const snap2 = { ...base, packages: { DataFrames: '1.6.0', Plots: '1.38.0' } };
    const d = diffJulia(base, snap2);
    expect(d.changed.DataFrames).toEqual({ from: '1.5.0', to: '1.6.0' });
  });

  test('detects julia version change', () => {
    const snap2 = { ...base, version: '1.10.0' };
    const d = diffJulia(base, snap2);
    expect(d.versionChanged).toBe(true);
  });
});

describe('formatJuliaDiff', () => {
  test('formats all diff types', () => {
    const diff = {
      versionChanged: true,
      added: { Flux: '0.13.0' },
      removed: { Plots: '1.38.0' },
      changed: { DataFrames: { from: '1.5.0', to: '1.6.0' } }
    };
    const out = formatJuliaDiff(diff);
    expect(out).toContain('+ Flux@0.13.0');
    expect(out).toContain('- Plots@1.38.0');
    expect(out).toContain('~ DataFrames: 1.5.0 -> 1.6.0');
  });

  test('returns empty string for no diff', () => {
    const out = formatJuliaDiff({ versionChanged: false, added: {}, removed: {}, changed: {} });
    expect(out).toBe('');
  });
});
