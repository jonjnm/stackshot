const { diffHelm, formatHelmDiff } = require('./helm');

const sampleRepos = [
  { name: 'stable', url: 'https://charts.helm.sh/stable' },
  { name: 'bitnami', url: 'https://charts.bitnami.com/bitnami' },
];

const sampleReleases = [
  { name: 'my-nginx', namespace: 'default', chart: 'nginx-1.0.0' },
  { name: 'prometheus', namespace: 'monitoring', chart: 'prometheus-15.0.0' },
];

describe('diffHelm', () => {
  it('returns empty diff when snapshots are identical', () => {
    const snap = { repos: sampleRepos, releases: sampleReleases };
    const curr = { repos: sampleRepos, releases: sampleReleases };
    const diff = diffHelm(snap, curr);
    expect(diff.repos.added).toHaveLength(0);
    expect(diff.repos.removed).toHaveLength(0);
    expect(diff.releases.added).toHaveLength(0);
    expect(diff.releases.removed).toHaveLength(0);
  });

  it('detects added repo', () => {
    const snap = { repos: [sampleRepos[0]], releases: [] };
    const curr = { repos: sampleRepos, releases: [] };
    const diff = diffHelm(snap, curr);
    expect(diff.repos.added).toHaveLength(1);
    expect(diff.repos.added[0].name).toBe('bitnami');
  });

  it('detects removed repo', () => {
    const snap = { repos: sampleRepos, releases: [] };
    const curr = { repos: [sampleRepos[0]], releases: [] };
    const diff = diffHelm(snap, curr);
    expect(diff.repos.removed).toHaveLength(1);
    expect(diff.repos.removed[0].name).toBe('bitnami');
  });

  it('detects added release', () => {
    const snap = { repos: [], releases: [sampleReleases[0]] };
    const curr = { repos: [], releases: sampleReleases };
    const diff = diffHelm(snap, curr);
    expect(diff.releases.added).toHaveLength(1);
    expect(diff.releases.added[0].name).toBe('prometheus');
  });

  it('detects removed release', () => {
    const snap = { repos: [], releases: sampleReleases };
    const curr = { repos: [], releases: [sampleReleases[1]] };
    const diff = diffHelm(snap, curr);
    expect(diff.releases.removed).toHaveLength(1);
    expect(diff.releases.removed[0].name).toBe('my-nginx');
  });

  it('handles missing keys gracefully', () => {
    const diff = diffHelm({}, {});
    expect(diff.repos.added).toHaveLength(0);
    expect(diff.releases.removed).toHaveLength(0);
  });
});

describe('formatHelmDiff', () => {
  it('formats added and removed repos and releases', () => {
    const diff = {
      repos: { added: [sampleRepos[1]], removed: [] },
      releases: { added: [], removed: [sampleReleases[0]] },
    };
    const out = formatHelmDiff(diff);
    expect(out).toContain('+ repo: bitnami');
    expect(out).toContain('- release: default/my-nginx');
  });

  it('returns empty string when no changes', () => {
    const diff = { repos: { added: [], removed: [] }, releases: { added: [], removed: [] } };
    expect(formatHelmDiff(diff)).toBe('');
  });
});
