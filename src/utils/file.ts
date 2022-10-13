import path from 'path'
import fs from 'fs'
import * as config from '../config.js'

export function getAbsFilePath(dirPath: string, filePath: string) {
  let absPath = ''
  if (/^\.+/.test(filePath)) { // 相对路径
    absPath = path.resolve(dirPath, filePath)
  } else {
    absPath = doAliasPath(filePath) // alias
  }
  return absPath ? getImportFileSuffix(absPath) : null
}

function getPathWithSuffix (path: string, suffixes = config.EXT) {
  // 判断文件添加后缀是否存在
  const suffix = suffixes.filter((suffix) => fs.existsSync(`${path}${suffix}`))
  // 返回存在的文件路径
  return suffix ? `${path}${suffix[0]}` : null
}

export function getImportFileSuffix(path: string) {
  if (fs.existsSync(path)) { // 路径存在 /xxx/abc | /xxx/abc.js
    const stat = fs.lstatSync(path)
    return stat.isDirectory() ? getPathWithSuffix(`${path}/index`) : path
  } else { // 路径不存在, 没有文件后缀 /xxx/abc/index
    return getPathWithSuffix(path)
  }
}

export function doAliasPath(val: string) {
  let absPath = ''
  if (val.startsWith('@')) {
    absPath = path.resolve(config.SRC_PATH, val.replace('@/', ''))
  }
  return absPath
}

export function checkFileSuffix(value: string) {
  const { ext } = path.parse(value)
  if (!ext) return true // 没有后缀, 都需要处理
  return config.EXT.some(item => ext === item) // 有后缀, 判断是否满足配置
}
