# stackshot

> CLI tool to snapshot and restore local dev environment configs across machines

## Installation

```bash
npm install -g stackshot
```

## Usage

Capture your current dev environment config:

```bash
stackshot save my-setup
```

Restore it on another machine:

```bash
stackshot restore my-setup
```

List all saved snapshots:

```bash
stackshot list
```

Snapshots can include dotfiles, shell aliases, environment variables, and tool versions (Node, Python, etc.). Configs are stored locally or can be synced via a remote source.

### Example workflow

```bash
# On your work machine
stackshot save work-env --include dotfiles,nvmrc,.env.example

# On your personal machine
stackshot restore work-env
```

## Options

| Flag | Description |
|------|-------------|
| `--include` | Comma-separated list of config types to snapshot |
| `--output` | Path to save snapshot file |
| `--dry-run` | Preview changes without applying them |

## Contributing

Pull requests are welcome. For major changes, please open an issue first.

## License

[MIT](LICENSE)