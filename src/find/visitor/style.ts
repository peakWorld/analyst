import type { PluginCreator, ProcessOptions } from 'postcss';
import type { Ctx } from '../interface.js';
import { saveDataToTmpJsonFile } from '../../utils/index.js';

export default (search: string) => (ctx: Ctx) => {
  const mul = search.split(',');

  // 可用规则位于 postcss.d.ts => Processors
  const plugin: PluginCreator<ProcessOptions> = () => ({
    postcssPlugin: 'postcss-find',
    AtRule: {
      import(rule) {
        console.log('import', rule.toString());
      },
      '*'(rule) {
        saveDataToTmpJsonFile(rule, 'AtRule');
        // console.log('*', rule.toString());
      },
    },
    Declaration(decl) {
      saveDataToTmpJsonFile(decl, 'decl');
      // console.log('decl', decl);
    },
    Rule(rule) {
      saveDataToTmpJsonFile(rule, 'rule');
    },
  });
  plugin.postcss = true;
  return plugin;
};
