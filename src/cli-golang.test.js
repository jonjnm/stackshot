jest.mock('./snapshot');
jest.mock('./golang');

const { loadSnapshot, createSnapshot } = require('./snapshot');
const { isGoAvailable, captureGoVersion, captureGoPackages, diffGo, formatGoDiff } = require('./golang');
const { handleGoCommand } = require('./cli-golang');

beforeEach(() => jest.clearAllMocks());

test('prints message when go not available', async () => {
  isGoAvailable.mockReturnValue(false);
  const spy = jest.spyOn(console, 'log').mockImplementation(() => {});
  await handleGoCommand(['capture', 'mysnap']);
  expect(spy).toHaveBeenCalledWith(expect.stringContaining('not available'));
  spy.mockRestore();
});

test('capture saves go data to snapshot', async () => {
  isGoAvailable.mockReturnValue(true);
  captureGoVersion.mockReturnValue('1.21.0');
  captureGoPackages.mockReturnValue([{ name: 'github.com/foo/bar', version: 'v1.0.0' }]);
  loadSnapshot.mockResolvedValue({});
  createSnapshot.mockResolvedValue();
  const spy = jest.spyOn(console, 'log').mockImplementation(() => {});
  await handleGoCommand(['capture', 'mysnap']);
  expect(createSnapshot).toHaveBeenCalledWith('mysnap', expect.objectContaining({ go: expect.any(Object) }));
  spy.mockRestore();
});

test('diff shows no differences', async () => {
  isGoAvailable.mockReturnValue(true);
  captureGoVersion.mockReturnValue('1.21.0');
  captureGoPackages.mockReturnValue([]);
  loadSnapshot.mockResolvedValue({ go: { version: '1.21.0', packages: [] } });
  diffGo.mockReturnValue({ versionChanged: false, added: [], removed: [], changed: [] });
  const spy = jest.spyOn(console, 'log').mockImplementation(() => {});
  await handleGoCommand(['diff', 'mysnap']);
  expect(spy).toHaveBeenCalledWith('No differences found');
  spy.mockRestore();
});

test('diff shows formatted diff when changes exist', async () => {
  isGoAvailable.mockReturnValue(true);
  captureGoVersion.mockReturnValue('1.22.0');
  captureGoPackages.mockReturnValue([]);
  loadSnapshot.mockResolvedValue({ go: { version: '1.21.0', packages: [] } });
  diffGo.mockReturnValue({ versionChanged: true, added: [], removed: [], changed: [] });
  formatGoDiff.mockReturnValue('  go version: 1.21.0 → 1.22.0');
  const spy = jest.spyOn(console, 'log').mockImplementation(() => {});
  await handleGoCommand(['diff', 'mysnap']);
  expect(spy).toHaveBeenCalledWith(expect.stringContaining('Go differences'));
  spy.mockRestore();
});
