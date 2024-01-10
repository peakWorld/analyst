import * as t from '@babel/types';
import { getAbsUrlInAst } from '../../../utils/index.js';
import type { Visitor } from '@babel/core';
import type { Context } from '../../../types/clipanion.js';

export default (ctx: Context) => {
  const visitor: Visitor = {
    CallExpression({ node }) {
      if (
        t.isImport(node.callee) ||
        t.isIdentifier(node.callee, { name: 'require' })
      ) {
        node.arguments?.forEach((it) => {
          if (t.isStringLiteral(it)) {
            const urls = getAbsUrlInAst(ctx, it.value);
            urls.forEach((url) => ctx.addR_Pending(url));
          }
        });
      }
    },
    ImportDeclaration({ node }) {
      if (t.isStringLiteral(node.source)) {
        const urls = getAbsUrlInAst(ctx, node.source.value);
        urls.forEach((url) => ctx.addR_Pending(url));
      }
    },
  };
  return visitor;
};
