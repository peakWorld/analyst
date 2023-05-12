import * as babel from '@babel/core';
import * as t from '@babel/types';
import Ast, { GET_AST_CONFIG } from '../index.js';
// import { saveToTmpFile } from '../../utils/file.js';

export interface Option {
  searchText: string;
  codestr: string;
}

export default (option: Option) => {
  const { searchText, codestr } = option;
  const AST_CONFIG = GET_AST_CONFIG();
  AST_CONFIG.configFile = false;
  const ast = new Ast(codestr, AST_CONFIG);

  return new Promise<Record<string, string>>((resolve) => {
    const visitor: babel.Visitor = {};
    const aliasObj: Record<string, string> = {};

    function onBeforeExit() {
      resolve(aliasObj);
    }

    visitor.ObjectProperty = (path) => {
      const { node } = path;
      if (t.isIdentifier(node.key) && node.key.name === searchText) {
        // 尝试方法不行
        // 1、使用generator将ast转成字符串代码 ` generator.default(node.value).code`
        // 2、利用node vm模块/eval函数 将字符串转成js代码
        // Hack
        if (t.isObjectExpression(node.value)) {
          node.value.properties?.forEach((it) => {
            if (!t.isObjectProperty(it)) return;
            const { key, value } = it;
            let keyStr = '';
            let valStr = '';
            if (t.isStringLiteral(key)) {
              keyStr = key.value;
            }
            if (t.isCallExpression(value)) {
              valStr = value.arguments
                .map((it) => {
                  if (t.isStringLiteral(it)) return it.value;
                  return '';
                })
                .join('');
            }
            aliasObj[keyStr] = valStr;
          });
        }
        // saveToTmpFile('vue-vite.json', node);
      }
    };

    visitor.exit = (node) => {
      if (t.isProgram(node)) {
        onBeforeExit();
      }
    };

    ast.run(visitor);
  });
};
