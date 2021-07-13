import { TestRunner, Configs } from 'kpt-functions';
import { inline } from './inline';
import { ConfigMap, Namespace, ServiceAccount } from './gen/io.k8s.api.core.v1';

describe('inline', () => {
  const runner = new TestRunner(inline);
  it('outputs error given undefined function config', async () => {
    const input = new Configs(undefined, undefined);

    await runner.assert(input, new Configs(undefined, undefined), Error);
  });

  const namespace = Namespace.named('namespace');
  it('outputs error given namespace function config', async () => {
    const input = new Configs(undefined, namespace);

    await runner.assert(input, new Configs(undefined, namespace), Error);
  });

  const emptyConfigMap = new ConfigMap({ metadata: { name: 'config' } });
  it('outputs error given empty config', async () => {
    const input = new Configs(undefined, emptyConfigMap);

    await runner.assert(input, new Configs(undefined, emptyConfigMap), Error);
  });

  const deleteAllConfigMap = new ConfigMap({
    metadata: { name: 'config' },
    data: {
      'main.ts': `
export default async function deleteAll(configs) {
  console.error('testing');
  configs.deleteAll();
}
`,
    },
  });
  it('deleteAll removes resources', async () => {
    const configs = new Configs(
      [ServiceAccount.named('removing')],
      deleteAllConfigMap
    );

    await runner.assert(configs, new Configs([], deleteAllConfigMap));
  });
});
