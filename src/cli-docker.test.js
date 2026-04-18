jest.mock('./snapshot');
jest.mock('./docker');

const { createSnapshot, loadSnapshot } = require('./snapshot');
const { isDockerAvailable, captureDockerImages, captureDockerContainers, diffDocker, formatDockerDiff } = require('./docker');
const { handleDockerCommand } = require('./cli-docker');

beforeEach(() => {
  jest.clearAllMocks();
  isDockerAvailable.mockReturnValue(true);
  captureDockerImages.mockReturnValue(['nginx:latest', 'node:18']);
  captureDockerContainers.mockReturnValue([]);
  createSnapshot.mockResolvedValue();
  jest.spyOn(console, 'log').mockImplementation(() => {});
  jest.spyOn(console, 'error').mockImplementation(() => {});
  jest.spyOn(process, 'exit').mockImplementation(() => { throw new Error('exit'); });
});

afterEach(() => jest.restoreAllMocks());

test('capture stores snapshot', async () => {
  await handleDockerCommand(['capture', 'mysnap']);
  expect(createSnapshot).toHaveBeenCalledWith('mysnap', expect.objectContaining({ docker: expect.any(Object) }));
  expect(console.log).toHaveBeenCalledWith(expect.stringContaining('2 image(s)'));
});

test('capture requires name', async () => {
  await expect(handleDockerCommand(['capture'])).rejects.toThrow('exit');
});

test('diff prints no differences', async () => {
  loadSnapshot.mockResolvedValue({ docker: { images: ['nginx:latest'], containers: [] } });
  diffDocker.mockReturnValue({ added: [], removed: [] });
  formatDockerDiff.mockReturnValue('');
  await handleDockerCommand(['diff', 'mysnap']);
  expect(console.log).toHaveBeenCalledWith('No differences found.');
});

test('list prints images', async () => {
  await handleDockerCommand(['list']);
  expect(console.log).toHaveBeenCalledWith('  nginx:latest');
});

test('exits when docker unavailable', async () => {
  isDockerAvailable.mockReturnValue(false);
  await expect(handleDockerCommand(['list'])).rejects.toThrow('exit');
});
