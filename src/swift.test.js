const { diffSwift, formatSwiftDiff } = require('./swift');

const base = {
  version: 'Swift version 5.9',
  packages: [
    { name: 'Alamofire', version: '5.6.0' },
    { name: 'SwiftyJSON', version: '5.0.0' }
  ]
};

test('diffSwift - no changes', () => {
  const diff = diffSwift(base, base);
  expect(diff.added).toHaveLength(0);
  expect(diff.removed).toHaveLength(0);
  expect(diff.changed).toHaveLength(0);
  expect(diff.versionChanged).toBe(false);
});

test('diffSwift - added package', () => {
  const current = { ...base, packages: [...base.packages, { name: 'Kingfisher', version: '7.0.0' }] };
  const diff = diffSwift(base, current);
  expect(diff.added).toHaveLength(1);
  expect(diff.added[0].name).toBe('Kingfisher');
});

test('diffSwift - removed package', () => {
  const current = { ...base, packages: [base.packages[0]] };
  const diff = diffSwift(base, current);
  expect(diff.removed).toHaveLength(1);
  expect(diff.removed[0].name).toBe('SwiftyJSON');
});

test('diffSwift - version changed', () => {
  const current = { ...base, version: 'Swift version 5.10' };
  const diff = diffSwift(base, current);
  expect(diff.versionChanged).toBe(true);
});

test('formatSwiftDiff - formats output', () => {
  const diff = {
    versionChanged: true,
    added: [{ name: 'Kingfisher', version: '7.0.0' }],
    removed: [{ name: 'SwiftyJSON' }],
    changed: [{ name: 'Alamofire', version: '5.7.0' }]
  };
  const out = formatSwiftDiff(diff);
  expect(out).toContain('+ Kingfisher');
  expect(out).toContain('- SwiftyJSON');
  expect(out).toContain('~ Alamofire');
  expect(out).toContain('swift version changed');
});
