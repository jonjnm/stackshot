const { execSync } = require('child_process');

function isHaskellAvailable() {
  try {
    execSync('ghc --version', { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

function captureHaskellVersion() {
  try {
    return execSync('ghc --version', { encoding: 'utf8' }).trim();
  } catch {
    return null;
  }
}

function captureCabalPackages() {
  try {
    const output = execSync('cabal list --installed 2>/dev/null || ghc-pkg list --simple-output', { encoding: 'utf8' });
    return output.trim().split('\n').filter(Boolean).sort();
  } catch {
    return [];
  }
}

function diffHaskell(snapshot, current) {
  const diff = { version: null, packages: { added: [], removed: [] } };

  if (snapshot.version !== current.version) {
    diff.version = { from: snapshot.version, to: current.version };
  }

  const snapPkgs = new Set(snapshot.packages || []);
  const currPkgs = new Set(current.packages || []);

  diff.packages.added = [...currPkgs].filter(p => !snapPkgs.has(p));
  diff.packages.removed = [...snapPkgs].filter(p => !currPkgs.has(p));

  return diff;
}

function formatHaskellDiff(diff) {
  const lines = [];
  if (diff.version) {
    lines.push(`  version: ${diff.version.from} → ${diff.version.to}`);
  }
  if (diff.packages.added.length) {
    lines.push('  packages added:');
    diff.packages.added.forEach(p => lines.push(`    + ${p}`));
  }
  if (diff.packages.removed.length) {
    lines.push('  packages removed:');
    diff.packages.removed.forEach(p => lines.push(`    - ${p}`));
  }
  return lines.join('\n');
}

module.exports = { isHaskellAvailable, captureHaskellVersion, captureCabalPackages, diffHaskell, formatHaskellDiff };
