const { isRAvailable, captureRVersion, captureCranPackages, diffR, formatRDiff } = require('./r');

describe('r module', () => {
  test('isRAvailable returns boolean', () => {
    expect(typeof isRAvailable()).toBe('boolean');
  });

  test('captureRVersion returns string or null', () => {
    const v = captureRVersion();
    expect(v === null || typeof v === 'string').toBe(true);
  });

  test('captureCranPackages returns array', () => {
    const pkgs = captureCranPackages();
    expect(Array.isArray(pkgs)).toBe(true);
  });

  test('diffR detects added and removed packages', () => {
    const snap = { version: '4.2.0', packages: ['ggplot2@3.4.0', 'dplyr@1.1.0'] };
    const curr = { version: '4.3.1', packages: ['ggplot2@3.4.0', 'tidyr@1.3.0'] };
    const diff = diffR(snap, curr);
    expect(diff.versionChanged).toBe(true);
    expect(diff.added).toContain('tidyr@1.3.0');
    expect(diff.removed).toContain('dplyr@1.1.0');
  });

  test('diffR no changes', () => {
    const snap = { version: '4.3.1', packages: ['ggplot2@3.4.0'] };
    const curr = { version: '4.3.1', packages: ['ggplot2@3.4.0'] };
    const diff = diffR(snap, curr);
    expect(diff.versionChanged).toBe(false);
    expect(diff.added).toHaveLength(0);
    expect(diff.removed).toHaveLength(0);
  });

  test('formatRDiff returns string', () => {
    const diff = { versionChanged: true, oldVersion: '4.2.0', newVersion: '4.3.1', added: ['tidyr@1.3.0'], removed: [] };
    const out = formatRDiff(diff);
    expect(out).toContain('4.2.0');
    expect(out).toContain('tidyr@1.3.0');
  });
});
