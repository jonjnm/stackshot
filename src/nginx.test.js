const { isNginxAvailable, captureNginxVersion, captureNginxConfig, diffNginx, formatNginxDiff } = require('./nginx');
const { execSync } = require('child_process');
const fs = require('fs');

jest.mock('child_process');
jest.mock('fs');

describe('isNginxAvailable', () => {
  it('returns true when nginx is installed', () => {
    execSync.mockReturnValueOnce(Buffer.from('nginx/1.25.0'));
    expect(isNginxAvailable()).toBe(true);
  });

  it('returns false when nginx is not installed', () => {
    execSync.mockImplementationOnce(() => { throw new Error('not found'); });
    expect(isNginxAvailable()).toBe(false);
  });
});

describe('captureNginxVersion', () => {
  it('parses version from nginx -v output', () => {
    execSync.mockReturnValueOnce(Buffer.from('nginx version: nginx/1.25.3'));
    expect(captureNginxVersion()).toBe('1.25.3');
  });

  it('returns null on failure', () => {
    execSync.mockImplementationOnce(() => { throw new Error(); });
    expect(captureNginxVersion()).toBeNull();
  });
});

describe('captureNginxConfig', () => {
  it('returns config content when file exists', () => {
    fs.existsSync.mockImplementation((p) => p === '/usr/local/etc/nginx/nginx.conf');
    fs.readFileSync.mockReturnValueOnce('worker_processes 1;');
    const result = captureNginxConfig();
    expect(result.configPath).toBe('/usr/local/etc/nginx/nginx.conf');
    expect(result.content).toBe('worker_processes 1;');
  });

  it('returns null values when no config found', () => {
    fs.existsSync.mockReturnValue(false);
    const result = captureNginxConfig();
    expect(result.configPath).toBeNull();
    expect(result.content).toBeNull();
  });
});

describe('diffNginx', () => {
  it('detects version change', () => {
    const diff = diffNginx({ version: '1.24.0', config: {} }, { version: '1.25.3', config: {} });
    expect(diff.version).toEqual({ snapshot: '1.24.0', current: '1.25.3' });
  });

  it('detects config change', () => {
    const diff = diffNginx(
      { version: '1.25.3', config: { configPath: '/etc/nginx/nginx.conf', content: 'old' } },
      { version: '1.25.3', config: { configPath: '/etc/nginx/nginx.conf', content: 'new' } }
    );
    expect(diff.config.changed).toBe(true);
  });

  it('returns empty diff when nothing changed', () => {
    const state = { version: '1.25.3', config: { content: 'same' } };
    expect(diffNginx(state, state)).toEqual({});
  });
});

describe('formatNginxDiff', () => {
  it('formats version and config diffs', () => {
    const lines = formatNginxDiff({
      version: { snapshot: '1.24.0', current: '1.25.3' },
      config: { current: '/etc/nginx/nginx.conf', changed: true },
    });
    expect(lines).toHaveLength(2);
    expect(lines[0]).toContain('1.24.0');
    expect(lines[1]).toContain('/etc/nginx/nginx.conf');
  });
});
