declare module 'vue-template-compiler' {
  export interface ParserOptions {}

  export interface ASTRoot {
    type: 0;
    children: ASTNode[];
  }

  export interface Ctx {
    currentNode: Node;
    parent: Node;
    childIndex: number;
  }

  export type Node = ASTRoot | ASTNode;

  export interface Visitor {
    once?: (node: ASTRoot, ctx: Ctx) => void;
    Text?: (node: ASTText, ctx: Ctx) => void;
    Expression?: (node: ASTExpression, ctx: Ctx) => void;
    Element?: (node: ASTElement, ctx: Ctx) => void;

    onceExit?: (node: ASTRoot, ctx: Ctx) => void;
    TextExit?: (node: ASTText, ctx: Ctx) => void;
    ExpressionExit?: (node: ASTExpression, ctx: Ctx) => void;
    ElementExit?: (node: ASTElement, ctx: Ctx) => void;
  }
}
