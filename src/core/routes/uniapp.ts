/**
 * Uniapp全局配置文档 https://zh.uniapp.dcloud.io/collocation/pages.html#easycom
 */
import path from 'node:path';
import _ from 'lodash';
import BaseRoute from '../bases/route.js';
import {
  readFileToExcuteJs,
  readFileToJson,
  getAbsByAlias,
  wkspace,
  getAbsByMatchExts,
  setRoute,
} from '../../utils/index.js';
import { MatchHandlerType } from '../../types/constant.js';

export interface UniappConfig {
  easycom?: {
    custom?: Record<string, string>;
  };
  pages: Array<{ path: string }>;
  subPackages: Array<{
    root: string;
    pages: Array<{ path: string }>;
  }>;
  globalStyle?: {
    usingComponents?: Record<string, string>;
  };
  tabBar?: {
    iconfontSrc?: string;
    list?: Array<{
      pagePath: string;
      iconPath: string;
      selectedIconPath: string;
    }>;
    midButton?: {
      iconPath: string;
      backgroundImage: string;
    };
  };
  topWindow?: {
    path: string;
  };
  leftWindow?: {
    path: string;
  };
  rightWindow?: {
    path: string;
  };
}

export default class UniappRoute extends BaseRoute {
  private original!: UniappConfig; // 原始路由配置

  // TODO src需要传入配置吗？
  // 绝对文件路径(无文件后缀、需要逐个匹配)
  private setAbsNoExt(v: string) {
    return path.join(wkspace, 'src', v);
  }

  async setup(urls: string[]) {
    let jsonFileUrl = '';
    let jsFileUrl = '';
    urls.forEach((url) => {
      if (url.endsWith('.json')) {
        jsonFileUrl = url;
      }
      if (url.endsWith('.js')) {
        jsFileUrl = url;
      }
    });
    // TODO 错误处理
    const jsFunc = await readFileToExcuteJs(jsFileUrl, false);
    const json = await readFileToJson(jsonFileUrl);
    this.original = jsFunc(json);
  }

  // uniapp 特殊配置
  async resolveEasycom() {
    _.forOwn(this.original?.easycom?.custom ?? {}, (v, k) => {
      const absUrl = getAbsByAlias(this.alias, v);
      if (!absUrl) return;

      this.handlers.push({
        type: MatchHandlerType.Tag,
        match: new RegExp(`${k}`),
        handler: (...matches: string[]) => {
          let tmpUrl = absUrl;
          matches?.forEach((match, i) => {
            tmpUrl = tmpUrl.replace(`$${i + 1}`, match);
          });
          return tmpUrl;
        },
      });
    });
  }

  async resolveOther() {
    // TODO 静态文件未处理

    // 微信原生组建
    _.forOwn(this.original?.globalStyle?.usingComponents ?? {}, () => {
      // TODO 微信原生开发解析
      // if (v.startsWith('/')) {
      //   v = v.slice(1);
      // }
      // const vTmp = this.setAbsUrl(v);
      // const absUrls = matchFileAbsUrlsInWx(vTmp, ['vue']);
    });

    // tabBar
    this.original?.tabBar?.list.forEach(({ pagePath: v }) => {
      const absUrl = getAbsByMatchExts(this.setAbsNoExt(v), this.macthExt)[0];
      if (!absUrl) throw new Error(`tabBar路径"${v}"没有找到对应入口文件`);
      this.routes.push(setRoute(absUrl, v));
    });

    // windows
    const windows = {
      topWindow: this.original?.topWindow?.path,
      leftWindow: this.original?.leftWindow?.path,
      rightWindow: this.original?.rightWindow?.path,
    };

    _.forOwn(windows, (v, k) => {
      if (!v) return;
      this.routes.push(
        setRoute(this.setAbsNoExt(v), undefined, { original: k }),
      );
    });
  }

  async resolvePages() {
    const { pages, subPackages } = this.original;
    const routeTmp = [];
    pages?.forEach((v) => routeTmp.push(v.path));
    subPackages?.forEach(({ root, pages }) => {
      pages?.forEach((v) => routeTmp.push(path.join(root, v.path)));
    });
    routeTmp.forEach((v) => {
      const absUrl = getAbsByMatchExts(this.setAbsNoExt(v), this.macthExt)[0];
      if (!absUrl) throw new Error(`路由"${v}"没有找到对应入口文件`);
      this.routes.push(setRoute(absUrl, v));
    });
  }

  async getRoutesAndHandlers() {
    await this.resolveEasycom();
    await this.resolveOther();
    await this.resolvePages();

    return {
      routes: this.routes,
      handlers: this.handlers,
    };
  }
}
