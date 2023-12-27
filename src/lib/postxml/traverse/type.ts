import {
  Element,
  Attribute,
  Text,
  Interpolation,
  RootNode,
  AstNode,
} from '../parser/type.js';

export interface Context {
  currentNode: AstNode;
  childIndex: number;
  parent: AstNode;
}

export interface Visitor {
  once?: (node: RootNode, ctx: Context) => void;
  Element?: (node: Element, ctx: Context) => void;
  Attribute?: (node: Attribute, ctx: Context) => void;
  Text?: (node: Text, ctx: Context) => void;
  Interpolation?: (node: Interpolation, ctx: Context) => void;

  onceExit?: (node: RootNode, ctx: Context) => void;
  ElementExit?: (node: Element, ctx: Context) => void;
  AttributeExit?: (node: Attribute, ctx: Context) => void;
  TextExit?: (node: Text, ctx: Context) => void;
  InterpolationExit?: (node: Interpolation, ctx: Context) => void;
}
