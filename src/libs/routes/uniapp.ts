/**
 * Uniapp全局配置文档 https://zh.uniapp.dcloud.io/collocation/pages.html#easycom
 */
import path from 'node:path';
import BaseRoute from '../bases/route.js';
import {
  readFileToExcuteJs,
  readFileToJson,
  replaceAlias,
} from '../../utils/index.js';
import { RouteHandlerType } from '../../types/clipanion.js';

export interface UniappConfig {
  easycom: {
    custom: Record<string, string>;
  };
  pages: Array<{ path: string }>;
  subPackages: Array<{
    root: string;
    pages: Array<{ path: string }>;
  }>;
}

export default class UniappRoute extends BaseRoute {
  private original!: UniappConfig; // 原始路由配置

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
    const jsFunc = await readFileToExcuteJs(jsFileUrl, false);
    const json = await readFileToJson(jsonFileUrl);
    this.original = jsFunc(json);
  }

  // uniapp 特殊配置
  async resolveEasycom() {
    const { easycom } = this.original;
    easycom?.custom?._forEach((v, k) => {
      const absUrl = replaceAlias(this.alias, v);
      if (!absUrl) return;

      const handler = (...matches: string[]) => {
        matches.forEach((match, i) => {
          v = v.replace(`$${i + 1}`, match);
        });
        return v;
      };
      this.ctx.handlers.push({
        regex: new RegExp(`${k}`),
        type: RouteHandlerType.Tag,
        handler,
      });
    });
  }

  async resolvePages() {
    const { pages, subPackages } = this.original;
    const routeTmp = [];
    pages?.forEach((v) => routeTmp.push(v.path));
    subPackages?.forEach(({ root, pages }) => {
      pages?.forEach((v) => routeTmp.push(path.join(root, v.path)));
    });
    // routeTmp.forEach((v) => {});
    console.log('macthExt', this.macthExt);
  }

  async resolveOther() {}

  async getRoutes() {
    await this.resolveEasycom();
    await this.resolvePages();
    await this.resolveOther();
    return this.routes;
  }
}
