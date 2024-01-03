import type { Context } from '../types/clipanion.js';

export interface Ctx extends Context {
  addFind_Result: () => void; // 在vistor中处理结果
}
