import type { PluginCreator, ProcessOptions } from 'postcss';
import type { Style } from '../../../types/convert.js';
import type StyleParser from '../../../core/bases/parsers/style.js';
import { saveDataToTmpJsonFile } from '../../../utils/index.js';

// 将less的专属规则转成scss规则
export default (ctx: Style.Ctx, parser: StyleParser) => {
  const { type } = parser.originalOptions;

  const plugin: PluginCreator<ProcessOptions> = () => ({
    postcssPlugin: 'postcss-convert-style/less',
    AtRule: {
      import(rule) {
        rule.params = rule.params.replace(`.${type}`, `.${ctx.toFrame}`);
      },
      '*'(rule) {
        console.log('atrule', rule.name);
      },
    },
    Once(root) {
      // saveDataToTmpJsonFile(root, 'root-less');
    },
  });
  plugin.postcss = true;
  return plugin;
};
