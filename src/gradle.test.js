const { execSync } = require('child_process');
const {
  isGradleAvailable,
  captureGradleVersion,
  captureGradlePlugins,
  diffGradle,
  formatGradleDiff
} = require('./gradle');

jest.mock('child_process');

describe('gradle', () => {
  beforeEach(() => jest.clearAllMocks());

  describe('isGradleAvailable', () => {
    it('returns true when gradle is installed', () => {
      execSync.mockReturnValue(Buffer.from('Gradle 8.0'));
      expect(isGradleAvailable()).toBe(true);
    });

    it('returns false when gradle is not installed', () => {
      execSync.mockImplementation(() => { throw new Error(); });
      expect(isGradleAvailable()).toBe(false);
    });
  });

  describe('captureGradleVersion', () => {
    it('parses gradle version from output', () => {
      execSync.mockReturnValue(Buffer.from('\nGradle 8.3\n\nBuild time: 2023-10-04'));
      expect(captureGradleVersion()).toBe('8.3');
    });

    it('returns null on error', () => {
      execSync.mockImplementation(() => { throw new Error(); });
      expect(captureGradleVersion()).toBeNull();
    });
  });

  describe('captureGradlePlugins', () => {
    it('parses plugins from dependency output', () => {
      const output = `classpath\n+--- com.android.tools.build:gradle:8.1.0\n\--- org.jetbrains.kotlin:kotlin-gradle-plugin:1.9.0`;
      execSync.mockReturnValue(Buffer.from(output));
      const plugins = captureGradlePlugins();
      expect(plugins).toHaveLength(2);
      expect(plugins[0]).toEqual({ name: 'com.android.tools.build:gradle', version: '8.1.0' });
    });

    it('returns empty array on error', () => {
      execSync.mockImplementation(() => { throw new Error(); });
      expect(captureGradlePlugins()).toEqual([]);
    });
  });

  describe('diffGradle', () => {
    const base = { version: '8.0', plugins: [{ name: 'com.foo:bar', version: '1.0' }] };

    it('detects added plugins', () => {
      const current = { version: '8.0', plugins: [...base.plugins, { name: 'com.new:plugin', version: '2.0' }] };
      const diff = diffGradle(base, current);
      expect(diff.added).toHaveLength(1);
      expect(diff.added[0].name).toBe('com.new:plugin');
    });

    it('detects removed plugins', () => {
      const current = { version: '8.0', plugins: [] };
      const diff = diffGradle(base, current);
      expect(diff.removed).toHaveLength(1);
    });

    it('detects version changes', () => {
      const current = { version: '8.3', plugins: [{ name: 'com.foo:bar', version: '1.1' }] };
      const diff = diffGradle(base, current);
      expect(diff.versionChanged).toBe(true);
      expect(diff.changed[0]).toEqual({ name: 'com.foo:bar', from: '1.0', to: '1.1' });
    });
  });

  describe('formatGradleDiff', () => {
    it('formats diff output', () => {
      const diff = {
        versionChanged: true,
        added: [{ name: 'com.new:plugin', version: '2.0' }],
        removed: [],
        changed: []
      };
      const output = formatGradleDiff(diff);
      expect(output).toContain('gradle version changed');
      expect(output).toContain('+ com.new:plugin@2.0');
    });
  });
});
