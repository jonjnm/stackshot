const { handleFlutterCommand } = require('./cli-flutter');
const flutter = require('./flutter');
const snapshot = require('./snapshot');

jest.mock('./flutter');
jest.mock('./snapshot');

const mockSnap = { flutter: { version: '3.10.0', packages: [{ name: 'provider', version: '6.0.0' }] } };

beforeEach(() => {
  jest.clearAllMocks();
  snapshot.loadSnapshot.mockResolvedValue({ ...mockSnap });
  snapshot.createSnapshot.mockResolvedValue();
  flutter.isFlutterAvailable.mockResolvedValue(true);
  flutter.captureFlutterVersion.mockResolvedValue('3.10.0');
  flutter.captureFlutterPackages.mockResolvedValue([{ name: 'provider', version: '6.0.0' }]);
  flutter.diffFlutter.mockReturnValue({ added: [], removed: [], versionChanged: false });
  flutter.formatFlutterDiff.mockReturnValue('no changes');
});

test('capture saves flutter data to snapshot', async () => {
  await handleFlutterCommand(['capture'], 'mysnap');
  expect(snapshot.createSnapshot).toHaveBeenCalledWith('mysnap', expect.objectContaining({
    flutter: expect.objectContaining({ version: '3.10.0' })
  }));
});

test('diff prints formatted diff', async () => {
  const spy = jest.spyOn(console, 'log').mockImplementation(() => {});
  await handleFlutterCommand(['diff'], 'mysnap');
  expect(flutter.diffFlutter).toHaveBeenCalled();
  expect(spy).toHaveBeenCalledWith('no changes');
  spy.mockRestore();
});

test('show prints packages', async () => {
  const spy = jest.spyOn(console, 'log').mockImplementation(() => {});
  await handleFlutterCommand(['show'], 'mysnap');
  expect(spy).toHaveBeenCalledWith('flutter version: 3.10.0');
  spy.mockRestore();
});

test('unavailable flutter exits early', async () => {
  flutter.isFlutterAvailable.mockResolvedValue(false);
  const spy = jest.spyOn(console, 'log').mockImplementation(() => {});
  await handleFlutterCommand(['capture'], 'mysnap');
  expect(snapshot.createSnapshot).not.toHaveBeenCalled();
  spy.mockRestore();
});

test('diff with no snapshot data warns user', async () => {
  snapshot.loadSnapshot.mockResolvedValue({});
  const spy = jest.spyOn(console, 'log').mockImplementation(() => {});
  await handleFlutterCommand(['diff'], 'mysnap');
  expect(spy).toHaveBeenCalledWith('no flutter data in snapshot');
  spy.mockRestore();
});
