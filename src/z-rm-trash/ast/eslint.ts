import { ESLint } from 'eslint';
import { cwd } from '../../utils/index.js';

export const eslintHtml = async (html: string) => {
  const eslint = new ESLint({ cwd });

  const [xx] = await eslint.lintText(html);

  console.log('code', html, xx);
};
