jest.mock('./apache');
jest.mock('./snapshot');

const apache = require('./apache');
const { loadSnapshot, createSnapshot } = require('./snapshot');
const { handleApacheCommand } = require('./cli-apache');

beforeEach(() => {
  jest.clearAllMocks();
  apache.isApacheAvailable.mockReturnValue(true);
  apache.captureApacheVersion.mockReturnValue('2.4.57');
  apache.captureApacheModules.mockReturnValue(['core_module', 'ssl_module']);
  apache.captureApacheConfig.mockReturnValue(null);
  apache.diffApache.mockReturnValue({});
  apache.formatApacheDiff.mockReturnValue('');
  loadSnapshot.mockResolvedValue(null);
  createSnapshot.mockResolvedValue();
});

describe('handleApacheCommand', () => {
  test('prints unavailable message when apache not found', async () => {
    apache.isApacheAvailable.mockReturnValue(false);
    const spy = jest.spyOn(console, 'log').mockImplementation();
    await handleApacheCommand(['show']);
    expect(spy).toHaveBeenCalledWith(expect.stringContaining('not available'));
    spy.mockRestore();
  });

  test('capture subcommand saves apache data to snapshot', async () => {
    loadSnapshot.mockResolvedValue({ env: {} });
    const spy = jest.spyOn(console, 'log').mockImplementation();
    await handleApacheCommand(['capture', 'mysnap']);
    expect(createSnapshot).toHaveBeenCalledWith(
      'mysnap',
      expect.objectContaining({ apache: expect.any(Object) })
    );
    spy.mockRestore();
  });

  test('diff subcommand reports no differences', async () => {
    loadSnapshot
      .mockResolvedValueOnce({ apache: { version: '2.4.57', modules: [] } })
      .mockResolvedValueOnce({ apache: { version: '2.4.57', modules: [] } });
    const spy = jest.spyOn(console, 'log').mockImplementation();
    await handleApacheCommand(['diff', 'snap1', 'snap2']);
    expect(spy).toHaveBeenCalledWith(expect.stringContaining('no apache differences'));
    spy.mockRestore();
  });

  test('show subcommand prints version and modules', async () => {
    const spy = jest.spyOn(console, 'log').mockImplementation();
    await handleApacheCommand(['show']);
    expect(spy).toHaveBeenCalledWith(expect.stringContaining('2.4.57'));
    spy.mockRestore();
  });

  test('exits on unknown subcommand', async () => {
    const exitSpy = jest.spyOn(process, 'exit').mockImplementation(() => { throw new Error('exit'); });
    const errSpy = jest.spyOn(console, 'error').mockImplementation();
    await expect(handleApacheCommand(['bogus'])).rejects.toThrow('exit');
    exitSpy.mockRestore();
    errSpy.mockRestore();
  });
});
