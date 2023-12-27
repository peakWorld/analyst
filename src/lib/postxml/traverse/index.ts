import { Visitor, Context } from './type.js';
import { AstNode } from '../parser/type.js';

export function traverse(node: AstNode, visitor: Visitor, context?: Context) {
  if (!context) {
    context = {
      currentNode: node,
      childIndex: 0,
      parent: null,
    };
  }

  const k = node.type === 'Root' ? 'once' : node.type;
  visitor[k] && visitor[k](context.currentNode, context);

  if (!context.currentNode) return;

  if (node.type === 'Element') {
    const children = node.children;
    if (children.length) {
      for (let i = 0; i < children.length; i++) {
        context.parent = context.currentNode;
        context.childIndex = i;
        traverse(children[i], visitor, context);
      }
    }
  }

  const exit = node.type === 'Root' ? 'onceExit' : `${node.type}Exit`;
  visitor[exit] && visitor[exit](context.currentNode, context);
}
