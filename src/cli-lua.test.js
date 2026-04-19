const { handleLuaCommand } = require('./cli-lua');
const lua = require('./lua');
const snapshot = require('./snapshot');

jest.mock('./lua');
jest.mock('./snapshot');

describe('handleLuaCommand', () => {
  beforeEach(() => jest.clearAllMocks());

  test('capture skips when lua unavailable', async () => {
    lua.isLuaAvailable.mockReturnValue(false);
    snapshot.loadSnapshot.mockResolvedValue({});
    const spy = jest.spyOn(console, 'log').mockImplementation(() => {});
    await handleLuaCommand(['capture'], 'mysnap');
    expect(snapshot.createSnapshot).not.toHaveBeenCalled();
    spy.mockRestore();
  });

  test('capture saves lua data', async () => {
    lua.isLuaAvailable.mockReturnValue(true);
    lua.captureLuaVersion.mockReturnValue('Lua 5.4.4');
    lua.captureLuaRocks.mockReturnValue([{ name: 'inspect', version: '3.1.1' }]);
    snapshot.loadSnapshot.mockResolvedValue({});
    snapshot.createSnapshot.mockResolvedValue();
    const spy = jest.spyOn(console, 'log').mockImplementation(() => {});
    await handleLuaCommand(['capture'], 'mysnap');
    expect(snapshot.createSnapshot).toHaveBeenCalledWith('mysnap', expect.objectContaining({ luaVersion: 'Lua 5.4.4' }));
    spy.mockRestore();
  });

  test('diff prints no changes', async () => {
    lua.isLuaAvailable.mockReturnValue(true);
    lua.captureLuaVersion.mockReturnValue('Lua 5.4.4');
    lua.captureLuaRocks.mockReturnValue([]);
    lua.diffLua.mockReturnValue({ added: [], removed: [], changed: [], versionChanged: false });
    snapshot.loadSnapshot.mockResolvedValue({ luaVersion: 'Lua 5.4.4', luarocks: [] });
    const spy = jest.spyOn(console, 'log').mockImplementation(() => {});
    await handleLuaCommand(['diff'], 'mysnap');
    expect(spy).toHaveBeenCalledWith('lua: no changes');
    spy.mockRestore();
  });

  test('show prints snapshot data', async () => {
    snapshot.loadSnapshot.mockResolvedValue({ luaVersion: 'Lua 5.4.4', luarocks: [{ name: 'inspect', version: '3.1.1' }] });
    const spy = jest.spyOn(console, 'log').mockImplementation(() => {});
    await handleLuaCommand(['show'], 'mysnap');
    expect(spy).toHaveBeenCalledWith(expect.stringContaining('inspect'));
    spy.mockRestore();
  });

  test('unknown subcommand prints usage', async () => {
    const spy = jest.spyOn(console, 'log').mockImplementation(() => {});
    await handleLuaCommand(['unknown'], 'mysnap');
    expect(spy).toHaveBeenCalledWith(expect.stringContaining('usage'));
    spy.mockRestore();
  });
});
