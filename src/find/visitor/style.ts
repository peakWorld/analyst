import { clearQuotes, getAbsUrlInAst } from '../../utils/index.js';
import type { PluginCreator, ProcessOptions } from 'postcss';
import type { Ctx } from '../interface.js';
import type StyleParser from '../../core/bases/parsers/style.js';

export default (search: string) => (ctx: Ctx, parser: StyleParser) => {
  const mul = search.split(',');

  // 可用规则位于 postcss.d.ts => Processors
  const plugin: PluginCreator<ProcessOptions> = () => ({
    postcssPlugin: 'postcss-find',
    AtRule: {
      import(rule) {
        if (!rule.params) return;
        const urls = getAbsUrlInAst(ctx, clearQuotes(rule.params), true);
        urls.forEach((url) => ctx.addR_Pending(url));
      },
    },
    OnceExit() {
      if (mul.find((it) => parser.source.includes(it))) {
        return ctx.addFind_Result();
      }
    },
  });
  plugin.postcss = true;
  return plugin;
};
