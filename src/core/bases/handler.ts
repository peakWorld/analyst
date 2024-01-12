import fs from 'fs-extra';
import _ from 'lodash';
import {
  space,
  wkName,
  setRoute,
  getWkPkgJson,
  readFileToExcuteJs,
  getVersion,
  loadDynamicModule,
  getAbsByAliasInCss,
  getAbsByRelative,
  t,
} from '../../utils/index.js';
import { FileType } from '../../types/constant.js';
import { expand } from './context.js';
import type { SableConfigs, ResolvedFrame } from '../../types/libs.js';
import type { Context } from '../../types/clipanion.js';
import type { IBaseRoute } from './route.js';

@expand
export default class BaseHandler {
  protected commandConfigs!: SableConfigs;

  protected pkgJson!: PackageJson;

  private async loadCommandConfigFile() {
    this.ctx.logger.log(`Loading Command Configs!`);
    // 读取项目相关配置
    const sourceUrl = getAbsByRelative(`.himly.ts`);
    const destUrl = getAbsByRelative(`.cache/${wkName}.ts`, space);
    const templateUrl = getAbsByRelative(`.cache/template.ts`, space);

    // 如果项目不存在该配置文件, 将模板拷贝到当前项目
    if (!fs.existsSync(sourceUrl)) {
      return fs.copySync(templateUrl, sourceUrl);
    }
    // 如果项目存在该配置文件, 则缓存到.cache文件夹
    fs.copySync(sourceUrl, destUrl);
    // 读取该配置文件(必须esm)
    const getConfigs = await readFileToExcuteJs(sourceUrl);
    const configs = await (typeof getConfigs === 'function'
      ? getConfigs(this.ctx)
      : getConfigs);
    this.commandConfigs = configs;

    this.ctx.logger.log('Loaded Command Configs', this.commandConfigs);
  }

  private async resolveCommandConfig() {
    if (!this.commandConfigs) return;

    this.ctx.logger.log(`Resolving Command Configs!`);

    const { entry, styles } = this.commandConfigs;

    const alias = await this.resolveAlias();
    const frames = await this.resolveFrame();
    const { routes, handlers } = await this.resolveRoute(frames, alias);

    this.ctx.configs = {
      entry: entry?.map((v) => getAbsByRelative(v)) ?? [],
      alias,
      frames,
      handlers,
      routes,
    };

    // 处理全局样式文件
    styles?.forEach((v) => {
      this.ctx.configs.entry.push(getAbsByAliasInCss(alias, v));
    });

    this.ctx.logger.log(`Resolved Command Configs`, this.ctx.configs);
  }

  private async resolveAlias() {
    const { alias } = this.commandConfigs;
    return _.mapValues(alias, (v) => getAbsByRelative(v));
  }

  private async resolveFrame(): Promise<Partial<ResolvedFrame>> {
    const commadnFrames = this.commandConfigs.frames;
    const { dependencies, devDependencies } = this.pkgJson;
    const deps = _.assign({}, dependencies, devDependencies);
    const frames = {} as ResolvedFrame;
    if (deps.vue) {
      const v = getVersion(deps.vue);
      frames[`vue${v}`] = true;
    }
    return {
      ...frames,
      react: !!deps.react,
      uniapp: commadnFrames.includes('uniapp'),
      less: !!(deps.less || deps['less-loader']),
      scss: !!(deps.sass || deps['sass-loader']),
    };
  }

  private async resolveRoute(
    frames: Partial<ResolvedFrame>,
    alias: Record<string, string>,
  ) {
    const { routes } = this.commandConfigs;
    // if (t.isObject(route)) return route; // TODO is关键字未生效?
    // 对象处理
    if (!t.isArray(routes)) {
      const resolved = [];
      _.forOwn(routes, (v, k) => resolved.push(setRoute(v, k)));
      return { routes: resolved, handlers: [] };
    }

    let moduleKey = 'default';
    if (frames.uniapp) {
      moduleKey = 'uniapp';
    }
    const Router = await loadDynamicModule<IBaseRoute>(
      `../core/routes/${moduleKey}.js`,
      true,
    );
    const router = new Router(this.ctx, alias, frames);
    await router.setup(routes.map((v) => getAbsByRelative(v)));
    return await router.getRoutesAndHandlers();
  }

  protected async initCommandConfigs() {
    await this.loadCommandConfigFile(); // 加载 command config文件
    await this.resolveCommandConfig(); // 解析 command config
  }

  protected async handleEntries() {
    const { entry: entries } = this.ctx.configs;
    for (let entry of entries) {
      await this.handler(entry, entry);
    }
  }

  protected async handleRoutes() {
    const { routes } = this.ctx.configs;
    for (let route of routes) {
      await this.handler(route.fileUrl, route.path);
    }
  }

  constructor(protected ctx: Context) {
    this.ctx.logger.log(`Class Entity Created!`);
    this.pkgJson = getWkPkgJson();
  }

  async handler(fileUrl: string, path?: string) {
    const {
      visitors,
      current,
      configs,
      parsers,
      needA_Gen,
      needA_Parse,
      addA_Pending,
      setA_Current,
    } = this.ctx;
    const { handled, pending } = current;
    addA_Pending(fileUrl);

    while (pending.length) {
      fileUrl = pending.shift();
      if (!fileUrl || handled.has(fileUrl) || !needA_Parse(fileUrl)) continue;
      this.ctx.logger.log(fileUrl);

      const { type } = setA_Current(fileUrl, path);
      switch (type) {
        case FileType.Css:
        case FileType.Less:
        case FileType.Scss:
          {
            const parser = new parsers.style(this.ctx, { type });
            await parser.traverse(visitors[type]);
            if (needA_Gen(type)) await parser.generate();
          }
          break;
        case FileType.Js:
        case FileType.Ts:
          {
            const parser = new parsers.js(this.ctx, { type });
            visitors[type].forEach((visitor) => parser.traverse(visitor));
            if (needA_Gen(type)) await parser.generate();
          }
          break;
        case FileType.Vue:
          if (configs.frames?.vue2) {
            const parser = new parsers.vue2(this.ctx, fileUrl);
            await parser.setup();
            if (needA_Gen(type)) await parser.generate();
          }
          break;

        default:
        // TODO NOTHING
      }
    }

    this.ctx.restA_Current();
  }
}
