import compiler, {
  ASTNode,
  ASTText,
  ASTExpression,
  ASTElement,
} from 'vue-template-compiler';
import { upperFirstCase } from '../../../utils/index.js';

type VisitorFunc<T> = (
  node: T,
  context: TraverseContext,
) => void | (() => void);

export interface Visitor {
  Text?: VisitorFunc<ASTText>;
  Expression?: VisitorFunc<ASTExpression>;
  Element?: VisitorFunc<ASTElement>;

  Root?: VisitorFunc<ASTElement>;
  Div?: VisitorFunc<ASTElement>;
  Img?: VisitorFunc<ASTElement>;
}

export interface TraverseContext {
  currentNode: ASTNode | null;
  childIndex: number;
  parent: ASTNode | null;
  nodeTransforms: Array<VisitorFunc<ASTNode>>;
}

export interface GenContext {
  code: string;
  push: (code: string) => void;
}

export default class TemplateAst {
  private ast!: ASTElement;

  private visitor!: Visitor;

  code_str!: string;

  constructor(code_str: string) {
    const { ast } = compiler.compile(code_str);
    this.ast = this.addRoot(ast);
  }

  // 增加虚拟根节点
  private addRoot(ast: ASTElement) {
    return {
      type: 1,
      children: [ast],
      tag: 'root',
      attrsList: [],
      attrsMap: {},
      parent: '',
    } as unknown as ASTElement;
  }

  run(visitor: Visitor) {
    this.visitor = visitor;
    const context = {
      currentNode: null,
      childIndex: 0,
      parent: null,
      nodeTransforms: [
        this.transformElement.bind(this),
        this.transformExpression.bind(this),
        this.transformText.bind(this),
      ],
    };

    this.traverse(this.ast, context);
  }

  private transformElement(node: ASTNode, context: TraverseContext) {
    if (!this.isElement(node)) return;
    const func = this.visitor[upperFirstCase(node.tag)];
    if (!func) return;
    return func(node, context);
  }

  private transformExpression(node: ASTNode, context: TraverseContext) {
    if (!this.isExpression(node)) return;
    const func = this.visitor.Expression;
    if (!func) return;
    return func(node, context);
  }

  private transformText(node: ASTNode, context: TraverseContext) {
    if (!this.isText(node)) return;
    const func = this.visitor.Text;
    if (!func) return;
    return func(node, context);
  }

  private traverse(node: ASTNode, context: TraverseContext) {
    context.currentNode = node;
    const transforms = context.nodeTransforms;

    const exitFns = [];
    for (let i = 0; i < transforms.length; i++) {
      const onExit = transforms[i](context.currentNode, context);
      if (onExit) {
        exitFns.push(onExit);
      }
      if (!context.currentNode) return;
    }

    if (this.isElement(context.currentNode)) {
      const children = context.currentNode.children;
      if (children.length) {
        for (let i = 0; i < children.length; i++) {
          context.parent = context.currentNode;
          context.childIndex = i;
          this.traverse(children[i], context);
        }
      }
    }

    let i = exitFns.length;
    while (i--) {
      exitFns[i]();
    }
  }

  generate() {
    const context: GenContext = {
      code: '',
      push(code) {
        context.code += code;
      },
    };

    this.genNode(this.ast.children[0], context);

    console.log('code', context.code);
  }

  private genNode(node: ASTNode, context: GenContext) {
    if (this.isElement(node)) {
      context.push('<');
      context.push(node.tag);
      // 属性
      if (Object.keys(node.attrsMap).length) {
        Object.keys(node.attrsMap)?.forEach((k) => {
          const v = node.attrsMap[k];
          if (!v) {
            context.push(` ${k}`);
          } else {
            context.push(` ${k}="${v}"`);
          }
        });
      }
      if (!node.children.length) {
        context.push('/>');
      } else {
        context.push('>');
      }

      // 子节点
      if (node.children.length) {
        node.children.forEach((n) => this.genNode(n, context));
        context.push(`</${node.tag}>`);
      }
    }

    if (this.isText(node) || this.isExpression(node)) {
      context.push(node.text);
    }
  }

  isElement(node: ASTNode): node is ASTElement {
    return node.type === 1;
  }

  isExpression(node: ASTNode): node is ASTExpression {
    return node.type === 2;
  }

  isText(node: ASTNode): node is ASTText {
    return node.type === 3;
  }

  isRoot(node: ASTElement) {
    return node.tag === 'root';
  }
}
