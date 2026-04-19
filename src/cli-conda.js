const { isCondaAvailable, captureCondaVersion, captureCondaEnvs, captureCondaPackages, diffConda, formatCondaDiff } = require('./conda');
const { loadSnapshot, createSnapshot } = require('./snapshot');

async function handleCondaCommand(args) {
  const [subcommand, snapshotName, ...rest] = args;

  if (!isCondaAvailable()) {
    console.log('conda is not available on this system');
    return;
  }

  if (subcommand === 'capture') {
    if (!snapshotName) {
      console.error('usage: stackshot conda capture <snapshot>');
      process.exit(1);
    }
    const envName = rest[0] || 'base';
    const data = {
      version: captureCondaVersion(),
      envs: captureCondaEnvs(),
      packages: captureCondaPackages(envName),
      capturedEnv: envName
    };
    const snapshot = await loadSnapshot(snapshotName) || {};
    snapshot.conda = data;
    await createSnapshot(snapshotName, snapshot);
    console.log(`conda info captured into snapshot '${snapshotName}' (env: ${envName})`);
    return;
  }

  if (subcommand === 'diff') {
    if (!snapshotName) {
      console.error('usage: stackshot conda diff <snapshot>');
      process.exit(1);
    }
    const snapshot = await loadSnapshot(snapshotName);
    if (!snapshot || !snapshot.conda) {
      console.error(`no conda data found in snapshot '${snapshotName}'`);
      process.exit(1);
    }
    const envName = snapshot.conda.capturedEnv || 'base';
    const current = { packages: captureCondaPackages(envName) };
    const diff = diffConda(snapshot.conda, current);
    const output = formatCondaDiff(diff);
    if (!output) {
      console.log('no conda package changes detected');
    } else {
      console.log(output);
    }
    return;
  }

  if (subcommand === 'envs') {
    const envs = captureCondaEnvs();
    console.log('conda environments:');
    envs.forEach(e => console.log(' ', e));
    return;
  }

  console.error(`unknown conda subcommand: ${subcommand}`);
  console.error('available: capture, diff, envs');
  process.exit(1);
}

module.exports = { handleCondaCommand };
