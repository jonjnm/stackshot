const { captureNpmGlobals, captureToolVersions, diffTools } = require('./tools');

describe('captureToolVersions', () => {
  it('returns an object with known tool keys', () => {
    const versions = captureToolVersions();
    expect(versions).toHaveProperty('node');
    expect(versions).toHaveProperty('npm');
    expect(versions).toHaveProperty('git');
  });

  it('node version is a non-empty string', () => {
    const versions = captureToolVersions();
    expect(typeof versions.node).toBe('string');
    expect(versions.node.length).toBeGreaterThan(0);
  });

  it('returns null for tools that are not installed', () => {
    const versions = captureToolVersions();
    // docker may or may not be installed; value should be string or null
    expect([null, expect.any(String)]).toContainEqual(versions.docker);
  });
});

describe('diffTools', () => {
  it('returns empty object when snapshots are identical', () => {
    const snap = { node: 'v20.0.0', npm: '10.0.0' };
    expect(diffTools(snap, snap)).toEqual({});
  });

  it('detects changed version', () => {
    const base = { node: 'v18.0.0', npm: '9.0.0' };
    const current = { node: 'v20.0.0', npm: '9.0.0' };
    expect(diffTools(base, current)).toEqual({
      node: { from: 'v18.0.0', to: 'v20.0.0' }
    });
  });

  it('detects newly added tool', () => {
    const base = { node: 'v20.0.0' };
    const current = { node: 'v20.0.0', docker: 'Docker version 24.0.0' };
    expect(diffTools(base, current)).toEqual({
      docker: { from: null, to: 'Docker version 24.0.0' }
    });
  });

  it('detects removed tool', () => {
    const base = { node: 'v20.0.0', yarn: '1.22.0' };
    const current = { node: 'v20.0.0', yarn: null };
    expect(diffTools(base, current)).toEqual({
      yarn: { from: '1.22.0', to: null }
    });
  });
});

describe('captureNpmGlobals', () => {
  it('returns an array', () => {
    const globals = captureNpmGlobals();
    expect(Array.isArray(globals)).toBe(true);
  });

  it('each entry has name and version', () => {
    const globals = captureNpmGlobals();
    for (const pkg of globals) {
      expect(pkg).toHaveProperty('name');
      expect(pkg).toHaveProperty('version');
    }
  });
});
