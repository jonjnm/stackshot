const { handlePnpmCommand } = require('./cli-pnpm');
const pnpm = require('./pnpm');
const snapshot = require('./snapshot');

jest.mock('./pnpm');
jest.mock('./snapshot');

describe('handlePnpmCommand', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    pnpm.isPnpmAvailable.mockReturnValue(true);
    pnpm.capturePnpmVersion.mockReturnValue('8.6.0');
    pnpm.capturePnpmGlobals.mockReturnValue([{ name: 'typescript', version: '5.0.0' }]);
    snapshot.loadSnapshot.mockResolvedValue(null);
    snapshot.createSnapshot.mockResolvedValue();
  });

  it('logs message when pnpm is not available', async () => {
    pnpm.isPnpmAvailable.mockReturnValue(false);
    const spy = jest.spyOn(console, 'log').mockImplementation();
    await handlePnpmCommand(['capture', 'mysnap']);
    expect(spy).toHaveBeenCalledWith(expect.stringContaining('not available'));
    spy.mockRestore();
  });

  it('capture creates snapshot with pnpm data', async () => {
    const spy = jest.spyOn(console, 'log').mockImplementation();
    await handlePnpmCommand(['capture', 'mysnap']);
    expect(snapshot.createSnapshot).toHaveBeenCalledWith('mysnap', {
      pnpm: { version: '8.6.0', globals: [{ name: 'typescript', version: '5.0.0' }] }
    });
    expect(spy).toHaveBeenCalledWith(expect.stringContaining('captured'));
    spy.mockRestore();
  });

  it('diff shows no changes when globals match', async () => {
    const globals = [{ name: 'typescript', version: '5.0.0' }];
    snapshot.loadSnapshot.mockResolvedValue({ pnpm: { version: '8.6.0', globals } });
    pnpm.diffPnpm.mockReturnValue({ added: [], removed: [], changed: [] });
    const spy = jest.spyOn(console, 'log').mockImplementation();
    await handlePnpmCommand(['diff', 'mysnap']);
    expect(spy).toHaveBeenCalledWith(expect.stringContaining('match'));
    spy.mockRestore();
  });

  it('diff shows formatted diff when changes exist', async () => {
    snapshot.loadSnapshot.mockResolvedValue({ pnpm: { globals: [] } });
    pnpm.diffPnpm.mockReturnValue({ added: [{ name: 'ts', version: '5.0.0' }], removed: [], changed: [] });
    pnpm.formatPnpmDiff.mockReturnValue('  Added:\n    + ts@5.0.0');
    const spy = jest.spyOn(console, 'log').mockImplementation();
    await handlePnpmCommand(['diff', 'mysnap']);
    expect(spy).toHaveBeenCalledWith(expect.stringContaining('diff'));
    spy.mockRestore();
  });

  it('show prints pnpm data from snapshot', async () => {
    snapshot.loadSnapshot.mockResolvedValue({
      pnpm: { version: '8.6.0', globals: [{ name: 'typescript', version: '5.0.0' }] }
    });
    const spy = jest.spyOn(console, 'log').mockImplementation();
    await handlePnpmCommand(['show', 'mysnap']);
    expect(spy).toHaveBeenCalledWith(expect.stringContaining('8.6.0'));
    expect(spy).toHaveBeenCalledWith(expect.stringContaining('typescript@5.0.0'));
    spy.mockRestore();
  });

  it('exits on unknown subcommand', async () => {
    const mockExit = jest.spyOn(process, 'exit').mockImplementation(() => { throw new Error('exit'); });
    jest.spyOn(console, 'error').mockImplementation();
    await expect(handlePnpmCommand(['unknown', 'mysnap'])).rejects.toThrow('exit');
    expect(mockExit).toHaveBeenCalledWith(1);
    mockExit.mockRestore();
  });
});
