const { isFlutterAvailable, captureFlutterVersion, captureFlutterPackages, diffFlutter, formatFlutterDiff } = require('./flutter');
const { execSync } = require('child_process');

jest.mock('child_process');

beforeEach(() => jest.clearAllMocks());

test('isFlutterAvailable returns true when flutter found', async () => {
  execSync.mockReturnValue(Buffer.from('Flutter 3.10.0'));
  expect(await isFlutterAvailable()).toBe(true);
});

test('isFlutterAvailable returns false on error', async () => {
  execSync.mockImplementation(() => { throw new Error(); });
  expect(await isFlutterAvailable()).toBe(false);
});

test('captureFlutterVersion parses version string', async () => {
  execSync.mockReturnValue(Buffer.from('Flutter 3.10.0 • channel stable'));
  const v = await captureFlutterVersion();
  expect(v).toBe('3.10.0');
});

test('captureFlutterPackages returns list of packages', async () => {
  execSync.mockReturnValue(Buffer.from('provider 6.0.0\nriverpod 2.3.0\n'));
  const pkgs = await captureFlutterPackages();
  expect(pkgs).toEqual([
    { name: 'provider', version: '6.0.0' },
    { name: 'riverpod', version: '2.3.0' }
  ]);
});

test('diffFlutter detects added packages', () => {
  const prev = { version: '3.10.0', packages: [] };
  const curr = { version: '3.10.0', packages: [{ name: 'bloc', version: '8.0.0' }] };
  const d = diffFlutter(prev, curr);
  expect(d.added).toContainEqual({ name: 'bloc', version: '8.0.0' });
  expect(d.removed).toHaveLength(0);
});

test('diffFlutter detects removed packages', () => {
  const prev = { version: '3.10.0', packages: [{ name: 'bloc', version: '8.0.0' }] };
  const curr = { version: '3.10.0', packages: [] };
  const d = diffFlutter(prev, curr);
  expect(d.removed).toContainEqual({ name: 'bloc', version: '8.0.0' });
});

test('formatFlutterDiff returns no changes message when empty', () => {
  const out = formatFlutterDiff({ added: [], removed: [], versionChanged: false });
  expect(out).toMatch(/no changes/i);
});

test('formatFlutterDiff lists added and removed', () => {
  const out = formatFlutterDiff({
    added: [{ name: 'bloc', version: '8.0.0' }],
    removed: [{ name: 'provider', version: '6.0.0' }],
    versionChanged: false
  });
  expect(out).toMatch(/\+.*bloc/);
  expect(out).toMatch(/-.*provider/);
});
