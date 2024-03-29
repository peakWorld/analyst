import { FileType } from './constant.js';
import type { Context } from './clipanion.js';

export namespace Style {
  export interface Ctx extends Context {
    toFrame: FileType;
    shouldGen: boolean;
  }
}
