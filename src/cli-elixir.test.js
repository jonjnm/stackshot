jest.mock('./elixir');
jest.mock('./snapshot');

const { isElixirAvailable, captureElixirVersion, captureHexPackages, diffElixir, formatElixirDiff } = require('./elixir');
const { loadSnapshot, createSnapshot } = require('./snapshot');
const { handleElixirCommand } = require('./cli-elixir');

beforeEach(() => jest.clearAllMocks());

describe('handleElixirCommand', () => {
  test('prints message when elixir not available', async () => {
    isElixirAvailable.mockReturnValue(false);
    const spy = jest.spyOn(console, 'log').mockImplementation(() => {});
    await handleElixirCommand(['show']);
    expect(spy).toHaveBeenCalledWith(expect.stringContaining('not available'));
    spy.mockRestore();
  });

  test('capture saves elixir data to snapshot', async () => {
    isElixirAvailable.mockReturnValue(true);
    captureElixirVersion.mockReturnValue('1.15.0');
    captureHexPackages.mockReturnValue(['phoenix', 'ecto']);
    loadSnapshot.mockResolvedValue({});
    createSnapshot.mockResolvedValue();
    const spy = jest.spyOn(console, 'log').mockImplementation(() => {});
    await handleElixirCommand(['capture', 'mysnap']);
    expect(createSnapshot).toHaveBeenCalledWith('mysnap', expect.objectContaining({
      elixir: { version: '1.15.0', packages: ['phoenix', 'ecto'] }
    }));
    spy.mockRestore();
  });

  test('diff shows no changes message', async () => {
    isElixirAvailable.mockReturnValue(true);
    captureElixirVersion.mockReturnValue('1.15.0');
    captureHexPackages.mockReturnValue(['phoenix']);
    loadSnapshot.mockResolvedValue({ elixir: { version: '1.15.0', packages: ['phoenix'] } });
    diffElixir.mockReturnValue({ versionChanged: false, added: [], removed: [] });
    formatElixirDiff.mockReturnValue('');
    const spy = jest.spyOn(console, 'log').mockImplementation(() => {});
    await handleElixirCommand(['diff', 'mysnap']);
    expect(spy).toHaveBeenCalledWith('no elixir changes detected');
    spy.mockRestore();
  });

  test('show prints version and packages', async () => {
    isElixirAvailable.mockReturnValue(true);
    captureElixirVersion.mockReturnValue('1.15.0');
    captureHexPackages.mockReturnValue(['phoenix', 'plug']);
    const spy = jest.spyOn(console, 'log').mockImplementation(() => {});
    await handleElixirCommand(['show']);
    expect(spy).toHaveBeenCalledWith(expect.stringContaining('1.15.0'));
    spy.mockRestore();
  });
});
