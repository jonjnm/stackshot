const { handleVSCodeCommand } = require('./cli-vscode');
const snapshot = require('./snapshot');
const vscode = require('./vscode');

jest.mock('./snapshot');
jest.mock('./vscode');
jest.mock('child_process');

const mockExtensions = ['ms-python.python', 'esbenp.prettier-vscode'];
const mockSettings = { 'editor.fontSize': 14 };

beforeEach(() => {
  jest.clearAllMocks();
  vscode.isCodeAvailable.mockReturnValue(true);
  vscode.captureVSCodeExtensions.mockReturnValue(mockExtensions);
  vscode.captureVSCodeSettings.mockReturnValue(mockSettings);
  vscode.diffVSCode.mockReturnValue({ added: [], removed: [], settingsChanged: {} });
  vscode.formatVSCodeDiff.mockReturnValue('');
  snapshot.createSnapshot.mockResolvedValue(undefined);
  snapshot.loadSnapshot.mockResolvedValue({ extensions: mockExtensions, settings: mockSettings });
});

describe('handleVSCodeCommand', () => {
  test('capture saves extensions and settings', async () => {
    await handleVSCodeCommand(['capture', 'mysnap']);
    expect(snapshot.createSnapshot).toHaveBeenCalledWith('mysnap', 'vscode', {
      extensions: mockExtensions,
      settings: mockSettings,
    });
  });

  test('capture exits if no snapshot name', async () => {
    const exit = jest.spyOn(process, 'exit').mockImplementation(() => { throw new Error('exit'); });
    await expect(handleVSCodeCommand(['capture'])).rejects.toThrow('exit');
    expect(exit).toHaveBeenCalledWith(1);
    exit.mockRestore();
  });

  test('diff prints no differences when clean', async () => {
    const log = jest.spyOn(console, 'log').mockImplementation(() => {});
    await handleVSCodeCommand(['diff', 'mysnap']);
    expect(log).toHaveBeenCalledWith('no differences found');
    log.mockRestore();
  });

  test('diff prints output when differences exist', async () => {
    vscode.formatVSCodeDiff.mockReturnValue('+ some-extension');
    const log = jest.spyOn(console, 'log').mockImplementation(() => {});
    await handleVSCodeCommand(['diff', 'mysnap']);
    expect(log).toHaveBeenCalledWith('+ some-extension');
    log.mockRestore();
  });

  test('exits if code not available', async () => {
    vscode.isCodeAvailable.mockReturnValue(false);
    const exit = jest.spyOn(process, 'exit').mockImplementation(() => { throw new Error('exit'); });
    await expect(handleVSCodeCommand(['capture', 'mysnap'])).rejects.toThrow('exit');
    exit.mockRestore();
  });

  test('unknown subcommand exits with 1', async () => {
    const exit = jest.spyOn(process, 'exit').mockImplementation(() => { throw new Error('exit'); });
    await expect(handleVSCodeCommand(['nope'])).rejects.toThrow('exit');
    exit.mockRestore();
  });
});
