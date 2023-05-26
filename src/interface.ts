export interface Package {
  dependencies: Record<string, string>;
  devDependencies: Record<string, string>;
  name: string;
}
