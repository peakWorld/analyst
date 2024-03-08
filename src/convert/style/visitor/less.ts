import type { PluginCreator, ProcessOptions } from 'postcss';
import type { StyleCtx } from '../../../types/convert.js';
import type StyleParser from '../../../core/bases/parsers/style.js';
// import { saveDataToTmpJsonFile } from '../../../utils/index.js';

// 将less的专属规则转成scss规则
export default (ctx: StyleCtx, parser: StyleParser) => {
  const { type } = parser.originalOptions;

  const plugin: PluginCreator<ProcessOptions> = () => ({
    postcssPlugin: 'postcss-convert/less2scss',
    AtRule: {
      import(rule) {
        rule.params = rule.params.replace(`.${type}`, `.${ctx.toFrame}`);
      },
    },
    Once() {
      // saveDataToTmpJsonFile(root, 'root-less');
    },
  });
  plugin.postcss = true;
  return plugin;
};
