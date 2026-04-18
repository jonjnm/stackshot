const { execSync } = require('child_process');

function isDockerAvailable() {
  try {
    execSync('docker --version', { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

function captureDockerImages() {
  try {
    const out = execSync('docker images --format "{{.Repository}}:{{.Tag}}"', { encoding: 'utf8' });
    return out.trim().split('\n').filter(Boolean);
  } catch {
    return [];
  }
}

function captureDockerContainers() {
  try {
    const out = execSync('docker ps -a --format "{{.Names}}:{{.Image}}:{{.Status}}"', { encoding: 'utf8' });
    return out.trim().split('\n').filter(Boolean).map(line => {
      const [name, image, status] = line.split(':');
      return { name, image, status };
    });
  } catch {
    return [];
  }
}

function diffDocker(snapshot, current) {
  const added = current.images.filter(i => !snapshot.images.includes(i));
  const removed = snapshot.images.filter(i => !current.images.includes(i));
  return { added, removed };
}

function formatDockerDiff(diff) {
  const lines = [];
  if (diff.added.length) {
    lines.push('Images added:');
    diff.added.forEach(i => lines.push(`  + ${i}`));
  }
  if (diff.removed.length) {
    lines.push('Images removed:');
    diff.removed.forEach(i => lines.push(`  - ${i}`));
  }
  return lines.join('\n');
}

module.exports = { isDockerAvailable, captureDockerImages, captureDockerContainers, diffDocker, formatDockerDiff };
