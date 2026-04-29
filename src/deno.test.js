const { isDenoAvailable, captureDenoVersion, captureDenoPackages, diffDeno, formatDenoDiff } = require('./deno');
const { execSync } = require('child_process');

jest.mock('child_process');

describe('deno', () => {
  beforeEach(() => jest.clearAllMocks());

  describe('isDenoAvailable', () => {
    it('returns true when deno is installed', () => {
      execSync.mockReturnValue(Buffer.from('deno 1.40.0\nv8 12.0.267.1\ntypescript 5.3.3'));
      expect(isDenoAvailable()).toBe(true);
    });

    it('returns false when deno is not installed', () => {
      execSync.mockImplementation(() => { throw new Error('not found'); });
      expect(isDenoAvailable()).toBe(false);
    });
  });

  describe('captureDenoVersion', () => {
    it('parses version from deno --version output', () => {
      execSync.mockReturnValue(Buffer.from('deno 1.40.0\nv8 12.0.267.1'));
      expect(captureDenoVersion()).toBe('1.40.0');
    });

    it('returns null on error', () => {
      execSync.mockImplementation(() => { throw new Error(); });
      expect(captureDenoVersion()).toBeNull();
    });
  });

  describe('captureDenoPackages', () => {
    it('returns modules array from deno info', () => {
      execSync.mockReturnValue(Buffer.from(JSON.stringify({ modules: ['https://deno.land/std@0.200.0/fs/mod.ts'] })));
      const pkgs = captureDenoPackages();
      expect(pkgs).toEqual(['https://deno.land/std@0.200.0/fs/mod.ts']);
    });

    it('returns empty array on error', () => {
      execSync.mockImplementation(() => { throw new Error(); });
      expect(captureDenoPackages()).toEqual([]);
    });
  });

  describe('diffDeno', () => {
    it('returns null when snapshots are identical', () => {
      const snap = { version: '1.40.0', packages: ['https://deno.land/std@0.200.0/fs/mod.ts'] };
      expect(diffDeno(snap, { ...snap })).toBeNull();
    });

    it('detects version change', () => {
      const diff = diffDeno({ version: '1.39.0', packages: [] }, { version: '1.40.0', packages: [] });
      expect(diff.version).toEqual({ from: '1.39.0', to: '1.40.0' });
    });

    it('detects added and removed packages', () => {
      const snap = { version: '1.40.0', packages: ['pkg-a'] };
      const curr = { version: '1.40.0', packages: ['pkg-b'] };
      const diff = diffDeno(snap, curr);
      expect(diff.packagesAdded).toContain('pkg-b');
      expect(diff.packagesRemoved).toContain('pkg-a');
    });
  });

  describe('formatDenoDiff', () => {
    it('formats version and package changes', () => {
      const diff = { version: { from: '1.39.0', to: '1.40.0' }, packagesAdded: ['pkg-b'], packagesRemoved: ['pkg-a'] };
      const output = formatDenoDiff(diff);
      expect(output).toContain('1.39.0 → 1.40.0');
      expect(output).toContain('+ pkg-b');
      expect(output).toContain('- pkg-a');
    });
  });
});
