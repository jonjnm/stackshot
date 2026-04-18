const { diffPython, formatPythonDiff } = require('./python');

describe('diffPython', () => {
  const base = { requests: '2.28.0', flask: '2.2.0', numpy: '1.24.0' };

  test('detects added packages', () => {
    const current = { ...base, pandas: '1.5.0' };
    const diff = diffPython(base, current);
    expect(diff.added).toEqual({ pandas: '1.5.0' });
  });

  test('detects removed packages', () => {
    const { flask, ...current } = base;
    const diff = diffPython(base, current);
    expect(diff.removed).toEqual({ flask: '2.2.0' });
  });

  test('detects changed versions', () => {
    const current = { ...base, requests: '2.29.0' };
    const diff = diffPython(base, current);
    expect(diff.changed).toEqual({ requests: { from: '2.28.0', to: '2.29.0' } });
  });

  test('returns empty diff when identical', () => {
    const diff = diffPython(base, { ...base });
    expect(diff.added).toEqual({});
    expect(diff.removed).toEqual({});
    expect(diff.changed).toEqual({});
  });
});

describe('formatPythonDiff', () => {
  test('formats all diff types', () => {
    const diff = {
      added: { pandas: '1.5.0' },
      removed: { flask: '2.2.0' },
      changed: { requests: { from: '2.28.0', to: '2.29.0' } }
    };
    const output = formatPythonDiff(diff);
    expect(output).toContain('+ pandas@1.5.0');
    expect(output).toContain('- flask@2.2.0');
    expect(output).toContain('~ requests: 2.28.0 → 2.29.0');
  });

  test('returns empty string for no changes', () => {
    const output = formatPythonDiff({ added: {}, removed: {}, changed: {} });
    expect(output).toBe('');
  });
});
