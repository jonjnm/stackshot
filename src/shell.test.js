const { diffShell, formatShellDiff } = require('./shell');

describe('diffShell', () => {
  const base = {
    aliases: { ll: 'ls -la', gs: 'git status' },
    configs: { '.zshrc': 'export PATH=...', '.bashrc': 'echo hi' },
  };

  test('no diff when identical', () => {
    const d = diffShell(base, base);
    expect(Object.keys(d.aliases.added)).toHaveLength(0);
    expect(Object.keys(d.aliases.removed)).toHaveLength(0);
    expect(Object.keys(d.aliases.changed)).toHaveLength(0);
    expect(d.configs.added).toHaveLength(0);
    expect(d.configs.removed).toHaveLength(0);
  });

  test('detects added alias', () => {
    const current = { ...base, aliases: { ...base.aliases, gp: 'git push' } };
    const d = diffShell(base, current);
    expect(d.aliases.added).toHaveProperty('gp', 'git push');
  });

  test('detects removed alias', () => {
    const current = { ...base, aliases: { ll: 'ls -la' } };
    const d = diffShell(base, current);
    expect(d.aliases.removed).toHaveProperty('gs');
  });

  test('detects changed alias', () => {
    const current = { ...base, aliases: { ...base.aliases, ll: 'ls -lah' } };
    const d = diffShell(base, current);
    expect(d.aliases.changed.ll).toEqual({ from: 'ls -la', to: 'ls -lah' });
  });

  test('detects added config file', () => {
    const current = { ...base, configs: { ...base.configs, '.zprofile': 'export X=1' } };
    const d = diffShell(base, current);
    expect(d.configs.added).toContain('.zprofile');
  });

  test('detects removed config file', () => {
    const current = { ...base, configs: { '.zshrc': 'export PATH=...' } };
    const d = diffShell(base, current);
    expect(d.configs.removed).toContain('.bashrc');
  });
});

describe('formatShellDiff', () => {
  test('formats diff lines', () => {
    const diff = {
      aliases: { added: { gp: 'git push' }, removed: { gs: 'git status' }, changed: {} },
      configs: { added: ['.zprofile'], removed: [] },
    };
    const lines = formatShellDiff(diff);
    expect(lines).toContain("+ alias gp='git push'");
    expect(lines).toContain("- alias gs='git status'");
    expect(lines).toContain('+ config file: .zprofile');
  });
});
