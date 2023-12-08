import * as YAML from 'yaml';
import { DocumentOptions } from 'yaml';
import * as CircleCI from '../src/index';

describe('Instantiate a Run step', () => {
  const run = new CircleCI.commands.Run({
    command: 'echo hello world',
  });
  const runWithEnv = new CircleCI.commands.Run({
    command: 'echo hello world',
    environment: {
      MY_VAR: 'my value',
    },
  });
  const runWithAddedEnv = new CircleCI.commands.Run({
    command: 'echo hello world',
  });
  runWithAddedEnv.addEnvVar('MY_VAR', 'my value');

  const expectedEnvResult = {
    run: { command: 'echo hello world', environment: { MY_VAR: 'my value' } },
  };

  it('Should generate a run step with environment variable', () => {
    expect(runWithEnv.generate()).toEqual(expectedEnvResult);
  });

  it('Should generate a run step with an added environment variable', () => {
    expect(runWithAddedEnv.generate()).toEqual(expectedEnvResult);
  });

  const runStep = run.generate(true);
  const expectedResult = { run: 'echo hello world' };
  it('Should generate checkout yaml', () => {
    expect(runStep).toEqual(expectedResult);
  });

  it('Should have the correct static properties', () => {
    expect(run.generableType).toBe(CircleCI.mapping.GenerableType.RUN);
    expect(run.name).toBe('run');
  });
});

describe('Instantiate a Checkout step', () => {
  const checkout = new CircleCI.commands.Checkout();

  it('Should produce checkout string', () => {
    expect(checkout.generate()).toEqual('checkout');
  });

  const checkoutWithPathResult = {
    checkout: { path: './src' },
  };

  const checkoutWithPath = new CircleCI.commands.Checkout({ path: './src' });
  it('Should produce checkout with path parameter', () => {
    expect(checkoutWithPath.generate()).toEqual(checkoutWithPathResult);
  });

  it('Should have the correct static properties', () => {
    expect(checkout.generableType).toBe(
      CircleCI.mapping.GenerableType.CHECKOUT,
    );
    expect(checkout.name).toBe('checkout');
  });
});

describe('Instantiate a Setup_Remote_Docker step', () => {
  const srdExample = new CircleCI.commands.SetupRemoteDocker();
  const srdResult = {
    setup_remote_docker: {
      version: '20.10.6',
    },
  };

  it('Should produce setup_remote_docker step with the current default', () => {
    expect(srdExample.generate()).toEqual(srdResult);
  });

  it('Should have the correct static properties', () => {
    expect(srdExample.generableType).toBe(
      CircleCI.mapping.GenerableType.SETUP_REMOTE_DOCKER,
    );
    expect(srdExample.name).toBe('setup_remote_docker');
  });

  const srdWithDlcExample =
    new CircleCI.commands.SetupRemoteDocker().setDockerLayerCaching(true);

  const srdWithDlcResult = {
    setup_remote_docker: {
      version: '20.10.6',
      docker_layer_caching: true,
    },
  };

  it('Should produce setup_remote_docker step and enable docker layer caching', () => {
    expect(srdWithDlcExample.generate()).toEqual(srdWithDlcResult);
  });
});

describe('Save and load cache', () => {
  const saveExample = {
    save_cache: {
      key: 'v1-myapp-{{ arch }}-{{ checksum "project.clj" }}',
      paths: ['/home/ubuntu/.m2'],
    },
  };
  const save_cache = new CircleCI.commands.cache.Save({
    key: 'v1-myapp-{{ arch }}-{{ checksum "project.clj" }}',
    paths: ['/home/ubuntu/.m2'],
  });

  it('Should generate save cache yaml', () => {
    expect(saveExample).toEqual(save_cache.generate());
  });

  const restoreExample = {
    restore_cache: {
      keys: ['v1-npm-deps-{{ checksum "package-lock.json" }}', 'v1-npm-deps-'],
    },
  };
  const restore_cache = new CircleCI.commands.cache.Restore({
    keys: ['v1-npm-deps-{{ checksum "package-lock.json" }}', 'v1-npm-deps-'],
  });

  it('Should generate restore cache yaml', () => {
    expect(restoreExample).toEqual(restore_cache.generate());
  });

  const restoreCacheSingle = new CircleCI.commands.cache.Restore({
    key: 'v1-npm-deps-{{ checksum "package-lock.json" }}',
  });

  const restoreExampleSingle = {
    restore_cache: {
      key: 'v1-npm-deps-{{ checksum "package-lock.json" }}',
    },
  };

  it('Should generate restore cache yaml', () => {
    expect(restoreCacheSingle.generate()).toEqual(restoreExampleSingle);
  });

  it('Should have the correct static properties for save_cache', () => {
    expect(save_cache.generableType).toBe(CircleCI.mapping.GenerableType.SAVE);
    expect(save_cache.name).toBe('save_cache');
  });

  it('Should have the correct static properties for restore_cache', () => {
    expect(restore_cache.generableType).toBe(
      CircleCI.mapping.GenerableType.RESTORE,
    );
    expect(restore_cache.name).toBe('restore_cache');
  });
});

