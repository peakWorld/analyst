import type { PluginCreator, ProcessOptions } from 'postcss';
import type { Context } from '../../types/clipanion.js';

export default (text: string) => (ctx: Context) => {
  const plugin: PluginCreator<ProcessOptions> = () => ({
    postcssPlugin: 'postcss-find',
    Once(root) {
      console.log('OnceExit..');
    },
    AtRule: {
      import(rule) {
        console.log('import', rule.toString());
      },
      // '*'(rule) {
      //   console.log('*', rule.toString());
      // },
    },
  });
  plugin.postcss = true;
  return plugin;
};
