type RewriteArgv = [string, ...any]

export default class SableLog {

  private static isDebug = false

  static setUp() {
    ['log', 'warn', 'error'].forEach((md) => {
      console[md] = (...argv: any) => {
        this.rewrite.apply(this, [md, ...argv])
      }
    })
  }

  static rewrite(...argv: RewriteArgv) {
    // process.stdout.write(str)
    console.debug('rewrite2', ...argv)
    // TODO
  }

  static vlog() {
    if (!this.isDebug) return
    // TODO
  }
}

