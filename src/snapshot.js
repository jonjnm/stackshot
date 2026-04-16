const fs = require('fs');
const path = require('path');
const os = require('os');

const DEFAULT_SNAPSHOT_DIR = path.join(os.homedir(), '.stackshot');

function ensureSnapshotDir(dir = DEFAULT_SNAPSHOT_DIR) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  return dir;
}

function createSnapshot(name, data, dir = DEFAULT_SNAPSHOT_DIR) {
  ensureSnapshotDir(dir);
  const snapshot = {
    name,
    createdAt: new Date().toISOString(),
    machine: os.hostname(),
    data,
  };
  const filePath = path.join(dir, `${name}.json`);
  fs.writeFileSync(filePath, JSON.stringify(snapshot, null, 2));
  return filePath;
}

function loadSnapshot(name, dir = DEFAULT_SNAPSHOT_DIR) {
  const filePath = path.join(dir, `${name}.json`);
  if (!fs.existsSync(filePath)) {
    throw new Error(`Snapshot "${name}" not found in ${dir}`);
  }
  const raw = fs.readFileSync(filePath, 'utf8');
  return JSON.parse(raw);
}

function listSnapshots(dir = DEFAULT_SNAPSHOT_DIR) {
  ensureSnapshotDir(dir);
  return fs.readdirSync(dir)
    .filter(f => f.endsWith('.json'))
    .map(f => {
      const raw = fs.readFileSync(path.join(dir, f), 'utf8');
      const { name, createdAt, machine } = JSON.parse(raw);
      return { name, createdAt, machine };
    });
}

function deleteSnapshot(name, dir = DEFAULT_SNAPSHOT_DIR) {
  const filePath = path.join(dir, `${name}.json`);
  if (!fs.existsSync(filePath)) {
    throw new Error(`Snapshot "${name}" not found`);
  }
  fs.unlinkSync(filePath);
  return true;
}

module.exports = { createSnapshot, loadSnapshot, listSnapshots, deleteSnapshot, DEFAULT_SNAPSHOT_DIR };
