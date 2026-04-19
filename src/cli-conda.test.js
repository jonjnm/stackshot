jest.mock('./conda');
jest.mock('./snapshot');

const conda = require('./conda');
const { loadSnapshot, createSnapshot } = require('./snapshot');
const { handleCondaCommand } = require('./cli-conda');

beforeEach(() => {
  jest.clearAllMocks();
  conda.isCondaAvailable.mockReturnValue(true);
  conda.captureCondaVersion.mockReturnValue('conda 23.5.0');
  conda.captureCondaEnvs.mockReturnValue(['/home/user/miniconda3', '/home/user/miniconda3/envs/myenv']);
  conda.captureCondaPackages.mockReturnValue([{ name: 'numpy', version: '1.24.0' }]);
  createSnapshot.mockResolvedValue();
});

test('capture saves conda data to snapshot', async () => {
  loadSnapshot.mockResolvedValue({});
  await handleCondaCommand(['capture', 'mysnap']);
  expect(createSnapshot).toHaveBeenCalledWith('mysnap', expect.objectContaining({
    conda: expect.objectContaining({ version: 'conda 23.5.0' })
  }));
});

test('diff shows no changes when packages match', async () => {
  loadSnapshot.mockResolvedValue({ conda: { packages: [{ name: 'numpy', version: '1.24.0' }], capturedEnv: 'base' } });
  conda.diffConda.mockReturnValue({ added: [], removed: [], changed: [] });
  conda.formatCondaDiff.mockReturnValue('');
  const spy = jest.spyOn(console, 'log').mockImplementation(() => {});
  await handleCondaCommand(['diff', 'mysnap']);
  expect(spy).toHaveBeenCalledWith('no conda package changes detected');
  spy.mockRestore();
});

test('envs lists environments', async () => {
  const spy = jest.spyOn(console, 'log').mockImplementation(() => {});
  await handleCondaCommand(['envs']);
  expect(conda.captureCondaEnvs).toHaveBeenCalled();
  spy.mockRestore();
});

test('prints message when conda not available', async () => {
  conda.isCondaAvailable.mockReturnValue(false);
  const spy = jest.spyOn(console, 'log').mockImplementation(() => {});
  await handleCondaCommand(['capture', 'mysnap']);
  expect(spy).toHaveBeenCalledWith('conda is not available on this system');
  spy.mockRestore();
});
