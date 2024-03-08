import type { PluginCreator, ProcessOptions } from 'postcss';
import type { StyleCtx } from '../../../types/convert.js';
import type StyleParser from '../../../core/bases/parsers/style.js';
import { saveDataToTmpJsonFile } from '../../../utils/index.js';

// 将less的专属规则转成scss规则
export default (ctx: StyleCtx, parser: StyleParser) => {
  const plugin: PluginCreator<ProcessOptions> = () => ({
    postcssPlugin: 'postcss-convert-style/scss',
    AtRule: {
      import() {
        // rule.params = rule.params.replace(`.${type}`, `.${ctx.toFrame}`);
      },
    },
    Once(root) {
      saveDataToTmpJsonFile(root, 'root-scss');
    },
  });
  plugin.postcss = true;
  return plugin;
};
