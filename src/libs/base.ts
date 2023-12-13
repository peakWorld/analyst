import path from 'node:path';
import fs from 'fs-extra';
import {
  wkspace,
  space,
  wkName,
  getWkPkgJson,
  readFileToExcuteJs,
  getVersion,
  replaceAlias,
  loadDynamicModule,
  t,
} from '../utils/index.js';
import type {
  SableConfigs,
  SableResolvedConfigs,
  ResolvedFrame,
  ResolvedCss,
} from '../types/libs.js';
import type { Context } from '../types/clipanion.js';
import type { IBaseRoute } from '../libs/routes/base.js';

export default abstract class Base {
  private commandConfigs!: SableConfigs;
  protected pkgJson = getWkPkgJson();
  protected configs = {} as SableResolvedConfigs;

  constructor(private ctx: Context, private clsName: string) {
    this.ctx.logger.log(`Class Entity Created!`);
  }

  protected async loadCommandConfigFile() {
    this.ctx.logger.log(`Loading Command Configs!`);
    // 读取项目相关配置
    const sourceUrl = path.join(
      wkspace,
      '.cache',
      `${this.clsName.toLowerCase()}.ts`,
    );
    const destUrl = path.join(space, '.cache', `${wkName}.ts`);
    const templateUrl = path.join(space, '.cache', 'template.ts');

    // 如果项目不存在该配置文件, 将模板拷贝到当前项目
    if (!fs.existsSync(sourceUrl)) {
      return fs.copySync(templateUrl, sourceUrl);
    }
    // 如果项目存在该配置文件, 则缓存到.cache文件夹
    fs.copySync(sourceUrl, destUrl);
    // 读取该配置文件
    const getConfigs = await readFileToExcuteJs(sourceUrl);
    const configs = await (typeof getConfigs === 'function'
      ? getConfigs(this.ctx)
      : getConfigs);
    this.commandConfigs = configs;
    this.ctx.logger.log('Loaded Command Configs：' /** this.commandConfigs */);
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
    };
  }

  protected async resolveAlias() {
    const { alias } = this.commandConfigs;
    return alias._map<typeof alias>((v) => path.join(wkspace, v));
  }

  protected async resolveCss(): Promise<ResolvedCss> {
    const { dependencies, devDependencies } = this.pkgJson;
    const deps = dependencies.merge_([devDependencies]);
    const globalCss = this.commandConfigs.css ?? [];
    const { alias } = this.configs;
    return {
      less: !!(deps.less || deps['less-loader']),
      scss: !!(deps.sass || deps['sass-loader']),
      global: globalCss.map((v) => {
        if (v.startsWith('~')) {
          v = v.slice(1);
        }
        return replaceAlias(alias, v);
      }),
    };
  }

  protected async resolveRoute() {
    const { route } = this.commandConfigs;
    if (t.isObject(route)) return route; // 对象直接返回; is关键字未生效? TODO

    const { frame } = this.configs;
    let moduleKey = 'default';
    if (frame.uniapp) {
      moduleKey = 'uniapp';
    }
    const GetRoute = await loadDynamicModule<IBaseRoute>(
      `../libs/routes/${moduleKey}.js`,
    );
    const router = new GetRoute(this.ctx).setup();
    return await router.getRoutes();
  }

  protected async resolveCommandConfig() {
    this.ctx.logger.log(`Resolving Command Configs!`);
    const entry = this.commandConfigs.entry ?? [];

    this.configs.alias = await this.resolveAlias();
    this.configs.frame = await this.resolveFrame();
    this.configs.css = await this.resolveCss();
    this.configs.route = await this.resolveRoute();
    this.configs.entry = entry.map((v) => path.join(wkspace, v));

    this.ctx.logger.log(`Resolved Command Configs!`, this.configs);
  }
}
