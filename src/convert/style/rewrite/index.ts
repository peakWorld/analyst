import reVue2Parser from './vue2.js';
import reStyleParser from './style.js';
import type { Style } from '../../../types/convert.js';

export default async (ctx: Style.Ctx) => {
  await reVue2Parser(ctx);
  await reStyleParser(ctx);
};
