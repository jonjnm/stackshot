const { handleGradleCommand } = require('./cli-gradle');
const gradle = require('./gradle');
const snapshot = require('./snapshot');

jest.mock('./gradle');
jest.mock('./snapshot');

describe('handleGradleCommand', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    gradle.isGradleAvailable.mockReturnValue(true);
    gradle.captureGradleVersion.mockReturnValue('8.3');
    gradle.captureGradlePlugins.mockReturnValue([{ name: 'com.foo:bar', version: '1.0' }]);
    snapshot.loadSnapshot.mockResolvedValue({});
    snapshot.createSnapshot.mockResolvedValue();
  });

  it('exits early if gradle not available', async () => {
    gradle.isGradleAvailable.mockReturnValue(false);
    const spy = jest.spyOn(console, 'log').mockImplementation();
    await handleGradleCommand(['capture', 'mysnap']);
    expect(spy).toHaveBeenCalledWith(expect.stringContaining('not available'));
    spy.mockRestore();
  });

  it('capture saves gradle data to snapshot', async () => {
    const spy = jest.spyOn(console, 'log').mockImplementation();
    await handleGradleCommand(['capture', 'mysnap']);
    expect(snapshot.createSnapshot).toHaveBeenCalledWith(
      'mysnap',
      expect.objectContaining({ gradle: { version: '8.3', plugins: [{ name: 'com.foo:bar', version: '1.0' }] } })
    );
    expect(spy).toHaveBeenCalledWith(expect.stringContaining('captured gradle'));
    spy.mockRestore();
  });

  it('diff reports no changes when identical', async () => {
    snapshot.loadSnapshot.mockResolvedValue({
      gradle: { version: '8.3', plugins: [{ name: 'com.foo:bar', version: '1.0' }] }
    });
    gradle.diffGradle.mockReturnValue({ versionChanged: false, added: [], removed: [], changed: [] });
    const spy = jest.spyOn(console, 'log').mockImplementation();
    await handleGradleCommand(['diff', 'mysnap']);
    expect(spy).toHaveBeenCalledWith(expect.stringContaining('no changes'));
    spy.mockRestore();
  });

  it('diff shows formatted output when changes exist', async () => {
    snapshot.loadSnapshot.mockResolvedValue({
      gradle: { version: '8.0', plugins: [] }
    });
    gradle.diffGradle.mockReturnValue({ versionChanged: true, added: [], removed: [], changed: [] });
    gradle.formatGradleDiff.mockReturnValue('  gradle version changed');
    const spy = jest.spyOn(console, 'log').mockImplementation();
    await handleGradleCommand(['diff', 'mysnap']);
    expect(spy).toHaveBeenCalledWith(expect.stringContaining('gradle diff'));
    spy.mockRestore();
  });

  it('show prints current gradle info', async () => {
    const spy = jest.spyOn(console, 'log').mockImplementation();
    await handleGradleCommand(['show']);
    expect(spy).toHaveBeenCalledWith(expect.stringContaining('8.3'));
    spy.mockRestore();
  });

  it('exits on unknown subcommand', async () => {
    const exitSpy = jest.spyOn(process, 'exit').mockImplementation();
    const errSpy = jest.spyOn(console, 'error').mockImplementation();
    await handleGradleCommand(['unknown']);
    expect(exitSpy).toHaveBeenCalledWith(1);
    exitSpy.mockRestore();
    errSpy.mockRestore();
  });
});
