jest.mock('./terraform');
jest.mock('./snapshot');

const terraform = require('./terraform');
const { loadSnapshot, createSnapshot } = require('./snapshot');
const { handleTerraformCommand } = require('./cli-terraform');

beforeEach(() => {
  jest.clearAllMocks();
  terraform.isTerraformAvailable.mockReturnValue(true);
  terraform.captureTerraformVersion.mockReturnValue('1.5.0');
  terraform.captureTerraformWorkspaces.mockReturnValue(['default']);
});

describe('handleTerraformCommand', () => {
  it('skips when terraform not available', async () => {
    terraform.isTerraformAvailable.mockReturnValue(false);
    const spy = jest.spyOn(console, 'log').mockImplementation(() => {});
    await handleTerraformCommand(['capture', 'mysnap']);
    expect(spy).toHaveBeenCalledWith('terraform not found, skipping');
    spy.mockRestore();
  });

  it('captures terraform data into snapshot', async () => {
    loadSnapshot.mockResolvedValue({});
    createSnapshot.mockResolvedValue();
    const spy = jest.spyOn(console, 'log').mockImplementation(() => {});
    await handleTerraformCommand(['capture', 'mysnap']);
    expect(createSnapshot).toHaveBeenCalledWith('mysnap', {
      terraform: { version: '1.5.0', workspaces: ['default'] }
    });
    spy.mockRestore();
  });

  it('shows no diff message when nothing changed', async () => {
    loadSnapshot.mockResolvedValue({ terraform: { version: '1.5.0', workspaces: ['default'] } });
    terraform.diffTerraform.mockReturnValue({});
    const spy = jest.spyOn(console, 'log').mockImplementation(() => {});
    await handleTerraformCommand(['diff', 'mysnap']);
    expect(spy).toHaveBeenCalledWith('No terraform differences.');
    spy.mockRestore();
  });

  it('prints diff when differences found', async () => {
    loadSnapshot.mockResolvedValue({ terraform: { version: '1.4.0', workspaces: [] } });
    terraform.diffTerraform.mockReturnValue({ version: { snapshot: '1.4.0', current: '1.5.0' } });
    terraform.formatTerraformDiff.mockReturnValue('  version: 1.4.0 → 1.5.0');
    const spy = jest.spyOn(console, 'log').mockImplementation(() => {});
    await handleTerraformCommand(['diff', 'mysnap']);
    expect(spy).toHaveBeenCalledWith('Terraform diff:');
    spy.mockRestore();
  });
});
