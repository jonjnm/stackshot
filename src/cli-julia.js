const { isJuliaAvailable, captureJuliaVersion, captureJuliaPackages, diffJulia, formatJuliaDiff } = require('./julia');
const { loadSnapshot } = require('./snapshot');

async function handleJuliaCommand(args) {
  const [sub, ...rest] = args;

  if (sub === 'capture') {
    if (!isJuliaAvailable()) {
      console.error('julia not found in PATH');
      process.exit(1);
    }
    const data = {
      version: captureJuliaVersion(),
      packages: captureJuliaPackages()
    };
    console.log(JSON.stringify(data, null, 2));
    return data;
  }

  if (sub === 'diff') {
    const [snap1Name, snap2Name] = rest;
    if (!snap1Name || !snap2Name) {
      console.error('Usage: stackshot julia diff <snapshot1> <snapshot2>');
      process.exit(1);
    }
    const s1 = await loadSnapshot(snap1Name);
    const s2 = await loadSnapshot(snap2Name);
    if (!s1.julia || !s2.julia) {
      console.log('No julia data in one or both snapshots.');
      return;
    }
    const d = diffJulia(s1.julia, s2.julia);
    const out = formatJuliaDiff(d);
    if (!out && !d.versionChanged) {
      console.log('No julia differences.');
    } else {
      console.log('Julia diff:');
      if (d.versionChanged) console.log(`  version: ${s1.julia.version} -> ${s2.julia.version}`);
      if (out) console.log(out);
    }
    return d;
  }

  console.error(`Unknown julia subcommand: ${sub}`);
  console.error('Available: capture, diff');
  process.exit(1);
}

module.exports = { handleJuliaCommand };
