import type { Visitor } from 'vue-template-compiler';
import type { Context } from '../../types/clipanion.js';

export default (search: string) => (ctx: Context) => {
  const visitor: Visitor = {
    once() {
      console.log('once...');
    },
    Element(node) {
      console.log('Element...', node.tag);
    },
    onceExit() {
      console.log('onceExit...');
    },
  };
  return visitor;
};
