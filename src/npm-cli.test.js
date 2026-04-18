const { handleNpmCommand } = require('./npm-cli');
const snapshot = require('./snapshot');
const npm = require('./npm');

jest.mock('./snapshot');
jest.mock('./npm');

describe('handleNpmCommand', () => {
  let consoleSpy, errorSpy, exitSpy;

  beforeEach(() => {
    consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    exitSpy = jest.spyOn(process, 'exit').mockImplementation(() => { throw new Error('exit'); });
    npm.isNpmAvailable.mockReturnValue(true);
  });

  afterEach(() => jest.restoreAllMocks());

  test('capture saves npm config into snapshot', async () => {
    snapshot.loadSnapshot.mockResolvedValue({ env: { FOO: 'bar' } });
    snapshot.createSnapshot.mockResolvedValue();
    npm.captureNpmConfig.mockResolvedValue({ registry: 'https://registry.npmjs.org/' });

    await handleNpmCommand(['capture', 'mysnap']);

    expect(snapshot.createSnapshot).toHaveBeenCalledWith('mysnap', {
      env: { FOO: 'bar' },
      npm: { registry: 'https://registry.npmjs.org/' }
    });
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('mysnap'));
  });

  test('diff prints no differences when configs match', async () => {
    const config = { registry: 'https://registry.npmjs.org/' };
    snapshot.loadSnapshot.mockResolvedValue({ npm: config });
    npm.captureNpmConfig.mockResolvedValue(config);
    npm.diffNpmConfig.mockReturnValue({});
    npm.formatNpmDiff.mockReturnValue('');

    await handleNpmCommand(['diff', 'mysnap']);

    expect(consoleSpy).toHaveBeenCalledWith('No differences found.');
  });

  test('diff prints diff output when differences exist', async () => {
    snapshot.loadSnapshot.mockResolvedValue({ npm: { registry: 'http://old/' } });
    npm.captureNpmConfig.mockResolvedValue({ registry: 'http://new/' });
    npm.diffNpmConfig.mockReturnValue({ registry: { old: 'http://old/', new: 'http://new/' } });
    npm.formatNpmDiff.mockReturnValue('~ registry: http://old/ -> http://new/');

    await handleNpmCommand(['diff', 'mysnap']);

    expect(consoleSpy).toHaveBeenCalledWith('~ registry: http://old/ -> http://new/');
  });

  test('show prints snapshot npm config as JSON', async () => {
    const config = { registry: 'https://registry.npmjs.org/' };
    snapshot.loadSnapshot.mockResolvedValue({ npm: config });

    await handleNpmCommand(['show', 'mysnap']);

    expect(consoleSpy).toHaveBeenCalledWith(JSON.stringify(config, null, 2));
  });

  test('exits when npm is not available', async () => {
    npm.isNpmAvailable.mockReturnValue(false);
    await expect(handleNpmCommand(['capture', 'x'])).rejects.toThrow('exit');
    expect(errorSpy).toHaveBeenCalledWith(expect.stringContaining('not available'));
  });

  test('exits on unknown subcommand', async () => {
    await expect(handleNpmCommand(['unknown'])).rejects.toThrow('exit');
    expect(errorSpy).toHaveBeenCalledWith(expect.stringContaining('Unknown npm subcommand'));
  });
});
