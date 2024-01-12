import type { Context } from './clipanion.js';

export interface Ctx extends Context {
  addFind_Result: (k: string) => void; // 在vistor中处理结果
}
