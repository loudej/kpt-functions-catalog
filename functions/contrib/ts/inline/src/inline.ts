import { Configs } from 'kpt-functions';
import { transpileModule, ModuleKind } from 'typescript';
import { promises, existsSync } from 'fs';
import { join, extname, basename, dirname } from 'path';
import { tmpdir } from 'os';

function changeExtension(file: string, extension: string): string {
  const base = basename(file, extname(file));
  return join(dirname(file), base + extension);
}

export async function inline(configs: Configs) {
  const configMapData = configs.getFunctionConfigMap();
  if (configMapData === undefined) {
    throw new Error(`Function ConfigMap data cannot be undefined.`);
  }

  const mainModule = configs.getFunctionConfigValue('main_module') || 'main';

  const dynamicLocation = join(tmpdir(), 'dynamic');
  if (!existsSync(dynamicLocation)) {
    await promises.mkdir(dynamicLocation);
  }
  const dynamicTemp = await promises.mkdtemp(dynamicLocation + '/tmp-');

  for (const [fileName, input] of configMapData) {
    if (extname(fileName) === '.ts') {
      // transpile from .ts to .js
      const module = transpileModule(input, {
        fileName,
        compilerOptions: { module: ModuleKind.CommonJS },
      });
      if (module === undefined) {
        throw new Error(`ConfigMap file cannot be imported.`);
      }
      await promises.writeFile(
        join(dynamicTemp, changeExtension(fileName, '.js')),
        module.outputText
      );
    } else if (extname(fileName) !== '') {
      // any other extension - write out unchanged
      await promises.writeFile(join(dynamicTemp, fileName), input);
    }
  }

  const main = await import(join(dynamicTemp, mainModule));
  if (main === undefined) {
    console.error('main === undefined');
    throw new Error(
      `Function ConfigMap does not contain main.ts or main.js file.`
    );
  }

  await main.default(configs);

  await promises.rmdir(dynamicTemp, { recursive: true });
}

inline.usage = 'Very carefully';
