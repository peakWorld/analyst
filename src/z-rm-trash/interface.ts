export interface CommandOptions {
  entryPath: string;
}

export interface Options {
  entry: string;
  deps: string[];
  aliasMap: Record<string, string>;
  alias: string[];
}
