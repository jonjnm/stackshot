#!/usr/bin/env node
const { createSnapshot, loadSnapshot, listSnapshots, deleteSnapshot } = require('./snapshot');

const [,, command, ...args] = process.argv;

function printUsage() {
  console.log(`
stackshot — snapshot and restore local dev environment configs

Usage:
  stackshot save <name> <key=value...>   Save a snapshot with env key/value pairs
  stackshot load <name>                  Print snapshot data
  stackshot list                         List all snapshots
  stackshot delete <name>                Delete a snapshot
`);
}

function parseKV(pairs) {
  return pairs.reduce((acc, pair) => {
    const idx = pair.indexOf('=');
    if (idx === -1) throw new Error(`Invalid key=value pair: "${pair}"`);
    const key = pair.slice(0, idx);
    const value = pair.slice(idx + 1);
    acc[key] = value;
    return acc;
  }, {});
}

try {
  switch (command) {
    case 'save': {
      const [name, ...pairs] = args;
      if (!name) throw new Error('Snapshot name is required');
      const data = parseKV(pairs);
      const filePath = createSnapshot(name, data);
      console.log(`✓ Snapshot "${name}" saved to ${filePath}`);
      break;
    }
    case 'load': {
      const [name] = args;
      if (!name) throw new Error('Snapshot name is required');
      const snap = loadSnapshot(name);
      console.log(`Snapshot: ${snap.name}`);
      console.log(`Created:  ${snap.createdAt}`);
      console.log(`Machine:  ${snap.machine}`);
      console.log('Data:');
      Object.entries(snap.data).forEach(([k, v]) => console.log(`  ${k}=${v}`));
      break;
    }
    case 'list': {
      const snaps = listSnapshots();
      if (snaps.length === 0) { console.log('No snapshots found.'); break; }
      snaps.forEach(s => console.log(`  ${s.name.padEnd(20)} ${s.createdAt}  (${s.machine})`));
      break;
    }
    case 'delete': {
      const [name] = args;
      if (!name) throw new Error('Snapshot name is required');
      deleteSnapshot(name);
      console.log(`✓ Snapshot "${name}" deleted`);
      break;
    }
    default:
      printUsage();
  }
} catch (err) {
  console.error(`Error: ${err.message}`);
  process.exit(1);
}
