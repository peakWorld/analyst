import fs from 'fs'
import path from 'path'
import * as babel from '@babel/core';
import traverse from '@babel/traverse'
import * as t from '@babel/types';
import * as config from '../config.js'
import { getAbsFilePath } from '../utils/file.js'
// import { saveToCache } from '../utils/cache.js'

const routes = new Map<string, string>()

interface Tick {
  (filePath: string, route: string): void
}

const dirPath = path.dirname(config.ROUTE_PATH)

export function getVisitor (tick?: Tick) {
  const Visitor: babel.Visitor = {
    ArrayExpression(path) {
      if (t.isVariableDeclarator(path.parent) && !t.isIdentifier(path.parent.id, { name: 'routes' })) {
        return
      }
      path.traverse({
        ObjectExpression(path) {
          const { properties } = path.node
          if (properties && properties.length) {
            let route = '';
            let filePath = '';
            (properties as babel.types.ObjectProperty[]).forEach((item) => {
              if (t.isIdentifier(item.key, { name: 'path' }) && t.isStringLiteral(item.value)) {
                route = item.value.value
              } else if (t.isIdentifier(item.key, { name: 'component' })) {
                if (t.isArrowFunctionExpression(item.value) && t.isCallExpression(item.value.body) && t.isStringLiteral(item.value.body.arguments[0])) {
                  filePath = item.value.body.arguments[0].value
                }
              }
            })
            if (filePath) {
              const absPath = getAbsFilePath(dirPath, filePath)
              if (absPath && route) {
                routes.set(absPath, route)
              }
              tick && tick(absPath, route)
            }
          }
        },
      })
    }
  }
  return Visitor
}

export default () => {
  const data = fs.readFileSync(config.ROUTE_PATH)
  const entry_str = data.toString();
  const ast = babel.parseSync(entry_str, config.AST_CONFIG as babel.TransformOptions)
  traverse.default(ast, getVisitor())
  return routes
}


