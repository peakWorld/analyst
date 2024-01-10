import * as t from '@babel/types';
import { getAbsUrlInAst } from '../../utils/index.js';
import type { Visitor } from '@babel/core';
import type { Ctx } from '../../types/find.js';
import type JsParser from '../../core/bases/parsers/js.js';

export default (search: string) => (ctx: Ctx, parser: JsParser) => {
  const mul = search.split(',');

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
    exit({ node }) {
      if (t.isProgram(node)) {
        if (mul.find((it) => parser.source.includes(it))) {
          return ctx.addFind_Result();
        }
      }
    },
  };
  return visitor;
};
