import { Command, Option } from 'clipanion';
import Logger from '../log.js';
import type { Context } from '../../types/clipanion.js';
import type { CommandKey } from '../../types/constant.js';

export default abstract class BaseCommand<
  T extends Context = Context,
> extends Command<T> {
  verbose = Option.Boolean('-v,--verbose', false, {
    description: '输出详细日志',
  });

  setup(key: CommandKey) {
    this.context.logger = new Logger(this.context, key);
    this.context.logger.verbose = this.verbose;
    this.context.key = key;
  }
}
