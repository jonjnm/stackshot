const { handleEnvCommand } = require('./cli-env');
const { handleToolsCommand } = require('./cli-tools');
const { handleBrewCommand } = require('./cli-brew');
const { handleGitCommand } = require('./cli-git');
const { handleVSCodeCommand } = require('./cli-vscode');
const { handleSshCommand } = require('./cli-ssh');
const { handleShellCommand } = require('./cli-shell');
const { handleNpmCommand } = require('./npm-cli');
const { handleDockerCommand } = require('./cli-docker');
const { handlePythonCommand } = require('./cli-python');
const { handleRubyCommand } = require('./cli-ruby');
const { handleGoCommand } = require('./cli-golang');
const { handleRustCommand } = require('./cli-rust');
const { handleJavaCommand } = require('./cli-java');
const { handlePhpCommand } = require('./cli-php');
const { handleDotnetCommand } = require('./cli-dotnet');
const { handleKotlinCommand } = require('./cli-kotlin');

function printUsage() {
  console.log(`stackshot <command> [subcommand] [options]

Commands:
  env       Manage environment variables
  tools     Manage tool versions
  brew      Manage Homebrew packages
  git       Manage git config
  vscode    Manage VS Code extensions/settings
  ssh       Manage SSH keys/config
  shell     Manage shell aliases/config
  npm       Manage npm config
  docker    Manage Docker images/containers
  python    Manage Python/pip
  ruby      Manage Ruby/gems
  go        Manage Go packages
  rust      Manage Rust/cargo
  java      Manage Java/maven
  php       Manage PHP/composer
  dotnet    Manage .NET/nuget
  kotlin    Manage Kotlin/gradle
`);
}

function parseKV(str) {
  const idx = str.indexOf('=');
  if (idx === -1) return null;
  return { key: str.slice(0, idx), value: str.slice(idx + 1) };
}

async function main() {
  const [,, command, ...args] = process.argv;
  if (!command || command === '--help' || command === '-h') { printUsage(); return; }
  switch (command) {
    case 'env':    return handleEnvCommand(args);
    case 'tools':  return handleToolsCommand(args);
    case 'brew':   return handleBrewCommand(args);
    case 'git':    return handleGitCommand(args);
    case 'vscode': return handleVSCodeCommand(args);
    case 'ssh':    return handleSshCommand(args);
    case 'shell':  return handleShellCommand(args);
    case 'npm':    return handleNpmCommand(args);
    case 'docker': return handleDockerCommand(args);
    case 'python': return handlePythonCommand(args);
    case 'ruby':   return handleRubyCommand(args);
    case 'go':     return handleGoCommand(args);
    case 'rust':   return handleRustCommand(args);
    case 'java':   return handleJavaCommand(args);
    case 'php':    return handlePhpCommand(args);
    case 'dotnet': return handleDotnetCommand(args);
    case 'kotlin': return handleKotlinCommand(args);
    default:
      console.error(`Unknown command: ${command}`);
      printUsage();
      process.exit(1);
  }
}

main().catch(e => { console.error(e.message); process.exit(1); });

module.exports = { printUsage, parseKV };
