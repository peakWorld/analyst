import type { PluginCreator, ProcessOptions } from 'postcss';
import type { Style } from '../../../types/convert.js';
import type StyleParser from '../../../core/bases/parsers/style.js';

// 将less的专属规则转成scss规则
export default (ctx: Style.Ctx, parser: StyleParser) => {
  const plugin: PluginCreator<ProcessOptions> = () => ({
    postcssPlugin: 'postcss-convert-style/scss',
    AtRule: {
      import(rule) {
        // rule.params = rule.params.replace(`.${type}`, `.${ctx.toFrame}`);
      },
    },
  });
  plugin.postcss = true;
  return plugin;
};
