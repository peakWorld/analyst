import compiler, {
  ASTNode,
  ASTText,
  ASTExpression,
  ASTElement,
} from 'vue-template-compiler';

export interface Visitor {
  Text?: (node: ASTText) => void;
  Expression?: (node: ASTExpression) => void;
  Element?: (node: ASTElement) => void;

  Div?: (node: ASTElement) => void;
  Image?: (node: ASTElement) => void;

  enter?: (node: ASTNode) => void;
  exit?: (node: ASTNode) => void;
}

export default class TemplateAst {
  private ast!: ASTNode;

  private visitor!: Visitor;

  code_str!: string;

  constructor(code_str: string) {
    this.ast = this.addRoot(compiler.compile(code_str).ast);
  }

  run(visitor: Visitor) {
    this.visitor = visitor;
    this.traverse(this.ast);
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

  private traverse(node: ASTNode) {
    const { enter, exit, Element, Expression, Text, Div, Image } = this.visitor;

    enter && enter(node);

    if (node.type === 1) {
      switch (node.tag) {
        case 'div':
          Div && Div(node);
          break;
        case 'img':
          Image && Image(node);
          break;
      }
      // 标签
      Element && Element(node);
      if (node.children) {
        node.children.forEach((it) => this.traverse(it));
      }
    } else if (node.type === 2) {
      // 语句
      Expression && Expression(node);
    } else if (node.type === 3) {
      // 文本
      Text && Text(node);
    }

    exit && exit(node);
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
