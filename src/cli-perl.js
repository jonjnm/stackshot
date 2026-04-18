const { isPerlAvailable, capturePerlVersion, captureCpanPackages, diffPerl, formatPerlDiff } = require('./perl');
const { loadSnapshot, createSnapshot } = require('./snapshot');

async function handlePerlCommand(args, snapshotName) {
  if (!isPerlAvailable()) {
    console.log('perl is not available on this system');
    return;
  }

  const sub = args[0];

  if (sub === 'capture') {
    const snapshot = await loadSnapshot(snapshotName);
    snapshot.perl = {
      version: capturePerlVersion(),
      packages: captureCpanPackages()
    };
    await createSnapshot(snapshotName, snapshot);
    console.log('perl config captured');
    return;
  }

  if (sub === 'diff') {
    const snapshot = await loadSnapshot(snapshotName);
    if (!snapshot.perl) {
      console.log('no perl data in snapshot');
      return;
    }
    const current = {
      version: capturePerlVersion(),
      packages: captureCpanPackages()
    };
    const diff = diffPerl(snapshot.perl, current);
    const out = formatPerlDiff(diff);
    if (out) {
      console.log(out);
    } else {
      console.log('no differences found');
    }
    return;
  }

  if (sub === 'show') {
    const snapshot = await loadSnapshot(snapshotName);
    if (!snapshot.perl) {
      console.log('no perl data in snapshot');
      return;
    }
    console.log(`version: ${snapshot.perl.version}`);
    const pkgs = Object.entries(snapshot.perl.packages || {});
    if (pkgs.length === 0) {
      console.log('no cpan packages captured');
    } else {
      console.log(`packages (${pkgs.length}):`);
      for (const [name, ver] of pkgs) {
        console.log(`  ${name}@${ver}`);
      }
    }
    return;
  }

  console.log('usage: stackshot perl <capture|diff|show> [snapshot]');
}

module.exports = { handlePerlCommand };
