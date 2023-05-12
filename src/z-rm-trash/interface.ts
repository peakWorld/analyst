// import type { Visitor } from '@babel/core';
import { AstProjectOptions } from '../interface.js';

export interface CommandOptions {
  entry: string;
}

export interface FileConfig {
  alias: Record<string, string>;
  entry: string;
  aliasBase: string;
  visitor: PickValue<AstProjectOptions, 'visitor'>;
}

export interface MainOptions extends AstProjectOptions {
  entry: string;
}
