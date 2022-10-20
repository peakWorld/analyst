import * as config from './config.js';

import fs from 'fs';
import path2 from 'path';
import * as babel from '@babel/core';
import traverse from '@babel/traverse';
import * as t from '@babel/types';
// import generator from '@babel/generator'
// import template from "@babel/template";
import compiler from 'vue-template-compiler';
import { getAbsFilePath, checkFileSuffix } from './utils/file.js';
import getRoute, { getVisitor } from './core/route.js';
import { saveToCache } from './utils/cache.js';

const usedFiles = new Set<string>(); // 在使用中文件
const routes = getRoute(); // 路由映射
const map = new Map<string, Set<string>>(); // 文件间的加载关系, 树形
const appear = new Set<string>(); // 满足查询条件的文件

function getDependanceList(entry: string) {
  const data = fs.readFileSync(entry);
  let entry_str = data.toString();
  if (entry.endsWith('vue')) {
    const { script } = compiler.parseComponent(entry_str);
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

  let set = map.get(entry);
  if (!set) {
    set = new Set();
    map.set(entry, set);
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
    Identifier(path) {
      if (
        t.isIdentifier(path.node, { name: 'areaCodeArr' }) ||
        t.isIdentifier(path.node, { name: 'CommunitySelect' })
      ) {
        appear.add(entry);
      }
      // if (t.isIdentifier(path.node, { name: 'getAddrSuggestions' })) {
      //   appear.add(entry)
      // }
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

// saveToCache(`routes.json`, [...routes.keys()])
// saveToCache('appear.json', [...appear])
// saveToCache('map.json', [...map.keys()].reduce((res, k) => {
//   const v = map.get(k)
//   if (v && v.size) {
//     res[k] =  [...v]
//   }
//   return res
// }, {}))

const res = new Set();
(() => {
  function checkFile(file: string) {
    let used = new Set();
    let stack = [file];
    while (stack.length) {
      const tmp = stack.shift();
      if (used.has(tmp)) {
        // 排除循环执行
        continue;
      }
      used.add(tmp);
      if (appear.has(tmp)) {
        return true;
      }
      const fileSet = map.get(tmp);
      if (fileSet && fileSet.size) {
        stack = [...new Set([...stack, ...fileSet])];
      }
    }
    return false;
  }

  routes.forEach((route, file) => {
    const checked = checkFile(file);
    if (checked) {
      res.add(route);
    }
  });
})();

saveToCache('res.json', [...res]);
