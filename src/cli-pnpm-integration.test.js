const { handlePnpmCommand } = require('./cli-pnpm');
const pnpm = require('./pnpm');
const snapshot = require('./snapshot');

jest.mock('./pnpm');
jest.mock('./snapshot');

describe('pnpm CLI integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    pnpm.isPnpmAvailable.mockReturnValue(true);
  });

  it('capture merges pnpm data with existing snapshot', async () => {
    pnpm.capturePnpmVersion.mockReturnValue('8.6.0');
    pnpm.capturePnpmGlobals.mockReturnValue([{ name: 'nx', version: '16.0.0' }]);
    snapshot.loadSnapshot.mockResolvedValue({ env: { NODE_ENV: 'development' } });
    snapshot.createSnapshot.mockResolvedValue();
    jest.spyOn(console, 'log').mockImplementation();

    await handlePnpmCommand(['capture', 'dev-setup']);

    expect(snapshot.createSnapshot).toHaveBeenCalledWith('dev-setup', {
      env: { NODE_ENV: 'development' },
      pnpm: { version: '8.6.0', globals: [{ name: 'nx', version: '16.0.0' }] }
    });
  });

  it('diff reports missing snapshot gracefully', async () => {
    snapshot.loadSnapshot.mockResolvedValue(null);
    const errSpy = jest.spyOn(console, 'error').mockImplementation();
    const exitSpy = jest.spyOn(process, 'exit').mockImplementation(() => { throw new Error('exit'); });

    await expect(handlePnpmCommand(['diff', 'nonexistent'])).rejects.toThrow('exit');
    expect(errSpy).toHaveBeenCalledWith(expect.stringContaining('not found'));
    exitSpy.mockRestore();
    errSpy.mockRestore();
  });

  it('diff handles snapshot with no pnpm section', async () => {
    snapshot.loadSnapshot.mockResolvedValue({ env: {} });
    const spy = jest.spyOn(console, 'log').mockImplementation();

    await handlePnpmCommand(['diff', 'mysnap']);
    expect(spy).toHaveBeenCalledWith(expect.stringContaining('No pnpm data'));
    spy.mockRestore();
  });

  it('show handles snapshot with no pnpm section', async () => {
    snapshot.loadSnapshot.mockResolvedValue({ brew: {} });
    const spy = jest.spyOn(console, 'log').mockImplementation();

    await handlePnpmCommand(['show', 'mysnap']);
    expect(spy).toHaveBeenCalledWith(expect.stringContaining('No pnpm data'));
    spy.mockRestore();
  });

  it('capture exits without snapshot name', async () => {
    const errSpy = jest.spyOn(console, 'error').mockImplementation();
    const exitSpy = jest.spyOn(process, 'exit').mockImplementation(() => { throw new Error('exit'); });

    await expect(handlePnpmCommand(['capture'])).rejects.toThrow('exit');
    expect(exitSpy).toHaveBeenCalledWith(1);
    exitSpy.mockRestore();
    errSpy.mockRestore();
  });
});
