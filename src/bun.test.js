const { isBunAvailable, captureBunVersion, captureBunPackages, diffBun, formatBunDiff } = require('./bun');

jest.mock('child_process', () => ({
  execSync: jest.fn(),
}));

const { execSync } = require('child_process');

beforeEach(() => jest.clearAllMocks());

test('isBunAvailable returns true when bun is found', () => {
  execSync.mockReturnValue(Buffer.from('1.1.0'));
  expect(isBunAvailable()).toBe(true);
});

test('isBunAvailable returns false when bun is not found', () => {
  execSync.mockImplementation(() => { throw new Error('not found'); });
  expect(isBunAvailable()).toBe(false);
});

test('captureBunVersion returns version string', () => {
  execSync.mockReturnValue(Buffer.from('1.1.3\n'));
  expect(captureBunVersion()).toEqual({ version: '1.1.3' });
});

test('captureBunVersion returns null version on error', () => {
  execSync.mockImplementation(() => { throw new Error(); });
  expect(captureBunVersion()).toEqual({ version: null });
});

test('captureBunPackages parses package list', () => {
  execSync.mockReturnValue(Buffer.from('  hono@4.0.0\n  zod@3.22.4\n'));
  const pkgs = captureBunPackages();
  expect(pkgs).toEqual({ hono: '4.0.0', zod: '3.22.4' });
});

test('captureBunPackages returns empty object on error', () => {
  execSync.mockImplementation(() => { throw new Error(); });
  expect(captureBunPackages()).toEqual({});
});

test('diffBun detects added packages', () => {
  const snap = { version: { version: '1.1.0' }, packages: {} };
  const curr = { version: { version: '1.1.0' }, packages: { hono: '4.0.0' } };
  const diff = diffBun(snap, curr);
  expect(diff.added).toEqual({ hono: '4.0.0' });
  expect(diff.removed).toEqual({});
});

test('diffBun detects removed packages', () => {
  const snap = { version: { version: '1.1.0' }, packages: { zod: '3.22.4' } };
  const curr = { version: { version: '1.1.0' }, packages: {} };
  const diff = diffBun(snap, curr);
  expect(diff.removed).toEqual({ zod: '3.22.4' });
});

test('diffBun detects version change', () => {
  const snap = { version: { version: '1.0.0' }, packages: {} };
  const curr = { version: { version: '1.1.3' }, packages: {} };
  const diff = diffBun(snap, curr);
  expect(diff.versionChanged).toEqual({ from: '1.0.0', to: '1.1.3' });
});

test('formatBunDiff formats output correctly', () => {
  const diff = {
    versionChanged: { from: '1.0.0', to: '1.1.3' },
    added: { hono: '4.0.0' },
    removed: { zod: '3.22.4' },
    changed: { elysia: { from: '0.7.0', to: '0.8.0' } },
  };
  const output = formatBunDiff(diff);
  expect(output).toContain('bun version: 1.0.0 → 1.1.3');
  expect(output).toContain('+ hono@4.0.0');
  expect(output).toContain('- zod@3.22.4');
  expect(output).toContain('~ elysia: 0.7.0 → 0.8.0');
});
