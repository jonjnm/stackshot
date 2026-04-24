const {
  diffKubernetes,
  formatKubernetesDiff,
} = require('./kubernetes');

describe('diffKubernetes', () => {
  const base = {
    version: 'Client Version: v1.28.0',
    currentContext: 'docker-desktop',
    contexts: ['docker-desktop', 'minikube'],
  };

  test('returns empty diff when snapshots are identical', () => {
    const diff = diffKubernetes(base, { ...base, contexts: [...base.contexts] });
    expect(diff).toEqual({});
  });

  test('detects version change', () => {
    const current = { ...base, version: 'Client Version: v1.29.0' };
    const diff = diffKubernetes(base, current);
    expect(diff.version).toEqual({ from: 'Client Version: v1.28.0', to: 'Client Version: v1.29.0' });
  });

  test('detects current context change', () => {
    const current = { ...base, currentContext: 'minikube' };
    const diff = diffKubernetes(base, current);
    expect(diff.currentContext).toEqual({ from: 'docker-desktop', to: 'minikube' });
  });

  test('detects added context', () => {
    const current = { ...base, contexts: ['docker-desktop', 'minikube', 'prod-cluster'] };
    const diff = diffKubernetes(base, current);
    expect(diff.contexts.added).toContain('prod-cluster');
    expect(diff.contexts.removed).toHaveLength(0);
  });

  test('detects removed context', () => {
    const current = { ...base, contexts: ['docker-desktop'] };
    const diff = diffKubernetes(base, current);
    expect(diff.contexts.removed).toContain('minikube');
    expect(diff.contexts.added).toHaveLength(0);
  });

  test('handles missing contexts gracefully', () => {
    const snap = { version: 'v1.28.0', currentContext: 'default', contexts: undefined };
    const cur = { version: 'v1.28.0', currentContext: 'default', contexts: undefined };
    expect(() => diffKubernetes(snap, cur)).not.toThrow();
  });
});

describe('formatKubernetesDiff', () => {
  test('formats version and context changes', () => {
    const diff = {
      version: { from: 'v1.28.0', to: 'v1.29.0' },
      currentContext: { from: 'docker-desktop', to: 'minikube' },
      contexts: { added: ['prod'], removed: ['staging'] },
    };
    const output = formatKubernetesDiff(diff);
    expect(output).toContain('v1.28.0 → v1.29.0');
    expect(output).toContain('docker-desktop → minikube');
    expect(output).toContain('+ context: prod');
    expect(output).toContain('- context: staging');
  });

  test('returns empty string for empty diff', () => {
    expect(formatKubernetesDiff({})).toBe('');
  });
});
