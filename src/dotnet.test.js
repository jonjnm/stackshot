const { diffDotnet, formatDotnetDiff } = require('./dotnet');

describe('diffDotnet', () => {
  const base = {
    version: '8.0.0',
    packages: [
      { name: 'dotnet-ef', version: '8.0.0' },
      { name: 'dotnet-outdated-tool', version: '4.6.0' }
    ]
  };

  test('no diff when identical', () => {
    const diff = diffDotnet(base, base);
    expect(diff.added).toHaveLength(0);
    expect(diff.removed).toHaveLength(0);
    expect(diff.versionChanged).toBe(false);
  });

  test('detects added package', () => {
    const current = { ...base, packages: [...base.packages, { name: 'csharprepl', version: '0.8.0' }] };
    const diff = diffDotnet(base, current);
    expect(diff.added).toHaveLength(1);
    expect(diff.added[0].name).toBe('csharprepl');
  });

  test('detects removed package', () => {
    const current = { ...base, packages: [base.packages[0]] };
    const diff = diffDotnet(base, current);
    expect(diff.removed).toHaveLength(1);
    expect(diff.removed[0].name).toBe('dotnet-outdated-tool');
  });

  test('detects version change', () => {
    const current = { ...base, version: '9.0.0' };
    const diff = diffDotnet(base, current);
    expect(diff.versionChanged).toBe(true);
  });
});

describe('formatDotnetDiff', () => {
  test('formats added and removed', () => {
    const diff = {
      versionChanged: false,
      added: [{ name: 'csharprepl', version: '0.8.0' }],
      removed: [{ name: 'dotnet-ef' }]
    };
    const out = formatDotnetDiff(diff);
    expect(out).toContain('+ csharprepl');
    expect(out).toContain('- dotnet-ef');
  });

  test('mentions version change', () => {
    const diff = { versionChanged: true, added: [], removed: [] };
    expect(formatDotnetDiff(diff)).toContain('version changed');
  });
});
