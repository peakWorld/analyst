import { Command, Option } from 'clipanion';
import type { Context } from '../../types/clipanion.js';
import Logger from '../log.js';

export default class BaseCommand extends Command<Context> {
  verbose = Option.Boolean('-v,--verbose', false, {
    description: '输出详细日志',
  });

  setup(commandKey: string) {
    this.context.logger = new Logger(this.context, commandKey);
    this.context.logger.verbose = this.verbose;
  }

  async execute() {
    // DO NOTHINGS
  }

  async catch(error: any) {
    console.log('error', error);
  }
}
