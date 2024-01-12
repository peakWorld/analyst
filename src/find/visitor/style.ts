import type { PluginCreator, ProcessOptions } from 'postcss';
import type { Ctx } from '../../types/find.js';
import type StyleParser from '../../core/bases/parsers/style.js';

export default (search: string) => (ctx: Ctx, parser: StyleParser) => {
  const mul = search.split(',');

  const plugin: PluginCreator<ProcessOptions> = () => ({
    postcssPlugin: 'postcss-find',
    OnceExit() {
      mul.forEach((it) => {
        if (parser.source.includes(it)) ctx.addFind_Result(it);
      });
    },
  });
  plugin.postcss = true;
  return plugin;
};
