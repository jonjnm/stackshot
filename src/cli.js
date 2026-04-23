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
const { handleTerraformCommand } = require('./cli-terraform');
const { handlePerlCommand } = require('./cli-perl');
const { handleElixirCommand } = require('./cli-elixir');
const { handleSwiftCommand } = require('./cli-swift');
const { handleScalaCommand } = require('./cli-scala');
const { handleLuaCommand } = require('./cli-lua');
const { handleHaskellCommand } = require('./cli-haskell');
const { handleRCommand } = require('./cli-r');
const { handleJuliaCommand } = require('./cli-julia');
const { handleCondaCommand } = require('./cli-conda');
const { handleFlutterCommand } = require('./cli-flutter');
const { handleAnsibleCommand } = require('./cli-ansible');
const { handleVagrantCommand } = require('./cli-vagrant');
const { handleRedisCommand } = require('./cli-redis');
const { handlePostgresCommand } = require('./cli-postgres');
const { handleMysqlCommand } = require('./cli-mysql');
const { handleMongoCommand } = require('./cli-mongodb');
const { handleNginxCommand } = require('./cli-nginx');
const { handleApacheCommand } = require('./cli-apache');

function printUsage() {
  console.log(`
stackshot — snapshot and restore local dev environment configs

Usage:
  stackshot <module> <subcommand> [options]

Modules:
  env, tools, brew, git, vscode, ssh, shell, npm, docker,
  python, ruby, go, rust, java, php, dotnet, kotlin, terraform,
  perl, elixir, swift, scala, lua, haskell, r, julia, conda,
  flutter, ansible, vagrant, redis, postgres, mysql, mongo,
  nginx, apache

Subcommands (per module):
  capture <snapshot>   capture current state into a snapshot
  diff <s1> <s2>       diff two snapshots
  show                 show current state
  `);
}

function parseKV(str) {
  const [key, ...rest] = str.split('=');
  return { key, value: rest.join('=') };
}

async function main() {
  const [,, module, ...args] = process.argv;
  if (!module || module === '--help' || module === '-h') {
    printUsage();
    return;
  }
  const handlers = {
    env: handleEnvCommand, tools: handleToolsCommand, brew: handleBrewCommand,
    git: handleGitCommand, vscode: handleVSCodeCommand, ssh: handleSshCommand,
    shell: handleShellCommand, npm: handleNpmCommand, docker: handleDockerCommand,
    python: handlePythonCommand, ruby: handleRubyCommand, go: handleGoCommand,
    rust: handleRustCommand, java: handleJavaCommand, php: handlePhpCommand,
    dotnet: handleDotnetCommand, kotlin: handleKotlinCommand, terraform: handleTerraformCommand,
    perl: handlePerlCommand, elixir: handleElixirCommand, swift: handleSwiftCommand,
    scala: handleScalaCommand, lua: handleLuaCommand, haskell: handleHaskellCommand,
    r: handleRCommand, julia: handleJuliaCommand, conda: handleCondaCommand,
    flutter: handleFlutterCommand, ansible: handleAnsibleCommand, vagrant: handleVagrantCommand,
    redis: handleRedisCommand, postgres: handlePostgresCommand, mysql: handleMysqlCommand,
    mongo: handleMongoCommand, nginx: handleNginxCommand, apache: handleApacheCommand
  };
  const handler = handlers[module];
  if (!handler) {
    console.error(`unknown module: ${module}`);
    printUsage();
    process.exit(1);
  }
  await handler(args);
}

main().catch(err => { console.error(err.message); process.exit(1); });

module.exports = { printUsage, parseKV };
