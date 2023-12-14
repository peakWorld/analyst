import { Command, Option } from 'clipanion';
import type { Context, CommandKey } from '../../types/clipanion.js';
import Logger from '../log.js';

export default abstract class BaseCommand extends Command<Context> {
  verbose = Option.Boolean('-v,--verbose', false, {
    description: '输出详细日志',
  });

  setup(key: CommandKey) {
    this.context.logger = new Logger(this.context, key);
    this.context.logger.verbose = this.verbose;
    this.context.key = key;
  }
}
