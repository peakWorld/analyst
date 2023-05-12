import * as T from '@babel/types';
import * as babel from '@babel/core';
import type Ast from '../../src/ast/index';

export default () => {
  return {
    alias: {
      '@': 'src',
    },
    entry: 'src/main.ts',
    visitor: (t: typeof T, ast: Ast, fileUrl: string) => {
      // 只处理路由文件 中动态路由
      if (!fileUrl || !fileUrl.includes('routers/router.ts')) return;

      return new Promise((resolve) => {
        const visitor: babel.Visitor = {};
        const dyImports = new Set<string>();
        const temp = new Set<string>();
        const transKey = 'xxx';

        let routeMapArr: string[] = []; // 存储routeMap对象的值

        function onBeforeExit() {
          routeMapArr.forEach((k) => {
            temp.forEach((tk) => {
              const dyimport = tk
                .replace('${' + transKey + '}', k)
                .replace(/`/g, '');
              dyImports.add(dyimport);
            });
          });
          resolve(Array.from(dyImports));
        }

        visitor.VariableDeclarator = (path) => {
          const { node } = path;
          if (
            t.isIdentifier(node.id, { name: 'routeMap' }) &&
            t.isObjectExpression(node.init)
          ) {
            node.init.properties?.forEach((it) => {
              if (!t.isObjectProperty(it)) return;
              if (t.isStringLiteral(it.value)) {
                routeMapArr.push(it.value.value);
              }
            });
          }
        };

        visitor.CallExpression = (path) => {
          if (t.isImport(path.node.callee)) {
            const arg0 = path.node.arguments[0];
            // import('xxx')
            if (t.isStringLiteral(arg0)) {
              dyImports.add(arg0.value);
            }
            // import(`xx${a}xx`)
            if (t.isTemplateLiteral(arg0)) {
              arg0.expressions[0] = t.identifier(transKey);
              temp.add(ast.generate(arg0).code);
            }
          }
        };

        visitor.exit = (node) => {
          if (t.isProgram(node)) {
            onBeforeExit();
          }
        };

        ast.run(visitor);
      });
    },
  };
};
