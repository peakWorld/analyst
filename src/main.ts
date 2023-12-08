#!/usr/bin/env node

import { Cli, Builtins } from 'clipanion';
import StashCommand from './stash/index.js';
import TrashCommand from './trash/index.js';
import DevViteCommand from './dev-vite/index.js';

const [node, app, ...args] = process.argv;

const cli = new Cli({
  binaryName: `sable`,
  binaryLabel: `命令行工具`,
  binaryVersion: `0.0.1`,
});
cli.register(Builtins.HelpCommand);
cli.register(StashCommand);
cli.register(TrashCommand);
cli.register(DevViteCommand);
cli.runExit(args);
