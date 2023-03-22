import * as config from './config.js';

import fs from 'fs';
import path2 from 'path';
import * as babel from '@babel/core';
import traverse from '@babel/traverse';
import * as t from '@babel/types';
// import generator from '@babel/generator'
// import template from "@babel/template";
import compiler from 'vue-template-compiler';
import { getAbsFilePath, checkFileSuffix } from './file.js';
import getRoute, { getVisitor } from './route.js';

// 在使用中文件
const usedFiles = new Set<string>();
const routes = getRoute(); // 路由映射
// 文件间的加载关系, 树形
const relations = new Map<string, Set<string>>();
// 满足查询条件的文件
const appears = new Set<string>();

const findText = '';

function getDependanceList(entry: string) {
  const data = fs.readFileSync(entry);
  let entry_str = data.toString();
  if (entry.endsWith('vue')) {
    const result = compiler.parseComponent(entry_str);
    const { script, template } = result;

    if (findText && template?.content?.includes(findText)) {
      console.log('findText', findText);
      appears.add(entry);
    }

    if (script && script.content) {
      entry_str = script.content.trim();
    } else {
      entry_str = '';
    }
  }
  if (!entry_str) {
    return;
  }
  const ast = babel.parseSync(
    entry_str,
    config.AST_CONFIG as babel.TransformOptions,
  );
  const dirPath = path2.dirname(entry);
  let set = relations.get(entry);
  if (!set) {
    set = new Set();
    relations.set(entry, set);
  }
  let visitor: babel.Visitor = {
    ImportDeclaration(path) {
      const { value } = path.node.source;
      if (checkFileSuffix(value)) {
        // 校验文件后缀
        const absPath = getAbsFilePath(dirPath, value);
        if (absPath) {
          set.add(absPath);
          if (!usedFiles.has(absPath)) {
            usedFiles.add(absPath);
            getDependanceList(absPath);
          }
        }
      }
    },
    ObjectProperty(path) {
      const { node } = path;
      if (t.isIdentifier(node.key) && node.key.name === 'message') {
        path.traverse({
          StringLiteral(path) {
            const { value } = path.node;
            if (
              /.*\/contact\/get(Risk)?Excel$/.test(value) ||
              /\/file\//.test(value)
            ) {
              appears.add(entry);
            }
          },
        });
      }
    },
    Identifier(path) {
      if (t.isIdentifier(path.node, { name: 'xxxxxxxxxx' })) {
        appears.add(entry);
      }
    },
  };
  if (entry === config.ROUTE_PATH) {
    // 路由处理
    const routeVisitor = getVisitor((absPath) => {
      if (absPath) {
        set.add(absPath);
        if (!usedFiles.has(absPath)) {
          usedFiles.add(absPath);
          getDependanceList(absPath);
        }
      }
    });
    visitor = { ...visitor, ...routeVisitor };
  }
  traverse.default(ast, visitor);
}
getDependanceList(config.ENTRY_PATH);

const res = {};
// 树的广度优先搜索
(() => {
  function checkFile(file: string) {
    const used = new Set();
    let stack = [file];
    while (stack.length) {
      const tmp = stack.shift();
      if (used.has(tmp)) {
        // 排除循环执行
        continue;
      }
      used.add(tmp);
      if (appears.has(tmp)) {
        return true;
      }
      const fileSet = relations.get(tmp);
      if (fileSet && fileSet.size) {
        stack = [...new Set([...stack, ...fileSet])];
      }
    }
    return false;
  }

  routes.forEach((route, file) => {
    const checked = checkFile(file);
    if (checked) {
      res[route] = file;
    }
  });
})();
