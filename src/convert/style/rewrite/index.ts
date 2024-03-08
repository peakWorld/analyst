import reVue2Parser from './vue2.js';
import reStyleParser from './style.js';
import type { StyleCtx } from '../../../types/convert.js';

export default async (ctx: StyleCtx) => {
  await reVue2Parser(ctx);
  await reStyleParser(ctx);
};
