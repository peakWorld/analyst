import type { PluginCreator, ProcessOptions } from 'postcss';
import type { Style } from '../../../types/convert.js';
import type StyleParser from '../../../core/bases/parsers/style.js';

export default (ctx: Style.Ctx, parser: StyleParser) => {
  const plugin: PluginCreator<ProcessOptions> = () => ({
    postcssPlugin: 'postcss-convert-style',
    OnceExit() {
      // if (mul.find((it) => parser.source.includes(it))) {
      //   return ctx.addFind_Result();
      // }
    },
  });
  plugin.postcss = true;
  return plugin;
};
