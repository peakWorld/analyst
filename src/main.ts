import * as config from './config.js'

import fs from 'fs'
import path2 from 'path'
import * as babel from '@babel/core';
import traverse from '@babel/traverse'
import * as t from '@babel/types';
// import generator from '@babel/generator'
// import template from "@babel/template";
import compiler from 'vue-template-compiler'
import { getAbsFilePath, checkFileSuffix } from './utils/file.js'
import getRoute, { getVisitor } from './core/route.js'
import { saveToCache } from './utils/cache.js'

const usedFiles = new Set<string>() // 在使用中文件
const routes = getRoute() // 路由映射
const map = new Map<string, Set<string>>() // 文件间的加载关系
const appear = new Set<string>()  // 满足查询条件的文件

function getDependanceList(entry: string) {
  const data = fs.readFileSync(entry)
  let entry_str = data.toString();
  if (entry.endsWith('vue')) {
    const { script } = compiler.parseComponent(entry_str)
    if (script && script.content) {
      entry_str = script.content.trim()
    } else {
      entry_str = ''
    }
  }
  if (!entry_str) {
    return
  }
  const ast = babel.parseSync(entry_str, config.AST_CONFIG as babel.TransformOptions)
  const dirPath = path2.dirname(entry)

  let visitor: babel.Visitor = {
    ImportDeclaration(path) {
      const { value } = path.node.source
      if (checkFileSuffix(value)) { // 校验文件后缀
        const absPath = getAbsFilePath(dirPath, value)
        if (!map.has(absPath)) {
          map.set(absPath, new Set(entry))
        } else {
          const mset = map.get(absPath)
          mset.add(entry)
        }

        if (absPath && !usedFiles.has(absPath)) {
          usedFiles.add(absPath)
          getDependanceList(absPath)
        }
      }
    },
    Identifier(path) {
      if (t.isIdentifier(path.node, { name: 'areaCodeArr' }) || t.isIdentifier(path.node, { name: 'CommunitySelect' })) {
        appear.add(entry)
      }
    }
  }
  if (entry === config.ROUTE_PATH) { // 路由处理
    const routeVisitor = getVisitor(
      (absPath) => {
        if (absPath && !usedFiles.has(absPath)) {
          usedFiles.add(absPath)
          getDependanceList(absPath)
        }
      }
    )
    visitor = { ...visitor, ...routeVisitor }
  }
  traverse.default(ast, visitor)
}

getDependanceList(config.ENTRY_PATH)

// saveToCache(`routes.json`, routes)
// saveToCache('usedFiles.json', [...usedFiles])
saveToCache('appear.json', [...appear])

const res = new Set();
(() => {
  [...appear].map((appearFile) => {
    if (routes.has(appearFile)) {
      res.add(routes.get(appearFile))
    } else {
      loop(appearFile)
    }
  })

  function loop(file: string) {
    if (map.has(file)) {
      const pp = map.get(file)
      pp.forEach((item) => {
        if (routes.has(item)) {
          res.add(routes.get(item))
        } else {
          loop(item)
        }
      })
    }
  }
})()

console.log([...res])
