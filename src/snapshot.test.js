const fs = require('fs');
const path = require('path');
const os = require('os');
const { createSnapshot, loadSnapshot, listSnapshots, deleteSnapshot } = require('./snapshot');

const TEST_DIR = path.join(os.tmpdir(), 'stackshot-test-' + Date.now());

afterAll(() => {
  fs.rmSync(TEST_DIR, { recursive: true, force: true });
});

describe('snapshot module', () => {
  test('createSnapshot writes a json file and returns path', () => {
    const filePath = createSnapshot('myenv', { NODE_ENV: 'development' }, TEST_DIR);
    expect(fs.existsSync(filePath)).toBe(true);
    const parsed = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    expect(parsed.name).toBe('myenv');
    expect(parsed.data).toEqual({ NODE_ENV: 'development' });
    expect(parsed.machine).toBe(os.hostname());
  });

  test('loadSnapshot retrieves snapshot by name', () => {
    createSnapshot('loadtest', { foo: 'bar' }, TEST_DIR);
    const snap = loadSnapshot('loadtest', TEST_DIR);
    expect(snap.name).toBe('loadtest');
    expect(snap.data.foo).toBe('bar');
  });

  test('loadSnapshot throws if snapshot does not exist', () => {
    expect(() => loadSnapshot('ghost', TEST_DIR)).toThrow('Snapshot "ghost" not found');
  });

  test('listSnapshots returns metadata for all snapshots', () => {
    createSnapshot('alpha', {}, TEST_DIR);
    createSnapshot('beta', {}, TEST_DIR);
    const list = listSnapshots(TEST_DIR);
    const names = list.map(s => s.name);
    expect(names).toContain('alpha');
    expect(names).toContain('beta');
    list.forEach(s => {
      expect(s).toHaveProperty('createdAt');
      expect(s).toHaveProperty('machine');
    });
  });

  test('deleteSnapshot removes the file', () => {
    createSnapshot('todelete', {}, TEST_DIR);
    deleteSnapshot('todelete', TEST_DIR);
    expect(() => loadSnapshot('todelete', TEST_DIR)).toThrow();
  });

  test('deleteSnapshot throws if snapshot missing', () => {
    expect(() => deleteSnapshot('nope', TEST_DIR)).toThrow('Snapshot "nope" not found');
  });
});
