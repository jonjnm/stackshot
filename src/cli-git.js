const { captureGitConfig, diffGit, formatGitDiff, isGitAvailable } = require('./git');
const { loadSnapshot, createSnapshot } = require('./snapshot');

async function handleGitCommand(args) {
  const sub = args[0];

  if (!isGitAvailable()) {
    console.error('git is not available on this machine');
    process.exit(1);
  }

  if (sub === 'capture') {
    const name = args[1];
    if (!name) {
      console.error('Usage: stackshot git capture <snapshot-name>');
      process.exit(1);
    }
    const existing = await loadSnapshot(name) || {};
    const gitData = captureGitConfig();
    existing.git = gitData;
    await createSnapshot(name, existing);
    console.log(`Git config captured into snapshot "${name}"`);
    return;
  }

  if (sub === 'diff') {
    const name = args[1];
    if (!name) {
      console.error('Usage: stackshot git diff <snapshot-name>');
      process.exit(1);
    }
    const snapshot = await loadSnapshot(name);
    if (!snapshot || !snapshot.git) {
      console.error(`No git config found in snapshot "${name}"`);
      process.exit(1);
    }
    const current = captureGitConfig();
    const diff = diffGit(snapshot.git, current);
    const formatted = formatGitDiff(diff);
    if (!formatted) {
      console.log('No differences in git config');
    } else {
      console.log(`Git config diff (snapshot vs current):\n${formatted}`);
    }
    return;
  }

  if (sub === 'show') {
    const name = args[1];
    if (!name) {
      console.error('Usage: stackshot git show <snapshot-name>');
      process.exit(1);
    }
    const snapshot = await loadSnapshot(name);
    if (!snapshot || !snapshot.git) {
      console.error(`No git config found in snapshot "${name}"`);
      process.exit(1);
    }
    for (const [k, v] of Object.entries(snapshot.git.config)) {
      console.log(`${k}=${v}`);
    }
    return;
  }

  console.error('Unknown git subcommand. Use: capture | diff | show');
  process.exit(1);
}

module.exports = { handleGitCommand };
