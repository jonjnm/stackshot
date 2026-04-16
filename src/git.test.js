const { captureGitConfig, diffGit, formatGitDiff } = require('./git');

describe('captureGitConfig', () => {
  it('returns object with available and config keys', () => {
    const result = captureGitConfig();
    expect(result).toHaveProperty('available');
    expect(result).toHaveProperty('config');
    expect(typeof result.config).toBe('object');
  });
});

describe('diffGit', () => {
  const base = { available: true, config: { 'user.name': 'Alice', 'user.email': 'a@a.com', 'core.editor': 'vim' } };

  it('detects added keys', () => {
    const current = { available: true, config: { ...base.config, 'pull.rebase': 'false' } };
    const diff = diffGit(base, current);
    expect(diff.added).toEqual({ 'pull.rebase': 'false' });
  });

  it('detects removed keys', () => {
    const current = { available: true, config: { 'user.name': 'Alice', 'user.email': 'a@a.com' } };
    const diff = diffGit(base, current);
    expect(diff.removed).toEqual({ 'core.editor': 'vim' });
  });

  it('detects changed keys', () => {
    const current = { available: true, config: { ...base.config, 'user.name': 'Bob' } };
    const diff = diffGit(base, current);
    expect(diff.changed['user.name']).toEqual({ from: 'Alice', to: 'Bob' });
  });

  it('returns empty diff when configs match', () => {
    const diff = diffGit(base, base);
    expect(Object.keys(diff.added).length).toBe(0);
    expect(Object.keys(diff.removed).length).toBe(0);
    expect(Object.keys(diff.changed).length).toBe(0);
  });
});

describe('formatGitDiff', () => {
  it('formats diff into readable lines', () => {
    const diff = {
      added: { 'pull.rebase': 'false' },
      removed: { 'core.editor': 'vim' },
      changed: { 'user.name': { from: 'Alice', to: 'Bob' } }
    };
    const out = formatGitDiff(diff);
    expect(out).toContain('+ pull.rebase=false');
    expect(out).toContain('- core.editor=vim');
    expect(out).toContain('~ user.name: Alice → Bob');
  });

  it('returns empty string for empty diff', () => {
    expect(formatGitDiff({ added: {}, removed: {}, changed: {} })).toBe('');
  });
});
