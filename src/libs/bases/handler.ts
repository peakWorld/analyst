import path from 'node:path';
import fs from 'fs-extra';
import {
  wkspace,
  space,
  wkName,
  getWkPkgJson,
  readFileToExcuteJs,
  getVersion,
  loadDynamicModule,
  replaceAliasCss,
  t,
} from '../../utils/index.js';
import type {
  SableConfigs,
  SableResolvedConfigs,
  ResolvedFrame,
} from '../../types/libs.js';
import type { Context } from '../../types/clipanion.js';
import type { IBaseRoute } from './route.js';

export default class BaseHandler {
  private commandConfigs!: SableConfigs;

  protected pkgJson!: PackageJson;

  constructor(private ctx: Context, private fileName: string) {
    this.ctx.logger.log(`Class Entity Created!`);
    this.pkgJson = getWkPkgJson();
    this.ctx.appeared = new Set();
    this.ctx.handlers = [];
  }

  async initCommandConfigs() {
    await this.loadCommandConfigFile(); // 加载 command config文件
    await this.resolveCommandConfig(); // 解析 command config
  }

  protected async loadCommandConfigFile() {
    this.ctx.logger.log(`Loading Command Configs!`);
    // 读取项目相关配置
    const sourceUrl = path.join(
      wkspace,
      '.cache',
      `${this.fileName.toLowerCase()}.ts`,
    );
    const destUrl = path.join(space, '.cache', `${wkName}.ts`);
    const templateUrl = path.join(space, '.cache', 'template.ts');

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

    this.ctx.logger.log('Loaded Command Configs：', this.commandConfigs);
  }

  protected async resolveCommandConfig() {
    this.ctx.logger.log(`Resolving Command Configs!`);
    const { entry, css: globalCss } = this.commandConfigs;

    const alias = await this.resolveAlias();
    const frame = await this.resolveFrame();

    const configs: SableResolvedConfigs = {
      alias,
      frame,
      entry: entry?.map((v) => fs.realpathSync(v)) ?? [],
      route: await this.resolveRoute(frame, alias),
    };

    this.ctx.configs = configs;

    // 处理全局样式文件
    globalCss?.forEach((v) => {
      this.ctx.appeared.add(replaceAliasCss(alias, v));
    });

    this.ctx.logger.log(`Resolved Command Configs!`, configs);
  }

  protected async resolveAlias() {
    const { alias } = this.commandConfigs;
    return alias._map<typeof alias>((v) => fs.realpathSync(v));
  }

  protected async resolveFrame(): Promise<ResolvedFrame> {
    const commadnFrame = this.commandConfigs.frame;
    const { dependencies, devDependencies } = this.pkgJson;
    const deps = dependencies.merge_([devDependencies]);
    const frame = {} as ResolvedFrame;
    if (deps.vue) {
      const v = getVersion(deps.vue);
      frame[`vue${v}`] = true;
    }
    return {
      ...frame,
      react: !!deps.react,
      uniapp: commadnFrame.includes('uniapp'),
      less: !!(deps.less || deps['less-loader']),
      scss: !!(deps.sass || deps['sass-loader']),
    };
  }

  protected async resolveRoute(
    frame: ResolvedFrame,
    alias: Record<string, string>,
  ) {
    const { route } = this.commandConfigs;
    // if (t.isObject(route)) return route; // is关键字未生效? TODO
    if (!t.isArray(route)) return route; // 对象直接返回

    let moduleKey = 'default';
    if (frame.uniapp) {
      moduleKey = 'uniapp';
    }
    const Router = await loadDynamicModule<IBaseRoute>(
      `../libs/routes/${moduleKey}.js`,
      true,
    );
    const router = new Router(this.ctx, alias, frame);
    await router.setup(route.map((v) => fs.realpathSync(v)));
    return await router.getRoutes();
  }
}
