const { diffBrew, formatBrewDiff } = require('./brew');

describe('diffBrew', () => {
  const snap = { formulae: ['git', 'wget', 'jq'], casks: ['iterm2'] };
  const curr = { formulae: ['git', 'curl'], casks: ['iterm2', 'slack'] };

  test('detects missing formulae (in snapshot, not in current)', () => {
    const diff = diffBrew(snap, curr);
    expect(diff.added.formulae).toContain('wget');
    expect(diff.added.formulae).toContain('jq');
  });

  test('detects extra formulae (in current, not in snapshot)', () => {
    const diff = diffBrew(snap, curr);
    expect(diff.removed.formulae).toContain('curl');
  });

  test('detects cask differences', () => {
    const diff = diffBrew(snap, curr);
    expect(diff.removed.casks).toContain('slack');
    expect(diff.added.casks).toHaveLength(0);
  });

  test('returns empty diff when identical', () => {
    const diff = diffBrew(snap, snap);
    expect(diff.added.formulae).toHaveLength(0);
    expect(diff.removed.formulae).toHaveLength(0);
  });

  test('handles missing keys gracefully', () => {
    const diff = diffBrew({}, {});
    expect(diff.added.formulae).toHaveLength(0);
  });

  test('does not include common entries in added or removed', () => {
    const diff = diffBrew(snap, curr);
    expect(diff.added.formulae).not.toContain('git');
    expect(diff.removed.formulae).not.toContain('git');
    expect(diff.added.casks).not.toContain('iterm2');
    expect(diff.removed.casks).not.toContain('iterm2');
  });
});

describe('formatBrewDiff', () => {
  test('formats added and removed entries', () => {
    const diff = {
      added: { formulae: ['jq'], casks: [] },
      removed: { formulae: [], casks: ['slack'] },
    };
    const lines = formatBrewDiff(diff);
    expect(lines).toContain('+ [formulae] jq');
    expect(lines).toContain('- [casks] slack');
  });

  test('returns empty array when no diff', () => {
    const diff = { added: { formulae: [], casks: [] }, removed: { formulae: [], casks: [] } };
    expect(formatBrewDiff(diff)).toHaveLength(0);
  });
});
