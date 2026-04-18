const { isTerraformAvailable, captureTerraformVersion, captureTerraformWorkspaces, diffTerraform, formatTerraformDiff } = require('./terraform');
const { createSnapshot, loadSnapshot } = require('./snapshot');

async function handleTerraformCommand(args) {
  const [sub, snapshotName] = args;

  if (!isTerraformAvailable()) {
    console.log('terraform not found, skipping');
    return;
  }

  if (sub === 'capture') {
    if (!snapshotName) {
      console.error('Usage: stackshot terraform capture <snapshot>');
      process.exit(1);
    }
    const data = {
      version: captureTerraformVersion(),
      workspaces: captureTerraformWorkspaces()
    };
    const snap = await loadSnapshot(snapshotName) || {};
    snap.terraform = data;
    await createSnapshot(snapshotName, snap);
    console.log(`terraform config captured into '${snapshotName}'`);
    return;
  }

  if (sub === 'diff') {
    if (!snapshotName) {
      console.error('Usage: stackshot terraform diff <snapshot>');
      process.exit(1);
    }
    const snap = await loadSnapshot(snapshotName);
    if (!snap || !snap.terraform) {
      console.log('No terraform data in snapshot.');
      return;
    }
    const current = {
      version: captureTerraformVersion(),
      workspaces: captureTerraformWorkspaces()
    };
    const diff = diffTerraform(snap.terraform, current);
    if (!Object.keys(diff).length) {
      console.log('No terraform differences.');
    } else {
      console.log('Terraform diff:');
      console.log(formatTerraformDiff(diff));
    }
    return;
  }

  console.error(`Unknown terraform subcommand: ${sub}`);
  process.exit(1);
}

module.exports = { handleTerraformCommand };
