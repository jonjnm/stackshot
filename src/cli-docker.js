const { createSnapshot, loadSnapshot } = require('./snapshot');
const { isDockerAvailable, captureDockerImages, captureDockerContainers, diffDocker, formatDockerDiff } = require('./docker');

async function handleDockerCommand(args) {
  if (!isDockerAvailable()) {
    console.error('Docker is not available on this machine.');
    process.exit(1);
  }

  const [sub, name] = args;

  if (sub === 'capture') {
    if (!name) { console.error('Usage: stackshot docker capture <name>'); process.exit(1); }
    const images = captureDockerImages();
    const containers = captureDockerContainers();
    await createSnapshot(name, { docker: { images, containers } });
    console.log(`Captured ${images.length} image(s) and ${containers.length} container(s) into snapshot "${name}".`);
    return;
  }

  if (sub === 'diff') {
    if (!name) { console.error('Usage: stackshot docker diff <name>'); process.exit(1); }
    const snapshot = await loadSnapshot(name);
    if (!snapshot.docker) { console.error('No docker data in snapshot.'); process.exit(1); }
    const current = { images: captureDockerImages(), containers: captureDockerContainers() };
    const diff = diffDocker(snapshot.docker, current);
    const out = formatDockerDiff(diff);
    if (!out) {
      console.log('No differences found.');
    } else {
      console.log(out);
    }
    return;
  }

  if (sub === 'list') {
    const images = captureDockerImages();
    if (!images.length) { console.log('No Docker images found.'); return; }
    images.forEach(i => console.log(' ', i));
    return;
  }

  console.error('Unknown docker subcommand. Use: capture, diff, list');
  process.exit(1);
}

module.exports = { handleDockerCommand };
