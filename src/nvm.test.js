const { isNvmAvailable, captureNvmVersion, captureNvmInstalledVersions, captureNvmDefault, diffNvm, formatNvmDiff } = require('./nvm');
const { execSync } = require('child_process');

jest.mock('child_process');

describe('nvm', () => {
  beforeEach(() => jest.clearAllMocks());

  describe('isNvmAvailable', () => {
    it('returns true when nvm is available', () => {
      execSync.mockReturnValue(Buffer.from('0.39.5'));
      expect(isNvmAvailable()).toBe(true);
    });

    it('returns false when nvm is not available', () => {
      execSync.mockImplementation(() => { throw new Error('not found'); });
      expect(isNvmAvailable()).toBe(false);
    });
  });

  describe('captureNvmVersion', () => {
    it('returns version string', () => {
      execSync.mockReturnValue(Buffer.from('0.39.5\n'));
      expect(captureNvmVersion()).toBe('0.39.5');
    });

    it('returns null on error', () => {
      execSync.mockImplementation(() => { throw new Error(); });
      expect(captureNvmVersion()).toBeNull();
    });
  });

  describe('captureNvmInstalledVersions', () => {
    it('parses installed versions', () => {
      execSync.mockReturnValue(Buffer.from('->     v18.17.0\n       v20.5.0\n         system\n'));
      const result = captureNvmInstalledVersions();
      expect(result).toContain('v18.17.0');
      expect(result).toContain('v20.5.0');
      expect(result).not.toContain('system');
    });

    it('returns empty array on error', () => {
      execSync.mockImplementation(() => { throw new Error(); });
      expect(captureNvmInstalledVersions()).toEqual([]);
    });
  });

  describe('captureNvmDefault', () => {
    it('parses default alias', () => {
      execSync.mockReturnValue(Buffer.from('default -> v18.17.0 (-> v18.17.0)\n'));
      expect(captureNvmDefault()).toBe('v18.17.0');
    });

    it('returns null on error', () => {
      execSync.mockImplementation(() => { throw new Error(); });
      expect(captureNvmDefault()).toBeNull();
    });
  });

  describe('diffNvm', () => {
    it('detects added and removed versions', () => {
      const snap = { installed: ['v16.0.0', 'v18.17.0'], default: 'v18.17.0' };
      const curr = { installed: ['v18.17.0', 'v20.5.0'], default: 'v18.17.0' };
      const diff = diffNvm(snap, curr);
      expect(diff.added).toEqual(['v20.5.0']);
      expect(diff.removed).toEqual(['v16.0.0']);
      expect(diff.defaultChanged).toBe(false);
    });

    it('detects default version change', () => {
      const snap = { installed: ['v18.17.0'], default: 'v18.17.0' };
      const curr = { installed: ['v18.17.0'], default: 'v20.5.0' };
      const diff = diffNvm(snap, curr);
      expect(diff.defaultChanged).toBe(true);
    });
  });

  describe('formatNvmDiff', () => {
    it('formats diff output', () => {
      const diff = { added: ['v20.5.0'], removed: ['v16.0.0'], defaultChanged: true, snapshotDefault: 'v18.17.0', currentDefault: 'v20.5.0' };
      const out = formatNvmDiff(diff);
      expect(out).toContain('Added');
      expect(out).toContain('Removed');
      expect(out).toContain('Default');
    });

    it('returns empty string when no changes', () => {
      const diff = { added: [], removed: [], defaultChanged: false };
      expect(formatNvmDiff(diff)).toBe('');
    });
  });
});
