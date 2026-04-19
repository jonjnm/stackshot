const { diffVagrant, formatVagrantDiff } = require('./vagrant');

describe('diffVagrant', () => {
  const base = { name: 'ubuntu/focal64', provider: 'virtualbox', version: '20240101.0.0' };

  test('no diff when identical', () => {
    const diff = diffVagrant({ boxes: [base] }, { boxes: [base] });
    expect(diff.added).toHaveLength(0);
    expect(diff.removed).toHaveLength(0);
    expect(diff.versionChanged).toHaveLength(0);
  });

  test('detects added box', () => {
    const newBox = { name: 'debian/bullseye64', provider: 'virtualbox', version: '11.0.0' };
    const diff = diffVagrant({ boxes: [base] }, { boxes: [base, newBox] });
    expect(diff.added).toHaveLength(1);
    expect(diff.added[0].name).toBe('debian/bullseye64');
  });

  test('detects removed box', () => {
    const diff = diffVagrant({ boxes: [base] }, { boxes: [] });
    expect(diff.removed).toHaveLength(1);
    expect(diff.removed[0].name).toBe('ubuntu/focal64');
  });

  test('detects version change', () => {
    const updated = { ...base, version: '20240201.0.0' };
    const diff = diffVagrant({ boxes: [base] }, { boxes: [updated] });
    expect(diff.versionChanged).toHaveLength(1);
    expect(diff.versionChanged[0].version).toBe('20240201.0.0');
  });

  test('handles empty snapshots', () => {
    const diff = diffVagrant({ boxes: [] }, { boxes: [] });
    expect(diff.added).toHaveLength(0);
    expect(diff.removed).toHaveLength(0);
  });
});

describe('formatVagrantDiff', () => {
  test('formats added boxes', () => {
    const diff = { added: [{ name: 'ubuntu/focal64', provider: 'virtualbox', version: '1.0' }], removed: [], versionChanged: [] };
    expect(formatVagrantDiff(diff)).toContain('+ ubuntu/focal64');
  });

  test('returns empty string for no changes', () => {
    expect(formatVagrantDiff({ added: [], removed: [], versionChanged: [] })).toBe('');
  });
});
