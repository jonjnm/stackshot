const { diffTerraform, formatTerraformDiff } = require('./terraform');

describe('diffTerraform', () => {
  it('returns empty diff when nothing changed', () => {
    const snap = { version: '1.5.0', workspaces: ['default', 'staging'] };
    const curr = { version: '1.5.0', workspaces: ['default', 'staging'] };
    expect(diffTerraform(snap, curr)).toEqual({});
  });

  it('detects version change', () => {
    const snap = { version: '1.4.0', workspaces: [] };
    const curr = { version: '1.5.0', workspaces: [] };
    const diff = diffTerraform(snap, curr);
    expect(diff.version).toEqual({ snapshot: '1.4.0', current: '1.5.0' });
  });

  it('detects added workspaces', () => {
    const snap = { version: '1.5.0', workspaces: ['default'] };
    const curr = { version: '1.5.0', workspaces: ['default', 'prod'] };
    const diff = diffTerraform(snap, curr);
    expect(diff.workspaces.added).toContain('prod');
    expect(diff.workspaces.removed).toHaveLength(0);
  });

  it('detects removed workspaces', () => {
    const snap = { version: '1.5.0', workspaces: ['default', 'dev'] };
    const curr = { version: '1.5.0', workspaces: ['default'] };
    const diff = diffTerraform(snap, curr);
    expect(diff.workspaces.removed).toContain('dev');
  });
});

describe('formatTerraformDiff', () => {
  it('formats version and workspace diffs', () => {
    const diff = {
      version: { snapshot: '1.4.0', current: '1.5.0' },
      workspaces: { added: ['prod'], removed: ['old'] }
    };
    const out = formatTerraformDiff(diff);
    expect(out).toContain('1.4.0 → 1.5.0');
    expect(out).toContain('+ workspace: prod');
    expect(out).toContain('- workspace: old');
  });

  it('returns empty string for empty diff', () => {
    expect(formatTerraformDiff({})).toBe('');
  });
});
