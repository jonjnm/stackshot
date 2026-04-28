/**
 * Integration-style tests for maven CLI wiring.
 * Verifies that capture → diff round-trip works correctly
 * using in-memory mocks for snapshot storage and maven capture.
 */
const { handleMavenCommand } = require('./cli-maven');
const maven = require('./maven');
const snapshotModule = require('./snapshot');

jest.mock('./maven');
jest.mock('./snapshot');

describe('maven CLI integration', () => {
  let store;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});

    store = {};
    maven.isMavenAvailable.mockReturnValue(true);

    snapshotModule.loadSnapshot.mockImplementation(async name => store[name] || null);
    snapshotModule.createSnapshot.mockImplementation(async (name, data) => { store[name] = data; });
  });

  afterEach(() => jest.restoreAllMocks());

  it('capture then diff detects version upgrade', async () => {
    maven.captureMavenVersion.mockReturnValue('3.8.0');
    maven.captureMavenPlugins.mockReturnValue([]);
    await handleMavenCommand(['capture'], { name: 'snap1' });

    maven.captureMavenVersion.mockReturnValue('3.9.0');
    maven.diffMaven.mockImplementation((snap, cur) => {
      const actual = require.requireActual ? require.requireActual('./maven').diffMaven : null;
      return { version: { from: snap.version, to: cur.version } };
    });
    maven.formatMavenDiff.mockReturnValue('  version: 3.8.0 → 3.9.0');

    await handleMavenCommand(['diff'], { name: 'snap1' });
    expect(console.log).toHaveBeenCalledWith('maven diff:');
  });

  it('capture merges maven into existing snapshot data', async () => {
    store['snap2'] = { env: { FOO: 'bar' } };
    maven.captureMavenVersion.mockReturnValue('3.9.0');
    maven.captureMavenPlugins.mockReturnValue(['maven-compiler-plugin']);

    await handleMavenCommand(['capture'], { name: 'snap2' });

    expect(store['snap2']).toMatchObject({
      env: { FOO: 'bar' },
      maven: { version: '3.9.0', plugins: ['maven-compiler-plugin'] }
    });
  });

  it('diff reports missing snapshot gracefully', async () => {
    await handleMavenCommand(['diff'], { name: 'nonexistent' });
    expect(console.log).toHaveBeenCalledWith(expect.stringContaining('no maven data found'));
  });
});
