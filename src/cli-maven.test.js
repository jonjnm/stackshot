const { handleMavenCommand } = require('./cli-maven');
const maven = require('./maven');
const snapshot = require('./snapshot');

jest.mock('./maven');
jest.mock('./snapshot');

describe('handleMavenCommand', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
    maven.isMavenAvailable.mockReturnValue(true);
    maven.captureMavenVersion.mockReturnValue('3.9.0');
    maven.captureMavenPlugins.mockReturnValue(['maven-compiler-plugin']);
    snapshot.loadSnapshot.mockResolvedValue(null);
    snapshot.createSnapshot.mockResolvedValue();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('prints unavailable message when maven not found', async () => {
    maven.isMavenAvailable.mockReturnValue(false);
    await handleMavenCommand([], {});
    expect(console.log).toHaveBeenCalledWith(expect.stringContaining('not available'));
  });

  it('capture requires --name flag', async () => {
    const mockExit = jest.spyOn(process, 'exit').mockImplementation(() => { throw new Error('exit'); });
    await expect(handleMavenCommand(['capture'], {})).rejects.toThrow('exit');
    expect(console.error).toHaveBeenCalledWith(expect.stringContaining('--name'));
    mockExit.mockRestore();
  });

  it('capture stores maven data into snapshot', async () => {
    await handleMavenCommand(['capture'], { name: 'mysnap' });
    expect(snapshot.createSnapshot).toHaveBeenCalledWith('mysnap', expect.objectContaining({
      maven: expect.objectContaining({ version: '3.9.0' })
    }));
    expect(console.log).toHaveBeenCalledWith(expect.stringContaining('mysnap'));
  });

  it('diff shows no changes when identical', async () => {
    snapshot.loadSnapshot.mockResolvedValue({
      maven: { version: '3.9.0', plugins: ['maven-compiler-plugin'] }
    });
    maven.diffMaven.mockReturnValue({});
    await handleMavenCommand(['diff'], { name: 'mysnap' });
    expect(console.log).toHaveBeenCalledWith(expect.stringContaining('no maven changes'));
  });

  it('diff prints formatted diff when changes exist', async () => {
    snapshot.loadSnapshot.mockResolvedValue({
      maven: { version: '3.8.0', plugins: [] }
    });
    maven.diffMaven.mockReturnValue({ version: { from: '3.8.0', to: '3.9.0' } });
    maven.formatMavenDiff.mockReturnValue('  version: 3.8.0 → 3.9.0');
    await handleMavenCommand(['diff'], { name: 'mysnap' });
    expect(console.log).toHaveBeenCalledWith(expect.stringContaining('maven diff'));
  });

  it('show prints version and plugins', async () => {
    await handleMavenCommand(['show'], {});
    expect(console.log).toHaveBeenCalledWith('maven version:', '3.9.0');
    expect(console.log).toHaveBeenCalledWith('plugins:', 'maven-compiler-plugin');
  });

  it('prints usage for unknown subcommand', async () => {
    await handleMavenCommand(['unknown'], {});
    expect(console.log).toHaveBeenCalledWith(expect.stringContaining('usage'));
  });
});
