const { diffConda, formatCondaDiff } = require('./conda');

const makeSnapshot = (packages) => ({ packages });

test('diffConda detects added packages', () => {
  const snap = makeSnapshot([{ name: 'numpy', version: '1.24.0' }]);
  const curr = makeSnapshot([
    { name: 'numpy', version: '1.24.0' },
    { name: 'pandas', version: '2.0.0' }
  ]);
  const diff = diffConda(snap, curr);
  expect(diff.added).toHaveLength(1);
  expect(diff.added[0].name).toBe('pandas');
  expect(diff.removed).toHaveLength(0);
});

test('diffConda detects removed packages', () => {
  const snap = makeSnapshot([{ name: 'numpy', version: '1.24.0' }, { name: 'scipy', version: '1.10.0' }]);
  const curr = makeSnapshot([{ name: 'numpy', version: '1.24.0' }]);
  const diff = diffConda(snap, curr);
  expect(diff.removed).toHaveLength(1);
  expect(diff.removed[0].name).toBe('scipy');
});

test('diffConda detects changed versions', () => {
  const snap = makeSnapshot([{ name: 'numpy', version: '1.24.0' }]);
  const curr = makeSnapshot([{ name: 'numpy', version: '1.25.0' }]);
  const diff = diffConda(snap, curr);
  expect(diff.changed).toHaveLength(1);
  expect(diff.changed[0].version).toBe('1.25.0');
});

test('diffConda returns empty diff when no changes', () => {
  const snap = makeSnapshot([{ name: 'numpy', version: '1.24.0' }]);
  const curr = makeSnapshot([{ name: 'numpy', version: '1.24.0' }]);
  const diff = diffConda(snap, curr);
  expect(diff.added).toHaveLength(0);
  expect(diff.removed).toHaveLength(0);
  expect(diff.changed).toHaveLength(0);
});

test('formatCondaDiff formats output correctly', () => {
  const diff = {
    added: [{ name: 'pandas', version: '2.0.0' }],
    removed: [{ name: 'scipy' }],
    changed: [{ name: 'numpy', version: '1.25.0' }]
  };
  const output = formatCondaDiff(diff);
  expect(output).toContain('+ pandas@2.0.0');
  expect(output).toContain('- scipy');
  expect(output).toContain('~ numpy@1.25.0');
});
