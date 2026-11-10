import { pathToFileURL } from 'node:url';
import path from 'node:path';
import fs from 'node:fs';

const rootDir = process.cwd();
const packageMap = {
  '@universal/format-registry': path.join(rootDir, 'packages', 'format-registry', 'src', 'index.ts'),
  '@universal/job-contracts': path.join(rootDir, 'packages', 'job-contracts', 'src', 'index.ts'),
  '@universal/conversion-core': path.join(rootDir, 'packages', 'conversion-core', 'src', 'index.ts'),
  '@universal/ui': path.join(rootDir, 'packages', 'ui', 'src', 'index.ts'),
  '@universal/i18n': path.join(rootDir, 'packages', 'i18n', 'src', 'index.ts'),
};

export async function resolve(specifier, context, nextResolve) {
  // 1. Monorepo package alias resolution
  if (packageMap[specifier]) {
    return nextResolve(pathToFileURL(packageMap[specifier]).href, context);
  }

  // 2. Relative file extension resolution (.ts / index.ts)
  if (specifier.startsWith('.') && context.parentURL) {
    try {
      const parentUrl = new URL(context.parentURL);
      let parentPath = decodeURIComponent(parentUrl.pathname);
      if (process.platform === 'win32' && parentPath.startsWith('/')) {
        parentPath = parentPath.slice(1);
      }
      const dir = path.dirname(parentPath);
      const candidateBase = path.resolve(dir, specifier);

      if (fs.existsSync(candidateBase + '.ts')) {
        return nextResolve(pathToFileURL(candidateBase + '.ts').href, context);
      }
      if (fs.existsSync(path.join(candidateBase, 'index.ts'))) {
        return nextResolve(pathToFileURL(path.join(candidateBase, 'index.ts')).href, context);
      }
    } catch {
      // Continue to nextResolve
    }
  }

  return nextResolve(specifier, context);
}
