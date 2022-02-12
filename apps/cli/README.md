oclif-hello-world
=================

oclif example Hello World CLI

[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)
[![Version](https://img.shields.io/npm/v/oclif-hello-world.svg)](https://npmjs.org/package/oclif-hello-world)
[![CircleCI](https://circleci.com/gh/oclif/hello-world/tree/main.svg?style=shield)](https://circleci.com/gh/oclif/hello-world/tree/main)
[![Downloads/week](https://img.shields.io/npm/dw/oclif-hello-world.svg)](https://npmjs.org/package/oclif-hello-world)
[![License](https://img.shields.io/npm/l/oclif-hello-world.svg)](https://github.com/oclif/hello-world/blob/main/package.json)

<!-- toc -->
* [Usage](#usage)
* [Commands](#commands)
<!-- tocstop -->
# Usage
<!-- usage -->
```sh-session
$ npm install -g cli
$ degenz COMMAND
running command...
$ degenz (--version)
cli/0.0.0 darwin-arm64 node-v16.14.0
$ degenz --help [COMMAND]
USAGE
  $ degenz COMMAND
...
```
<!-- usagestop -->
# Commands
<!-- commands -->
* [`degenz hello PERSON`](#degenz-hello-person)
* [`degenz hello world`](#degenz-hello-world)
* [`degenz help [COMMAND]`](#degenz-help-command)
* [`degenz plugins`](#degenz-plugins)
* [`degenz plugins:inspect PLUGIN...`](#degenz-pluginsinspect-plugin)
* [`degenz plugins:install PLUGIN...`](#degenz-pluginsinstall-plugin)
* [`degenz plugins:link PLUGIN`](#degenz-pluginslink-plugin)
* [`degenz plugins:uninstall PLUGIN...`](#degenz-pluginsuninstall-plugin)
* [`degenz plugins update`](#degenz-plugins-update)

## `degenz hello PERSON`

Say hello

```
USAGE
  $ degenz hello [PERSON] -f <value>

ARGUMENTS
  PERSON  Person to say hello to

FLAGS
  -f, --from=<value>  (required) Whom is saying hello

DESCRIPTION
  Say hello

EXAMPLES
  $ oex hello friend --from oclif
  hello friend from oclif! (./src/commands/hello/index.ts)
```

_See code: [dist/commands/hello/index.ts](https://github.com/JakeElder/hello-world/blob/v0.0.0/dist/commands/hello/index.ts)_

## `degenz hello world`

Say hello world

```
USAGE
  $ degenz hello world

DESCRIPTION
  Say hello world

EXAMPLES
  $ oex hello world
  hello world! (./src/commands/hello/world.ts)
```

## `degenz help [COMMAND]`

Display help for degenz.

```
USAGE
  $ degenz help [COMMAND] [-n]

ARGUMENTS
  COMMAND  Command to show help for.

FLAGS
  -n, --nested-commands  Include all nested commands in the output.

DESCRIPTION
  Display help for degenz.
```

_See code: [@oclif/plugin-help](https://github.com/oclif/plugin-help/blob/v5.1.11/src/commands/help.ts)_

## `degenz plugins`

List installed plugins.

```
USAGE
  $ degenz plugins [--core]

FLAGS
  --core  Show core plugins.

DESCRIPTION
  List installed plugins.

EXAMPLES
  $ degenz plugins
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v2.1.0/src/commands/plugins/index.ts)_

## `degenz plugins:inspect PLUGIN...`

Displays installation properties of a plugin.

```
USAGE
  $ degenz plugins:inspect PLUGIN...

ARGUMENTS
  PLUGIN  [default: .] Plugin to inspect.

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Displays installation properties of a plugin.

EXAMPLES
  $ degenz plugins:inspect myplugin
```

## `degenz plugins:install PLUGIN...`

Installs a plugin into the CLI.

```
USAGE
  $ degenz plugins:install PLUGIN...

ARGUMENTS
  PLUGIN  Plugin to install.

FLAGS
  -f, --force    Run yarn install with force flag.
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Installs a plugin into the CLI.

  Can be installed from npm or a git url.

  Installation of a user-installed plugin will override a core plugin.

  e.g. If you have a core plugin that has a 'hello' command, installing a user-installed plugin with a 'hello' command
  will override the core plugin implementation. This is useful if a user needs to update core plugin functionality in
  the CLI without the need to patch and update the whole CLI.

ALIASES
  $ degenz plugins add

EXAMPLES
  $ degenz plugins:install myplugin 

  $ degenz plugins:install https://github.com/someuser/someplugin

  $ degenz plugins:install someuser/someplugin
```

## `degenz plugins:link PLUGIN`

Links a plugin into the CLI for development.

```
USAGE
  $ degenz plugins:link PLUGIN

ARGUMENTS
  PATH  [default: .] path to plugin

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Links a plugin into the CLI for development.

  Installation of a linked plugin will override a user-installed or core plugin.

  e.g. If you have a user-installed or core plugin that has a 'hello' command, installing a linked plugin with a 'hello'
  command will override the user-installed or core plugin implementation. This is useful for development work.

EXAMPLES
  $ degenz plugins:link myplugin
```

## `degenz plugins:uninstall PLUGIN...`

Removes a plugin from the CLI.

```
USAGE
  $ degenz plugins:uninstall PLUGIN...

ARGUMENTS
  PLUGIN  plugin to uninstall

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Removes a plugin from the CLI.

ALIASES
  $ degenz plugins unlink
  $ degenz plugins remove
```

## `degenz plugins update`

Update installed plugins.

```
USAGE
  $ degenz plugins update [-h] [-v]

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Update installed plugins.
```
<!-- commandsstop -->
