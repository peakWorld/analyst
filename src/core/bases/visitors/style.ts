import { clearQuotes, getAbsUrlInAst } from '../../../utils/index.js';
import type { PluginCreator, ProcessOptions } from 'postcss';
import type { Context } from '../../../types/clipanion.js';

export default (ctx: Context) => {
  // 可用规则位于 postcss.d.ts => Processors
  const plugin: PluginCreator<ProcessOptions> = () => ({
    postcssPlugin: 'postcss-base',
    AtRule: {
      import(rule) {
        if (!rule.params) return;
        const urls = getAbsUrlInAst(ctx, clearQuotes(rule.params), true);
        urls.forEach((url) => ctx.addR_Pending(url));
      },
    },
  });
  plugin.postcss = true;
  return plugin;
};
