const { loadSnapshot, createSnapshot } = require('./snapshot');
const {
  isCodeAvailable,
  captureVSCodeExtensions,
  captureVSCodeSettings,
  diffVSCode,
  formatVSCodeDiff,
} = require('./vscode');

async function handleVSCodeCommand(args) {
  const [subcommand, snapshotName] = args;

  if (!isCodeAvailable()) {
    console.error('error: `code` CLI not found. Is VS Code installed and in your PATH?');
    process.exit(1);
  }

  if (subcommand === 'capture') {
    if (!snapshotName) {
      console.error('usage: stackshot vscode capture <snapshot-name>');
      process.exit(1);
    }
    const extensions = captureVSCodeExtensions();
    const settings = captureVSCodeSettings();
    const data = { extensions, settings };
    await createSnapshot(snapshotName, 'vscode', data);
    console.log(`captured ${extensions.length} extensions and settings -> ${snapshotName}`);
    return;
  }

  if (subcommand === 'diff') {
    if (!snapshotName) {
      console.error('usage: stackshot vscode diff <snapshot-name>');
      process.exit(1);
    }
    const snapshot = await loadSnapshot(snapshotName, 'vscode');
    if (!snapshot) {
      console.error(`snapshot not found: ${snapshotName}`);
      process.exit(1);
    }
    const current = { extensions: captureVSCodeExtensions(), settings: captureVSCodeSettings() };
    const delta = diffVSCode(snapshot, current);
    const output = formatVSCodeDiff(delta);
    if (!output.trim()) {
      console.log('no differences found');
    } else {
      console.log(output);
    }
    return;
  }

  if (subcommand === 'restore') {
    if (!snapshotName) {
      console.error('usage: stackshot vscode restore <snapshot-name>');
      process.exit(1);
    }
    const snapshot = await loadSnapshot(snapshotName, 'vscode');
    if (!snapshot) {
      console.error(`snapshot not found: ${snapshotName}`);
      process.exit(1);
    }
    const { execSync } = require('child_process');
    for (const ext of snapshot.extensions || []) {
      try {
        execSync(`code --install-extension ${ext}`, { stdio: 'ignore' });
        console.log(`installed: ${ext}`);
      } catch {
        console.warn(`failed to install: ${ext}`);
      }
    }
    console.log('restore complete');
    return;
  }

  console.error('unknown vscode subcommand:', subcommand);
  console.error('available: capture, diff, restore');
  process.exit(1);
}

module.exports = { handleVSCodeCommand };
