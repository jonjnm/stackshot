const { handleScalaCommand } = require('./cli-scala');
const scalaModule = require('./scala');
const snapshotModule = require('./snapshot');

jest.mock('./scala');
jest.mock('./snapshot');

describe('handleScalaCommand', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    scalaModule.isScalaAvailable.mockReturnValue(true);
    scalaModule.captureScalaVersion.mockReturnValue('Scala 3.3.0');
    scalaModule.captureScalaPackages.mockReturnValue([{ org: 'org.typelevel', name: 'cats-core', version: '2.9.0' }]);
    snapshotModule.loadSnapshot.mockResolvedValue({});
    snapshotModule.createSnapshot.mockResolvedValue();
  });

  test('warns when scala not available', async () => {
    scalaModule.isScalaAvailable.mockReturnValue(false);
    const spy = jest.spyOn(console, 'log').mockImplementation();
    await handleScalaCommand(['capture', 'mysnap']);
    expect(spy).toHaveBeenCalledWith(expect.stringContaining('not available'));
    spy.mockRestore();
  });

  test('capture saves scala data', async () => {
    const spy = jest.spyOn(console, 'log').mockImplementation();
    await handleScalaCommand(['capture', 'mysnap']);
    expect(snapshotModule.createSnapshot).toHaveBeenCalledWith('mysnap', expect.objectContaining({ scala: expect.any(Object) }));
    spy.mockRestore();
  });

  test('capture requires snapshot name', async () => {
    const spy = jest.spyOn(console, 'error').mockImplementation();
    await expect(handleScalaCommand(['capture'])).rejects.toThrow();
    spy.mockRestore();
  });

  test('diff shows no differences', async () => {
    const mockData = { version: 'Scala 3.3.0', packages: [] };
    snapshotModule.loadSnapshot.mockResolvedValue({ scala: mockData });
    scalaModule.captureScalaPackages.mockReturnValue([]);
    scalaModule.diffScala.mockReturnValue({ added: [], removed: [], versionChanged: [], versionDiff: false });
    scalaModule.formatScalaDiff.mockReturnValue('');
    const spy = jest.spyOn(console, 'log').mockImplementation();
    await handleScalaCommand(['diff', 'mysnap']);
    expect(spy).toHaveBeenCalledWith('no scala differences found');
    spy.mockRestore();
  });

  test('diff errors when no scala data in snapshot', async () => {
    snapshotModule.loadSnapshot.mockResolvedValue({});
    const spy = jest.spyOn(console, 'error').mockImplementation();
    await expect(handleScalaCommand(['diff', 'mysnap'])).rejects.toThrow();
    spy.mockRestore();
  });
});
