import { BaseContext } from 'clipanion';
import Logger from '../libs/log.js';

export interface Context extends BaseContext {
  logger: Logger;
}
