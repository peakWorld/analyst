import { FileType } from './constant.js';
import type { Context } from './clipanion.js';

namespace Convert {
  export namespace Style {
    interface Rules {
      mixins: Set<string>;
    }

    export interface Ctx extends Context {
      toFrame: FileType; // 转换的文件类型
      shouldVueGen: boolean; // vue文件是否需要重新生成
      rules: Rules; // postcss中的规则
    }
  }
}

export type StyleCtx = Convert.Style.Ctx;
