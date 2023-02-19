import debug from 'debug';
import chalk from 'chalk';
// import ora from 'ora';
import { isObject, isError, isArray } from './type.js';
import { stringifyWithCircular } from './tools.js';

const rewriteConsoleKeys = ['warn', 'error'] as const;

type RewriteConsoleKeys = TupleToUnion<typeof rewriteConsoleKeys>

type RewriteParameters<T extends RewriteConsoleKeys> = Parameters<PickValue<Console, T>>;

export default class SableLog {

  constructor(private name: string) {
    // Hack: console.info 作为底层日志的输出
    this.setUp();
  }

  private argv2str<T extends RewriteConsoleKeys>(argv: RewriteParameters<T>) {
    return argv.map(arg => {
      if (isObject(arg)) return stringifyWithCircular(arg);
      if (isArray(arg)) return `[ ${(arg as Array<unknown>).join()} ]`;
      if (isError(arg)) return (arg as Error).stack;
      return arg;
    }).join(' ');
  }

  setUp() {
    const vDebug = debug(this.name);
    console.vlog = vDebug ?? console.log;

    rewriteConsoleKeys.forEach((md) => {
      console[md] = (...argv: RewriteParameters<RewriteConsoleKeys>) => {
        const str = this.argv2str<typeof md>(argv);
        this[md](str);
      };
    });
  }

  warn(...argv: RewriteParameters<'warn'>) {
    const warning = chalk.hex('#FFA500');
    console.log(warning(...argv));
  }

  error(...argv: RewriteParameters<'error'>) {
    const error = chalk.bold.red;
    console.log(error(...argv));
  }
}

