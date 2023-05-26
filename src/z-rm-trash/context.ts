import fs from 'fs-extra';
import * as glob from 'glob';
import { Context } from './interface.js';
import {
  isString,
  isArray,
  isSet,
  alias2AbsUrl,
  getAbsFileUrl,
  getIntegralPath,
  template2Glob,
} from '../utils/index.js';

type Mstring = MeetArr<string>;

export default class ContextUtils {
  constructor(private context: Context) {}

  private addUrl(url: Mstring, key: keyof Context) {
    const { context } = this;
    const contextItem = context[key];
    if (isSet(contextItem) && isString(url)) {
      contextItem.add(url);
    } else if (isArray(url)) {
      url.forEach((it) => this.addUrl(it, key));
    }
  }

  addStaticUrl(staticUrl: Mstring) {
    this.addUrl(staticUrl, 'statics');
  }

  addDynamicsUrl(dynamiUrl: Mstring) {
    this.addUrl(dynamiUrl, 'dynamics');
  }

  addParsedUrl(parsedUrl: Mstring) {
    this.addUrl(parsedUrl, 'parsed');
  }

  rewrite(fileUrl: string, data: string) {
    fs.writeFileSync(fileUrl, data);
  }

  transfromFileUrl(
    context: Context,
    fileUrls: Set<string>,
    useGlob = false, // 是否开启glob寻找文件
    checkDeps = false, // 是否过滤项目依赖
  ) {
    const { dirUrl, alias, aliasMap, aliasBase, deps } = context;
    const globRes = [];
    let res = [];
    fileUrls.forEach((fileUrl) => {
      // 项目依赖 tdesign || tdesign/**/*.css
      if (
        checkDeps &&
        deps.some((it) => it === fileUrl || fileUrl.startsWith(it))
      ) {
        return;
      }

      let tmpUrl = '';
      // 别名 @/xx
      if (alias.some((it) => fileUrl.includes(it))) {
        tmpUrl = alias2AbsUrl(fileUrl, aliasMap, aliasBase);
      } else {
        // 相对路径 ./xx ; 相对于dir得出绝对路径
        tmpUrl = getAbsFileUrl(fileUrl, dirUrl);
      }
      if (!tmpUrl) return;

      if (useGlob && /\*/.test(tmpUrl)) {
        globRes.push(tmpUrl);
      } else {
        res.push(tmpUrl);
      }
    });

    if (useGlob && globRes.length) {
      const tmpGlobRes = globRes.map((it) => glob.globSync(it));
      res = [...res, ...tmpGlobRes.flat()];
    }
    return res.map((it) => getIntegralPath(it));
  }

  useRegGetImgUrl(str: string) {
    const regex = /require(.*)/g;
    const matches = str.match(regex);
    if (matches) {
      return matches.map((match) => {
        // 模板字符串
        if (/\$/.test(match)) {
          match = match.replace(/\${[^$/]*}/g, '*');
          match = template2Glob(match);
        }
        // 字符串
        return match.replace(/^require\('?/, '').replace(/'?\)$/, '');
      });
    }
    return [];
  }
}
