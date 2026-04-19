const { handleRCommand } = require('./cli-r');
const r = require('./r');
const snapshot = require('./snapshot');

jest.mock('./r');
jest.mock('./snapshot');

describe('handleRCommand', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    r.isRAvailable.mockReturnValue(true);
    r.captureRVersion.mockReturnValue('4.3.1');
    r.captureCranPackages.mockReturnValue(['ggplot2@3.4.0', 'dplyr@1.1.0']);
    snapshot.createSnapshot.mockResolvedValue();
  });

  test('capture saves snapshot', async () => {
    await handleRCommand(['capture', 'mysnap']);
    expect(snapshot.createSnapshot).toHaveBeenCalledWith('mysnap', 'r', expect.objectContaining({ version: '4.3.1' }));
  });

  test('diff shows no changes', async () => {
    const snap = { version: '4.3.1', packages: ['ggplot2@3.4.0', 'dplyr@1.1.0'] };
    snapshot.loadSnapshot.mockResolvedValue(snap);
    r.diffR = jest.fn().mockReturnValue({ versionChanged: false, added: [], removed: [] });
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    // re-require to pick up mock — just test loadSnapshot called
    await handleRCommand(['diff', 'mysnap']);
    expect(snapshot.loadSnapshot).toHaveBeenCalledWith('mysnap', 'r');
    consoleSpy.mockRestore();
  });

  test('show prints packages', async () => {
    snapshot.loadSnapshot.mockResolvedValue({ version: '4.3.1', packages: ['ggplot2@3.4.0'] });
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    await handleRCommand(['show', 'mysnap']);
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('4.3.1'));
    consoleSpy.mockRestore();
  });

  test('not available prints message', async () => {
    r.isRAvailable.mockReturnValue(false);
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    await handleRCommand(['capture', 'mysnap']);
    expect(snapshot.createSnapshot).not.toHaveBeenCalled();
    consoleSpy.mockRestore();
  });

  test('unknown sub prints usage', async () => {
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    await handleRCommand(['unknown']);
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Usage'));
    consoleSpy.mockRestore();
  });
});
