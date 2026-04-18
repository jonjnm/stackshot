const { handleSwiftCommand } = require('./cli-swift');
const swift = require('./swift');
const snapshot = require('./snapshot');

jest.mock('./swift');
jest.mock('./snapshot');

beforeEach(() => jest.clearAllMocks());

test('capture - missing snapshot name', async () => {
  const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
  await handleSwiftCommand(['capture']);
  expect(spy).toHaveBeenCalledWith(expect.stringContaining('Usage'));
  spy.mockRestore();
});

test('capture - swift not available', async () => {
  swift.isSwiftAvailable.mockReturnValue(false);
  const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
  await handleSwiftCommand(['capture', 'mysnap']);
  expect(spy).toHaveBeenCalledWith(expect.stringContaining('not available'));
  spy.mockRestore();
});

test('capture - success', async () => {
  swift.isSwiftAvailable.mockReturnValue(true);
  swift.captureSwiftVersion.mockReturnValue('Swift version 5.9');
  swift.captureSwiftPackages.mockReturnValue([{ name: 'Alamofire', version: '5.6.0' }]);
  snapshot.loadSnapshot.mockReturnValue({});
  snapshot.createSnapshot.mockImplementation(() => {});
  const spy = jest.spyOn(console, 'log').mockImplementation(() => {});
  await handleSwiftCommand(['capture', 'mysnap']);
  expect(snapshot.createSnapshot).toHaveBeenCalledWith('mysnap', expect.objectContaining({ swift: expect.any(Object) }));
  spy.mockRestore();
});

test('diff - no differences', async () => {
  const pkg = [{ name: 'Alamofire', version: '5.6.0' }];
  swift.isSwiftAvailable.mockReturnValue(true);
  swift.captureSwiftVersion.mockReturnValue('Swift version 5.9');
  swift.captureSwiftPackages.mockReturnValue(pkg);
  swift.diffSwift.mockReturnValue({ versionChanged: false, added: [], removed: [], changed: [] });
  swift.formatSwiftDiff.mockReturnValue('');
  snapshot.loadSnapshot.mockReturnValue({ swift: { version: 'Swift version 5.9', packages: pkg } });
  const spy = jest.spyOn(console, 'log').mockImplementation(() => {});
  await handleSwiftCommand(['diff', 'mysnap']);
  expect(spy).toHaveBeenCalledWith(expect.stringContaining('no swift differences'));
  spy.mockRestore();
});
