const { diffVSCode, formatVSCodeDiff } = require('./vscode');

describe('diffVSCode', () => {
  const base = {
    extensions: ['ms-python.python', 'esbenp.prettier-vscode', 'dbaeumer.vscode-eslint'],
  };

  test('no diff when identical', () => {
    const diff = diffVSCode(base, base);
    expect(diff.addedExtensions).toEqual([]);
    expect(diff.removedExtensions).toEqual([]);
  });

  test('detects added extensions', () => {
    const current = { extensions: [...base.extensions, 'eamodio.gitlens'] };
    const diff = diffVSCode(base, current);
    expect(diff.addedExtensions).toContain('eamodio.gitlens');
    expect(diff.removedExtensions).toEqual([]);
  });

  test('detects removed extensions', () => {
    const current = { extensions: ['ms-python.python'] };
    const diff = diffVSCode(base, current);
    expect(diff.removedExtensions).toContain('esbenp.prettier-vscode');
    expect(diff.removedExtensions).toContain('dbaeumer.vscode-eslint');
    expect(diff.addedExtensions).toEqual([]);
  });

  test('detects both added and removed', () => {
    const current = { extensions: ['ms-python.python', 'eamodio.gitlens'] };
    const diff = diffVSCode(base, current);
    expect(diff.addedExtensions).toContain('eamodio.gitlens');
    expect(diff.removedExtensions).toContain('esbenp.prettier-vscode');
  });
});

describe('formatVSCodeDiff', () => {
  test('formats added and removed extensions', () => {
    const diff = { addedExtensions: ['eamodio.gitlens'], removedExtensions: ['esbenp.prettier-vscode'] };
    const output = formatVSCodeDiff(diff);
    expect(output).toContain('+ eamodio.gitlens');
    expect(output).toContain('- esbenp.prettier-vscode');
  });

  test('returns empty string when no diff', () => {
    const output = formatVSCodeDiff({ addedExtensions: [], removedExtensions: [] });
    expect(output).toBe('');
  });
});
