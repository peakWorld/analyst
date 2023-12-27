import { parse } from './parser/index.js';
import { traverse } from './traverse/index.js';
export type { Visitor } from './traverse/type.js';
export type { Node, AstNode, ParserOptions, RootNode } from './parser/type.js';

export { parse, traverse };

// Test
// const nodes = parse(
//   `<div id="foo" :val="aa" @click="func" v-show="display">{{ a + 1 }}</div>`,
// );
// console.log(nodes.children[0]);