describe('Store artifacts', () => {
  const storeResult = {
    store_artifacts: {
      path: 'jekyll/_site/docs/',
      destination: 'circleci-docs',
    },
  };
  const storeExample = new CircleCI.commands.StoreArtifacts({
    path: 'jekyll/_site/docs/',
    destination: 'circleci-docs',
  });

  it('Should generate the store artifacts command', () => {
    expect(storeResult).toEqual(storeExample.generate());
  });

  it('Should have the correct static properties', () => {
    expect(storeExample.generableType).toBe(
      CircleCI.mapping.GenerableType.STORE_ARTIFACTS,
    );
    expect(storeExample.name).toBe('store_artifacts');
  });
});

describe('Store test results', () => {
  const example = { store_test_results: { path: 'test-results' } };
  const storeTestResults = new CircleCI.commands.StoreTestResults({
    path: 'test-results',
  });

  it('Should generate the test results command', () => {
    expect(example).toEqual(storeTestResults.generate());
  });

  it('Should have the correct static properties', () => {
    expect(storeTestResults.generableType).toBe(
      CircleCI.mapping.GenerableType.STORE_TEST_RESULTS,
    );
    expect(storeTestResults.name).toBe('store_test_results');
  });
});

describe('Add SSH Keys', () => {
  const sshExample = {
    add_ssh_keys: {
      fingerprints: ['b7:35:a6:4e:9b:0d:6d:d4:78:1e:9a:97:2a:66:6b:be'],
    },
  };
  const addSSHKeys = new CircleCI.commands.AddSSHKeys({
    fingerprints: ['b7:35:a6:4e:9b:0d:6d:d4:78:1e:9a:97:2a:66:6b:be'],
  });

  it('Should generate the add_ssh_keys command schema', () => {
    expect(sshExample).toEqual(addSSHKeys.generate());
  });

  it('Should have correct properties', () => {
    expect(addSSHKeys.generableType).toBe(
      CircleCI.mapping.GenerableType.ADD_SSH_KEYS,
    );
    expect(addSSHKeys.name).toBe('add_ssh_keys');
  });
});

// Test a Run command with a multi-line command string
describe('Instantiate a Run command with a multi-line command string', () => {
  const stringifyOptions:
    | (DocumentOptions &
        YAML.SchemaOptions &
        YAML.ParseOptions &
        YAML.CreateNodeOptions &
        YAML.ToStringOptions)
    | undefined = {
    defaultStringType: YAML.Scalar.PLAIN,
    lineWidth: 0,
    minContentWidth: 0,
    doubleQuotedMinMultiLineLength: 999,
  };
  const multiLineCommand = new CircleCI.commands.Run({
    command: `echo "hello world 1"
echo "hello world 2"
echo "hello world 3"
echo hello world 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 this string is a single line, and should output as a single line`,
  });
  const expectedOutput = `run: |-
  echo "hello world 1"
  echo "hello world 2"
  echo "hello world 3"
  echo hello world 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 this string is a single line, and should output as a single line
`;
  it('Should match expectedOutput', () => {
    expect(
      YAML.stringify(multiLineCommand.generate(true), stringifyOptions),
    ).toEqual(expectedOutput);
  });
});

// Test a Run command with 70 characters in the command string and ensure it remains a single string
describe('Instantiate a Run command with 70 characters in the command string and ensure it remains a single string', () => {
  const stringifyOptions:
    | (DocumentOptions &
        YAML.SchemaOptions &
        YAML.ParseOptions &
        YAML.CreateNodeOptions &
        YAML.ToStringOptions)
    | undefined = {
    defaultStringType: YAML.Scalar.PLAIN,
    lineWidth: 0,
    minContentWidth: 0,
    doubleQuotedMinMultiLineLength: 999,
  };
  const longCommand = new CircleCI.commands.Run({
    command: `echo hello world 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 this string is a single line, and should output as a single line`,
  });
  const expectedOutput = `run: echo hello world 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 this string is a single line, and should output as a single line
`;
  it('Should match expectedOutput', () => {
    expect(
      YAML.stringify(longCommand.generate(true), stringifyOptions),
    ).toEqual(expectedOutput);
  });
});

// Test using Workspaces to Share Data Between Jobs and attach workflows workspace to current container.
describe('Instantiate a Run command with 70 characters in the command string and ensure it remains a single string', () => {
  const myExecutor = new CircleCI.executors.DockerExecutor('cimg/base:stable');
  const attachWorkspace = new CircleCI.BuildJobConfig('attach to workspace', myExecutor, [
    new CircleCI.commands.workspace.Attach({ at: '/tmp/workspace' }),
  ]);

  const persistWorkspace = new CircleCI.BuildJobConfig(
    'persist to workspace',
    myExecutor,
    [
      new CircleCI.commands.workspace.Persist({
        root: 'workspace',
        paths: ['echo-output'],
      }),
    ],
  );

  it('Should have the correct static properties for attach workspace', () => {
    expect(attachWorkspace.steps[0].generableType).toBe(
      CircleCI.mapping.GenerableType.ATTACH,
    );
    expect(attachWorkspace.steps[0].name).toBe('attach_workspace');
  });

  it('Should have the correct static properties for persist', () => {
    expect(persistWorkspace.steps[0].generableType).toBe(
      CircleCI.mapping.GenerableType.PERSIST,
    );
    expect(persistWorkspace.steps[0].name).toBe('persist_to_workspace');
  });
});
