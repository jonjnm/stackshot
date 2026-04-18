jest.mock('./snapshot');
jest.mock('./php');

const { createSnapshot, loadSnapshot } = require('./snapshot');
const { isPhpAvailable, capturePhpVersion, captureComposerPackages, diffPhp, formatPhpDiff } = require('./php');
const { handlePhpCommand } = require('./cli-php');

beforeEach(() => jest.clearAllMocks());

describe('handlePhpCommand', () => {
  test('exits early if php not available', async () => {
    isPhpAvailable.mockReturnValue(false);
    const spy = jest.spyOn(console, 'log').mockImplementation();
    await handlePhpCommand(['capture', 'mysnap']);
    expect(spy).toHaveBeenCalledWith(expect.stringContaining('not available'));
    spy.mockRestore();
  });

  test('capture saves php data into snapshot', async () => {
    isPhpAvailable.mockReturnValue(true);
    loadSnapshot.mockResolvedValue({ someOtherKey: true });
    capturePhpVersion.mockReturnValue('8.2.0');
    captureComposerPackages.mockReturnValue({ 'laravel/installer': '4.2.0' });
    createSnapshot.mockResolvedValue();
    const spy = jest.spyOn(console, 'log').mockImplementation();
    await handlePhpCommand(['capture', 'mysnap']);
    expect(createSnapshot).toHaveBeenCalledWith('mysnap', expect.objectContaining({
      phpVersion: '8.2.0',
      composerPackages: { 'laravel/installer': '4.2.0' },
      someOtherKey: true
    }));
    spy.mockRestore();
  });

  test('diff shows no changes message', async () => {
    isPhpAvailable.mockReturnValue(true);
    loadSnapshot.mockResolvedValue({ phpVersion: '8.2.0', composerPackages: {} });
    capturePhpVersion.mockReturnValue('8.2.0');
    captureComposerPackages.mockReturnValue({});
    diffPhp.mockReturnValue({ versionChanged: false, added: {}, removed: {}, changed: {} });
    formatPhpDiff.mockReturnValue('');
    const spy = jest.spyOn(console, 'log').mockImplementation();
    await handlePhpCommand(['diff', 'mysnap']);
    expect(spy).toHaveBeenCalledWith('no php changes detected');
    spy.mockRestore();
  });

  test('diff prints formatted diff when changes exist', async () => {
    isPhpAvailable.mockReturnValue(true);
    loadSnapshot.mockResolvedValue({ phpVersion: '8.1.0', composerPackages: {} });
    capturePhpVersion.mockReturnValue('8.2.0');
    captureComposerPackages.mockReturnValue({});
    diffPhp.mockReturnValue({ versionChanged: true });
    formatPhpDiff.mockReturnValue('  php: 8.1.0 → 8.2.0');
    const spy = jest.spyOn(console, 'log').mockImplementation();
    await handlePhpCommand(['diff', 'mysnap']);
    expect(spy).toHaveBeenCalledWith(expect.stringContaining('8.1.0 → 8.2.0'));
    spy.mockRestore();
  });

  test('show prints snapshot php info', async () => {
    isPhpAvailable.mockReturnValue(true);
    loadSnapshot.mockResolvedValue({ phpVersion: '8.2.0', composerPackages: { 'phpunit/phpunit': '9.5.0' } });
    const spy = jest.spyOn(console, 'log').mockImplementation();
    await handlePhpCommand(['show', 'mysnap']);
    expect(spy).toHaveBeenCalledWith('php version: 8.2.0');
    expect(spy).toHaveBeenCalledWith(expect.stringContaining('phpunit/phpunit'));
    spy.mockRestore();
  });
});
