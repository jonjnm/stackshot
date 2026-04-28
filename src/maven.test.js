const { isMavenAvailable, captureMavenVersion, captureMavenPlugins, diffMaven, formatMavenDiff } = require('./maven');

describe('maven', () => {
  describe('isMavenAvailable', () => {
    it('returns a boolean', () => {
      expect(typeof isMavenAvailable()).toBe('boolean');
    });
  });

  describe('captureMavenVersion', () => {
    it('returns a string or null', () => {
      const result = captureMavenVersion();
      expect(result === null || typeof result === 'string').toBe(true);
    });
  });

  describe('captureMavenPlugins', () => {
    it('returns an array', () => {
      expect(Array.isArray(captureMavenPlugins())).toBe(true);
    });
  });

  describe('diffMaven', () => {
    it('returns empty diff when snapshots match', () => {
      const snap = { version: '3.9.0', plugins: ['maven-compiler-plugin'] };
      expect(diffMaven(snap, { ...snap })).toEqual({});
    });

    it('detects version change', () => {
      const diff = diffMaven(
        { version: '3.8.0', plugins: [] },
        { version: '3.9.0', plugins: [] }
      );
      expect(diff.version).toEqual({ from: '3.8.0', to: '3.9.0' });
    });

    it('detects added plugins', () => {
      const diff = diffMaven(
        { version: '3.9.0', plugins: [] },
        { version: '3.9.0', plugins: ['maven-surefire-plugin'] }
      );
      expect(diff.plugins.added).toContain('maven-surefire-plugin');
    });

    it('detects removed plugins', () => {
      const diff = diffMaven(
        { version: '3.9.0', plugins: ['maven-surefire-plugin'] },
        { version: '3.9.0', plugins: [] }
      );
      expect(diff.plugins.removed).toContain('maven-surefire-plugin');
    });
  });

  describe('formatMavenDiff', () => {
    it('formats version diff', () => {
      const out = formatMavenDiff({ version: { from: '3.8.0', to: '3.9.0' } });
      expect(out).toContain('3.8.0');
      expect(out).toContain('3.9.0');
    });

    it('formats plugin additions and removals', () => {
      const out = formatMavenDiff({ plugins: { added: ['plugin-a'], removed: ['plugin-b'] } });
      expect(out).toContain('+ plugin: plugin-a');
      expect(out).toContain('- plugin: plugin-b');
    });
  });
});
