import * as babel from '@babel/core';
import * as t from '@babel/types';
import Ast from '../index.js';
import { saveToTmpFile } from '../../utils/file.js';

export interface Option {
  searchText: string;
}

export default (ast: Ast, option: Option) => {
  const { searchText } = option;

  return new Promise((resolve) => {
    const visitor: babel.Visitor = {};

    visitor.ObjectProperty = (path) => {
      const { node } = path;
      if (t.isIdentifier(node.key) && node.key.name === searchText) {
        saveToTmpFile('vue-vite.json', node);
      }

      // TODO resolve
      resolve('');
    };

    ast.run(visitor);
  });
};
