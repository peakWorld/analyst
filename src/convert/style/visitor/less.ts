import type { PluginCreator, ProcessOptions } from 'postcss';
import type { StyleCtx } from '../../../types/convert.js';
import type StyleParser from '../../../core/bases/parsers/style.js';
// import { saveDataToTmpJsonFile } from '../../../utils/index.js';

// 将less的专属规则转成scss规则
export default (ctx: StyleCtx, parser: StyleParser) => {
  const { type } = parser.originalOptions;

  function handleInterp(val: string) {
    const match = /@{(.*)}/.exec(val);
    if (match?.[1]) {
      return val.replace(/@{/g, '#{').replace(match[1], `$${match[1]}`);
    }
    return val;
  }

  const plugin: PluginCreator<ProcessOptions> = () => ({
    postcssPlugin: 'postcss-convert/less2scss',
    AtRule: {
      import(rule) {
        rule.params = rule.params.replace(`.${type}`, `.${ctx.toFrame}`); // 修改文件名
      },
      '*'(rule, { AtRule, Declaration }) {
        // 转换mixin
        if (rule.mixin) {
          const atule = new AtRule({
            name: 'include',
            params: `${rule.name}${rule.params}`,
          });
          rule.replaceWith(atule);

          ctx.rules.mixins.add(rule.name); // 用于判断rule是否为mixin声明
        }
        // 转换variable
        if (rule.variable) {
          const { name, params } = rule;
          const decl = new Declaration({
            prop: `$${name}`,
            value: params.replace(/@/g, '$'),
          });
          rule.replaceWith(decl);
        }
      },
    },
    Rule(rule, { AtRule }) {
      // 处理插值
      rule.selector = handleInterp(rule.selector);

      // 处理mixin语句
      {
        const match = /[.#](.*)\(/.exec(rule.selector);
        if (match?.[1] && ctx.rules.mixins.has(match[1])) {
          const rules2 = new AtRule({
            name: 'mixin',
            params: rule.selector.slice(1).replace(/@/g, '$'),
          });
          rules2.append(rule.nodes);
          rule.replaceWith(rules2);
        }
      }
    },
    Declaration(rule) {
      // 处理插值
      rule.prop = handleInterp(rule.prop);
      rule.value = handleInterp(rule.value);

      // 处理变量
      if (rule.value.includes('@')) {
        rule.value = rule.value.replace(/@/g, '$');
      }
    },
    Once() {
      // saveDataToTmpJsonFile(root, 'root-less');
    },
  });
  plugin.postcss = true;
  return plugin;
};
