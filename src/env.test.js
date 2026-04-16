const fs = require('fs');
const path = require('path');
const os = require('os');
const { captureEnv, readDotEnv, writeDotEnv, diffEnv } = require('./env');

let tmpDir;

beforeEach(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'stackshot-env-'));
});

afterEach(() => {
  fs.rmSync(tmpDir, { recursive: true, force: true });
});

describe('captureEnv', () => {
  test('captures all env vars by default', () => {
    const result = captureEnv();
    expect(typeof result).toBe('object');
    expect(Object.keys(result).length).toBeGreaterThan(0);
  });

  test('filters by prefix', () => {
    process.env.STACKSHOT_TEST_VAR = 'hello';
    const result = captureEnv({ prefix: 'STACKSHOT_' });
    expect(result['STACKSHOT_TEST_VAR']).toBe('hello');
    delete process.env.STACKSHOT_TEST_VAR;
  });

  test('filters by keys list', () => {
    process.env.STACKSHOT_KEY_A = 'aaa';
    const result = captureEnv({ keys: ['STACKSHOT_KEY_A', 'MISSING_KEY'] });
    expect(result['STACKSHOT_KEY_A']).toBe('aaa');
    expect(result['MISSING_KEY']).toBeUndefined();
    delete process.env.STACKSHOT_KEY_A;
  });
});

describe('readDotEnv / writeDotEnv', () => {
  test('round-trips simple key-value pairs', () => {
    const file = path.join(tmpDir, '.env');
    const data = { FOO: 'bar', BAZ: '123' };
    writeDotEnv(file, data);
    const result = readDotEnv(file);
    expect(result).toEqual(data);
  });

  test('handles values with spaces (quoted)', () => {
    const file = path.join(tmpDir, '.env');
    writeDotEnv(file, { GREETING: 'hello world' });
    const result = readDotEnv(file);
    expect(result['GREETING']).toBe('hello world');
  });

  test('throws if file does not exist', () => {
    expect(() => readDotEnv('/nonexistent/.env')).toThrow();
  });
});

describe('diffEnv', () => {
  test('detects added keys', () => {
    const diff = diffEnv({ A: '1' }, { A: '1', B: '2' });
    expect(diff.added).toEqual({ B: '2' });
  });

  test('detects removed keys', () => {
    const diff = diffEnv({ A: '1', B: '2' }, { A: '1' });
    expect(diff.removed).toEqual({ B: '2' });
  });

  test('detects changed keys', () => {
    const diff = diffEnv({ A: '1' }, { A: '2' });
    expect(diff.changed).toEqual({ A: { from: '1', to: '2' } });
  });

  test('returns empty diff for identical envs', () => {
    const diff = diffEnv({ X: 'y' }, { X: 'y' });
    expect(diff).toEqual({ added: {}, removed: {}, changed: {} });
  });
});
