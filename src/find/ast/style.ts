import type { PluginCreator, ProcessOptions } from 'postcss';
import type { Context } from '../../types/clipanion.js';

export default (text: string) => (ctx: Context) => {
  const plugin: PluginCreator<ProcessOptions> = () => ({
    postcssPlugin: 'postcss-find',
    Once() {
      console.log('OnceExit..');
    },
    AtRule() {
      console.log('AtRule..');
    },
  });
  plugin.postcss = true;
  return plugin;
};
