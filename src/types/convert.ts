import type { Context } from './clipanion.js';

export namespace Style {
  export interface Ctx extends Context {
    addFind_Result: () => void; // 在vistor中处理结果
  }
}
