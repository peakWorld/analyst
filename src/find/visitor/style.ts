import type { PluginCreator, ProcessOptions } from 'postcss';
import type { Ctx } from '../../types/find.js';
import type StyleParser from '../../core/bases/parsers/style.js';

export default (search: string) => (ctx: Ctx, parser: StyleParser) => {
  const mul = search.split(',');

  const plugin: PluginCreator<ProcessOptions> = () => ({
    postcssPlugin: 'postcss-find',
    OnceExit() {
      if (mul.find((it) => parser.source.includes(it))) {
        return ctx.addFind_Result();
      }
    },
  });
  plugin.postcss = true;
  return plugin;
};
