import { FileType } from './constant.js';
import type { Context } from './clipanion.js';

namespace Convert {
  export namespace Style {
    export interface Ctx extends Context {
      toFrame: FileType;
      shouldVueGen: boolean;
    }
  }
}

export type StyleCtx = Convert.Style.Ctx;
