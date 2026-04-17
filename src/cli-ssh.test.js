const { handleSshCommand } = require('./cli-ssh');
const snapshot = require('./snapshot');
const ssh = require('./ssh');

jest.mock('./snapshot');
jest.mock('./ssh');

describe('handleSshCommand', () => {
  let exitSpy, errorSpy, logSpy;

  beforeEach(() => {
    exitSpy = jest.spyOn(process, 'exit').mockImplementation(() => { throw new Error('exit'); });
    errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    ssh.isSshAvailable.mockReturnValue(true);
  });

  afterEach(() => jest.restoreAllMocks());

  it('exits if ssh not available', async () => {
    ssh.isSshAvailable.mockReturnValue(false);
    await expect(handleSshCommand(['capture', 'mysnap'])).rejects.toThrow('exit');
    expect(exitSpy).toHaveBeenCalledWith(1);
  });

  it('exits if no snapshot name for capture', async () => {
    await expect(handleSshCommand(['capture'])).rejects.toThrow('exit');
    expect(errorSpy).toHaveBeenCalledWith(expect.stringContaining('Usage'));
  });

  it('captures ssh config into snapshot', async () => {
    ssh.captureSshKeys.mockResolvedValue(['id_rsa', 'id_ed25519']);
    ssh.captureSshConfig.mockResolvedValue('Host *\n  ServerAliveInterval 60');
    snapshot.loadSnapshot.mockRejectedValue(new Error('not found'));
    snapshot.createSnapshot.mockResolvedValue();

    await handleSshCommand(['capture', 'mysnap']);

    expect(snapshot.createSnapshot).toHaveBeenCalledWith('mysnap', {
      ssh: { keys: ['id_rsa', 'id_ed25519'], config: 'Host *\n  ServerAliveInterval 60' }
    });
    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('captured'));
  });

  it('shows no differences message when diff is clean', async () => {
    snapshot.loadSnapshot.mockResolvedValue({ ssh: { keys: ['id_rsa'], config: '' } });
    ssh.captureSshKeys.mockResolvedValue(['id_rsa']);
    ssh.captureSshConfig.mockResolvedValue('');
    ssh.diffSsh.mockReturnValue({ added: [], removed: [], configChanged: false });

    await handleSshCommand(['diff', 'mysnap']);
    expect(logSpy).toHaveBeenCalledWith('No SSH differences found.');
  });

  it('prints diff when differences exist', async () => {
    snapshot.loadSnapshot.mockResolvedValue({ ssh: { keys: ['id_rsa'], config: '' } });
    ssh.captureSshKeys.mockResolvedValue(['id_rsa', 'id_ed25519']);
    ssh.captureSshConfig.mockResolvedValue('');
    ssh.diffSsh.mockReturnValue({ added: ['id_ed25519'], removed: [], configChanged: false });
    ssh.formatSshDiff.mockReturnValue('+ id_ed25519');

    await handleSshCommand(['diff', 'mysnap']);
    expect(logSpy).toHaveBeenCalledWith('+ id_ed25519');
  });

  it('exits on unknown subcommand', async () => {
    await expect(handleSshCommand(['unknown'])).rejects.toThrow('exit');
    expect(errorSpy).toHaveBeenCalledWith(expect.stringContaining('Unknown ssh subcommand'));
  });
});
