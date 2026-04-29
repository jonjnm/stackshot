const { isPnpmAvailable, capturePnpmVersion, capturePnpmGlobals, diffPnpm, formatPnpmDiff } = require('./pnpm');
const { execSync } = require('child_process');

jest.mock('child_process');

describe('pnpm', () => {
  beforeEach(() => jest.clearAllMocks());

  describe('isPnpmAvailable', () => {
    it('returns true when pnpm is installed', () => {
      execSync.mockReturnValue(Buffer.from('8.6.0'));
      expect(isPnpmAvailable()).toBe(true);
    });

    it('returns false when pnpm is not installed', () => {
      execSync.mockImplementation(() => { throw new Error(); });
      expect(isPnpmAvailable()).toBe(false);
    });
  });

  describe('capturePnpmVersion', () => {
    it('returns version string', () => {
      execSync.mockReturnValue(Buffer.from('8.6.0\n'));
      expect(capturePnpmVersion()).toBe('8.6.0');
    });

    it('returns null on error', () => {
      execSync.mockImplementation(() => { throw new Error(); });
      expect(capturePnpmVersion()).toBeNull();
    });
  });

  describe('capturePnpmGlobals', () => {
    it('returns list of global packages', () => {
      const mockOutput = JSON.stringify([{ dependencies: { typescript: { version: '5.0.0' }, eslint: { version: '8.0.0' } } }]);
      execSync.mockReturnValue(Buffer.from(mockOutput));
      const result = capturePnpmGlobals();
      expect(result).toEqual([
        { name: 'typescript', version: '5.0.0' },
        { name: 'eslint', version: '8.0.0' }
      ]);
    });

    it('returns empty array on error', () => {
      execSync.mockImplementation(() => { throw new Error(); });
      expect(capturePnpmGlobals()).toEqual([]);
    });
  });

  describe('diffPnpm', () => {
    it('detects added, removed, and changed packages', () => {
      const snapshot = { globals: [{ name: 'eslint', version: '7.0.0' }, { name: 'prettier', version: '2.0.0' }] };
      const current = { globals: [{ name: 'eslint', version: '8.0.0' }, { name: 'typescript', version: '5.0.0' }] };
      const diff = diffPnpm(snapshot, current);
      expect(diff.added).toEqual([{ name: 'typescript', version: '5.0.0' }]);
      expect(diff.removed).toEqual([{ name: 'prettier', version: '2.0.0' }]);
      expect(diff.changed).toEqual([{ name: 'eslint', version: '8.0.0' }]);
    });
  });

  describe('formatPnpmDiff', () => {
    it('formats diff output correctly', () => {
      const diff = {
        added: [{ name: 'typescript', version: '5.0.0' }],
        removed: [{ name: 'prettier' }],
        changed: [{ name: 'eslint', version: '8.0.0' }]
      };
      const output = formatPnpmDiff(diff);
      expect(output).toContain('+ typescript@5.0.0');
      expect(output).toContain('- prettier');
      expect(output).toContain('~ eslint@8.0.0');
    });
  });
});
