/**
 * 主逻辑
 */
import { Options } from './interface.js';

export default class Main {
  constructor(private options: Options) {
    console.log('trash', this.options);
  }
}
