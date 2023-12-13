#!/usr/bin/env node
import './libs/extends.js';

import { Cli, Builtins } from 'clipanion';
import StashCommand from './stash/command.js';
import TrashCommand from './trash/command.js';
import DevViteCommand from './dev-vite/command.js';
import FindCommand from './find/command.js';

const [node, app, ...args] = process.argv;

const cli = new Cli({
  binaryName: `sable`,
  binaryLabel: `命令行工具: ${node} ${app}`,
  binaryVersion: `0.0.1`,
});
cli.register(Builtins.HelpCommand);
cli.register(FindCommand);
cli.register(StashCommand);
cli.register(TrashCommand);
cli.register(DevViteCommand);
cli.runExit(args);
