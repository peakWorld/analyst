import fs from 'fs-extra';
import * as glob from 'glob';
import { Context, MigrateMeta, TransARUrl } from './interface.js';
import {
  isString,
  isArray,
  isSet,
  getMatchAlias,
  getAbsFileUrl,
  getPendingSuffix,
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

  transfromAliasOrRelativeUrl(params: TransARUrl) {
    const {
      url: aliasOrRelativeUrl,
      originUrl,
      useGlob = false, // 是否开启glob寻找文件
      checkDeps = false, // 是否过滤项目依赖
    } = params;

    const { context } = this;
    const { dirUrl, alias, aliasMap, aliasBase, deps, migrates, migrate } =
      context;
    let rsp = [];

    if (!aliasOrRelativeUrl) return rsp;

    // 检查项目依赖、且aliasOrRelativeUrl是项目依赖
    if (
      checkDeps &&
      deps.some(
        (it) => it === aliasOrRelativeUrl || aliasOrRelativeUrl.startsWith(it),
      )
    )
      return rsp;

    let tmpUrl = '';
    let matchAlias = '';

    // 别名 @/xx
    if (alias.some((it) => aliasOrRelativeUrl.includes(it))) {
      matchAlias = getMatchAlias(aliasOrRelativeUrl, aliasMap, aliasBase);
      tmpUrl = aliasOrRelativeUrl.replace(matchAlias, aliasMap[matchAlias]);
    } else {
      // 相对路径 ./xx ; 相对于dir得出绝对路径
      tmpUrl = getAbsFileUrl(aliasOrRelativeUrl, dirUrl);
    }
    const isShouldGlob = useGlob && /\*/.test(tmpUrl);

    // tmpUrl glob匹配模式
    if (isShouldGlob) {
      const globUrls = glob.globSync(tmpUrl);
      if (!globUrls?.length) return rsp;
      rsp = globUrls;
    } else {
      // 缺少文件后缀
      const suffix = getPendingSuffix(tmpUrl);
      rsp.push(`${tmpUrl}${suffix}`);
    }

    // 此时, rsp中的元素都是完整的路径

    // 需要迁移文件, 只有alias别名才迁移
    if (Object.keys(migrate).length && matchAlias) {
      const migrateItem = migrate[matchAlias];
      // 迁移配置中包含该别名
      if (migrateItem) {
        const { to, dirname } = migrateItem;
        const fromDir = aliasMap[matchAlias];
        const fromAlias = isShouldGlob ? originUrl : aliasOrRelativeUrl;
        const toAlias = fromAlias.replace(matchAlias, to);

        rsp.forEach((it) => {
          const meta: MigrateMeta = {
            fromAlias,
            toAlias,
            toFileUrl: it.replace(fromDir, dirname),
          };
          migrates.set(it, meta);
        });
      }
    }

    return rsp;
  }

  useRegGetRequireImgUrl(str: string) {
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

  useRegGetImgUrl(str: string) {
    const regex = /url(.*)/g;
    const matches = str.match(regex);
    const urls = [];
    matches?.forEach((match) => {
      let url = match.replace(/^url\(['"]?/, '').replace(/['"]?\)[\s\S]*$/, '');
      // 不处理网络请求地址 或 base64
      if (url.includes('http') || url.startsWith('data:')) return;
      // 图片带有参数
      if (/\..*?.*/.test(url)) {
        url = url.split('?')[0];
      }
      urls.push(url);
    });
    return urls;
  }
}
