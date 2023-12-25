import fs from 'fs-extra';
import {
  space,
  wkName,
  setRoute,
  getWkPkgJson,
  readFileToExcuteJs,
  getVersion,
  loadDynamicModule,
  getAbsByAliasInCss,
  getAbsHasExt,
  t,
} from '../../utils/index.js';
import type { SableConfigs, ResolvedFrame } from '../../types/libs.js';
import type { Context } from '../../types/clipanion.js';
import type { IBaseRoute } from './route.js';

export default class BaseHandler {
  private commandConfigs!: SableConfigs;

  protected pkgJson!: PackageJson;

  private async loadCommandConfigFile() {
    this.ctx.logger.log(`Loading Command Configs!`);
    // 读取项目相关配置
    const sourceUrl = getAbsHasExt(`.cache/${this.ctx.key.toLowerCase()}.ts`);
    const destUrl = getAbsHasExt(`.cache/${wkName}.ts`, space);
    const templateUrl = getAbsHasExt(`.cache/template.ts`, space);

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

  private async resolveCommandConfig() {
    if (!this.commandConfigs) return;

    this.ctx.logger.log(`Resolving Command Configs!`);

    const { entry, styles } = this.commandConfigs;

    const alias = await this.resolveAlias();
    const frames = await this.resolveFrame();
    const { routes, handlers } = await this.resolveRoute(frames, alias);

    this.ctx.configs = {
      entry: entry?.map((v) => getAbsHasExt(v)) ?? [],
      alias,
      frames,
      handlers,
      routes,
    };

    // 处理全局样式文件
    styles?.forEach((v) => {
      this.ctx.configs.entry.push(getAbsByAliasInCss(alias, v));
    });

    this.ctx.logger.log(`Resolved Command Configs!`, this.ctx.configs);
  }

  private async resolveAlias() {
    const { alias } = this.commandConfigs;
    return alias._map<typeof alias>((v) => getAbsHasExt(v));
  }

  private async resolveFrame(): Promise<Partial<ResolvedFrame>> {
    const commadnFrames = this.commandConfigs.frames;
    const { dependencies, devDependencies } = this.pkgJson;
    const deps = dependencies.merge_([devDependencies]);
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
      routes._forEach((v, k) => resolved.push(setRoute(v, k)));
      return { routes: resolved, handlers: [] };
    }

    let moduleKey = 'default';
    if (frames.uniapp) {
      moduleKey = 'uniapp';
    }
    const Router = await loadDynamicModule<IBaseRoute>(
      `../libs/routes/${moduleKey}.js`,
      true,
    );
    const router = new Router(this.ctx, alias, frames);
    await router.setup(routes.map((v) => getAbsHasExt(v)));
    return await router.getRoutesAndHandlers();
  }

  private extendCtx() {
    this.ctx.appeared = new Set();
    this.ctx.current = {
      processing: '',
      loaded: false,
      pending: [],
      handled: new Set(),
    };
    this.ctx.setR_Now = (fileUrl) => {
      this.ctx.appeared.add(fileUrl);
      this.ctx.current.handled.add(fileUrl);
      this.ctx.current.processing = fileUrl;
      this.ctx.current.loaded = false;
    };
    this.ctx.addR_Pending = (fileUrl) => {
      const { pending } = this.ctx.current;
      if (pending.includes(fileUrl)) return;
      this.ctx.current.pending.push(fileUrl);
    };
    // this.ctx.getR_Processing = () => {
    //   if (!this.ctx.current.loaded) {
    //     this.ctx.current.loaded = true;
    //   }
    //   return this.ctx.current.processing;
    // };
    this.ctx.addRoute = (fileUrl: string, path?: string, extra?: AnyObj) => {
      const route = setRoute(fileUrl, path, extra);
      this.ctx.configs.routes.push(route);
    };
  }

  protected async initCommandConfigs() {
    await this.loadCommandConfigFile(); // 加载 command config文件
    await this.resolveCommandConfig(); // 解析 command config
  }

  constructor(protected ctx: Context) {
    this.ctx.logger.log(`Class Entity Created!`);
    this.pkgJson = getWkPkgJson();
    this.extendCtx();
  }

  async loop(fileUrl: string) {
    const { handled } = this.ctx.current;
    if (handled.has(fileUrl)) return;

    this.ctx.setR_Now(fileUrl);
  }
}
