/**
 * Uniapp全局配置文档 https://zh.uniapp.dcloud.io/collocation/pages.html#easycom
 */
import path from 'node:path';
import BaseRoute from '../bases/route.js';
import {
  readFileToExcuteJs,
  readFileToJson,
  replaceAlias,
  wkspace,
  matchFileAbsUrls,
} from '../../utils/index.js';
import { MatchHandlerType } from '../../types/clipanion.js';

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

  private setAbsUrl(v: string) {
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
    this.original?.easycom?.custom?._forEach((v, k) => {
      const absUrl = replaceAlias(this.alias, v);
      if (!absUrl) return;
      this.handlers.push({
        type: MatchHandlerType.Tag,
        match: new RegExp(`${k}`),
        handler: (...matches: string[]) => {
          matches?.forEach((match, i) => {
            v = v.replace(`$${i + 1}`, match);
          });
          return v;
        },
      });
    });
  }

  async resolveOther() {
    // TODO 静态文件未处理

    // 微信原生组建
    this.original?.globalStyle?.usingComponents?._forEach((v) => {
      // TODO 微信原生开发解析
      // if (v.startsWith('/')) {
      //   v = v.slice(1);
      // }
      // const vTmp = this.setAbsUrl(v);
      // const absUrls = matchFileAbsUrlsInWx(vTmp, ['vue']);
    });

    // tabBar
    this.original?.tabBar?.list.forEach(({ pagePath: v }) => {
      const absUrl = matchFileAbsUrls(this.setAbsUrl(v), this.macthExt)[0];
      if (!absUrl) throw new Error(`tabBar路径"${v}"没有找到对应入口文件`);
      this.routes[v] = absUrl;
    });

    // windows
    const windows = {
      topWindow: this.original?.topWindow?.path,
      leftWindow: this.original?.leftWindow?.path,
      rightWindow: this.original?.rightWindow?.path,
    };
    windows._forEach((v, k) => {
      if (!v) return;
      this.routes[`virtual:uniapp-${k}`] = this.setAbsUrl(v);
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
      const absUrl = matchFileAbsUrls(this.setAbsUrl(v), this.macthExt)[0];
      if (!absUrl) throw new Error(`路由"${v}"没有找到对应入口文件`);
      this.routes[v] = absUrl;
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
