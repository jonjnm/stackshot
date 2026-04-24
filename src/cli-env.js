const path = require('path');
const { captureEnv, readDotEnv, writeDotEnv, diffEnv } = require('./env');
const { createSnapshot, loadSnapshot } = require('./snapshot');

function handleEnvCommand(args) {
  const [subcommand, ...rest] = args;

  switch (subcommand) {
    case 'capture': {
      const name = rest[0];
      if (!name) return console.error('Usage: stackshot env capture <name> [--prefix PREFIX]');
      const prefixFlag = rest.indexOf('--prefix');
      const prefix = prefixFlag !== -1 ? rest[prefixFlag + 1] : undefined;
      const captured = captureEnv({ prefix });
      createSnapshot(name, { type: 'env', vars: captured });
      console.log(`Captured ${Object.keys(captured).length} env vars into snapshot "${name}"`);
      break;
    }

    case 'restore': {
      const name = rest[0];
      const outFile = rest[1] || '.env';
      if (!name) return console.error('Usage: stackshot env restore <name> [output-file]');
      const snap = loadSnapshot(name);
      if (!snap || snap.type !== 'env') {
        return console.error(`Snapshot "${name}" is not an env snapshot.`);
      }
      const resolvedOut = path.resolve(outFile);
      if (require('fs').existsSync(resolvedOut) && !rest.includes('--force')) {
        return console.error(`File "${outFile}" already exists. Use --force to overwrite.`);
      }
      writeDotEnv(resolvedOut, snap.vars);
      console.log(`Restored ${Object.keys(snap.vars).length} vars to ${outFile}`);
      break;
    }

    case 'diff': {
      const name = rest[0];
      if (!name) return console.error('Usage: stackshot env diff <name> [--prefix PREFIX]');
      const snap = loadSnapshot(name);
      if (!snap || snap.type !== 'env') {
        return console.error(`Snapshot "${name}" is not an env snapshot.`);
      }
      const prefixFlag = rest.indexOf('--prefix');
      const prefix = prefixFlag !== -1 ? rest[prefixFlag + 1] : undefined;
      const current = captureEnv({ prefix });
      const delta = diffEnv(snap.vars, current);

      const { added, removed, changed } = delta;
      if (!Object.keys(added).length && !Object.keys(removed).length && !Object.keys(changed).length) {
        console.log('No differences found.');
        return;
      }
      for (const [k, v] of Object.entries(added)) console.log(`+ ${k}=${v}`);
      for (const [k, v] of Object.entries(removed)) console.log(`- ${k}=${v}`);
      for (const [k, { from, to }] of Object.entries(changed)) console.log(`~ ${k}: ${from} → ${to}`);
      break;
    }

    case 'import': {
      const file = rest[0];
      const name = rest[1];
      if (!file || !name) return console.error('Usage: stackshot env import <.env-file> <name>');
      const vars = readDotEnv(path.resolve(file));
      createSnapshot(name, { type: 'env', vars });
      console.log(`Imported ${Object.keys(vars).length} vars from ${file} into snapshot "${name}"`);
      break;
    }

    default:
      console.log('env subcommands: capture, restore, diff, import');
  }
}

module.exports = { handleEnvCommand };
