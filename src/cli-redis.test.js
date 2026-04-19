jest.mock('./snapshot');
jest.mock('./redis');

const { createSnapshot, loadSnapshot } = require('./snapshot');
const { isRedisAvailable, captureRedisVersion, captureRedisConfig, diffRedis, formatRedisDiff } = require('./redis');
const { handleRedisCommand } = require('./cli-redis');

beforeEach(() => jest.clearAllMocks());

test('skips when redis not available', async () => {
  isRedisAvailable.mockReturnValue(false);
  const spy = jest.spyOn(console, 'log').mockImplementation();
  await handleRedisCommand(['capture', 'mysnap']);
  expect(createSnapshot).not.toHaveBeenCalled();
  spy.mockRestore();
});

test('capture saves redis data', async () => {
  isRedisAvailable.mockReturnValue(true);
  captureRedisVersion.mockReturnValue('7.0.0');
  captureRedisConfig.mockReturnValue({ maxmemory: '0' });
  loadSnapshot.mockResolvedValue({});
  createSnapshot.mockResolvedValue();
  const spy = jest.spyOn(console, 'log').mockImplementation();
  await handleRedisCommand(['capture', 'mysnap']);
  expect(createSnapshot).toHaveBeenCalledWith('mysnap', { redis: { version: '7.0.0', config: { maxmemory: '0' } } });
  spy.mockRestore();
});

test('diff prints changes', async () => {
  isRedisAvailable.mockReturnValue(true);
  loadSnapshot.mockResolvedValue({ redis: { version: '7.0.0', config: { maxmemory: '0' } } });
  captureRedisConfig.mockReturnValue({ maxmemory: '100mb' });
  diffRedis.mockReturnValue({ added: {}, removed: {}, changed: { maxmemory: { from: '0', to: '100mb' } } });
  formatRedisDiff.mockReturnValue('~ maxmemory: 0 → 100mb');
  const spy = jest.spyOn(console, 'log').mockImplementation();
  await handleRedisCommand(['diff', 'mysnap']);
  expect(spy).toHaveBeenCalledWith('~ maxmemory: 0 → 100mb');
  spy.mockRestore();
});

test('diff shows no changes message', async () => {
  isRedisAvailable.mockReturnValue(true);
  loadSnapshot.mockResolvedValue({ redis: { version: '7.0.0', config: {} } });
  captureRedisConfig.mockReturnValue({});
  diffRedis.mockReturnValue({ added: {}, removed: {}, changed: {} });
  formatRedisDiff.mockReturnValue('');
  const spy = jest.spyOn(console, 'log').mockImplementation();
  await handleRedisCommand(['diff', 'mysnap']);
  expect(spy).toHaveBeenCalledWith('No redis config changes.');
  spy.mockRestore();
});
