jest.mock('./kotlin');
jest.mock('./snapshot');

const kotlin = require('./kotlin');
const { loadSnapshot, createSnapshot } = require('./snapshot');
const { handleKotlinCommand } = require('./cli-kotlin');

beforeEach(() => jest.clearAllMocks());

describe('handleKotlinCommand capture', () => {
  it('captures kotlin data into snapshot', async () => {
    kotlin.isKotlinAvailable.mockReturnValue(true);
    kotlin.captureKotlinVersion.mockReturnValue('1.9.0');
    kotlin.captureGradleDependencies.mockReturnValue(['dep:a:1.0']);
    loadSnapshot.mockResolvedValue({});
    createSnapshot.mockResolvedValue();
    const log = jest.spyOn(console, 'log').mockImplementation();
    await handleKotlinCommand(['capture', 'mysnap']);
    expect(createSnapshot).toHaveBeenCalledWith('mysnap', expect.objectContaining({
      kotlin: { kotlinVersion: '1.9.0', gradleDeps: ['dep:a:1.0'] }
    }));
    log.mockRestore();
  });

  it('exits if kotlin not available', async () => {
    kotlin.isKotlinAvailable.mockReturnValue(false);
    const err = jest.spyOn(console, 'error').mockImplementation();
    const exit = jest.spyOn(process, 'exit').mockImplementation(() => { throw new Error('exit'); });
    await expect(handleKotlinCommand(['capture', 'mysnap'])).rejects.toThrow('exit');
    err.mockRestore(); exit.mockRestore();
  });
});

describe('handleKotlinCommand diff', () => {
  it('prints no differences when matching', async () => {
    kotlin.isKotlinAvailable.mockReturnValue(true);
    kotlin.captureKotlinVersion.mockReturnValue('1.9.0');
    kotlin.captureGradleDependencies.mockReturnValue([]);
    kotlin.diffKotlin.mockReturnValue({ kotlinVersion: null, added: [], removed: [] });
    kotlin.formatKotlinDiff.mockReturnValue('');
    loadSnapshot.mockResolvedValue({ kotlin: { kotlinVersion: '1.9.0', gradleDeps: [] } });
    const log = jest.spyOn(console, 'log').mockImplementation();
    await handleKotlinCommand(['diff', 'mysnap']);
    expect(log).toHaveBeenCalledWith('No kotlin differences');
    log.mockRestore();
  });
});

describe('handleKotlinCommand unknown', () => {
  it('exits on unknown subcommand', async () => {
    const err = jest.spyOn(console, 'error').mockImplementation();
    const exit = jest.spyOn(process, 'exit').mockImplementation(() => { throw new Error('exit'); });
    await expect(handleKotlinCommand(['unknown'])).rejects.toThrow('exit');
    err.mockRestore(); exit.mockRestore();
  });
});
