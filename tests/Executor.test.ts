import * as YAML from 'yaml';
import * as CircleCI from '../src/index';

describe('Instantiate Docker Executor', () => {
  const docker = new CircleCI.executors.DockerExecutor('cimg/node:lts');
  const expectedShape = {
    docker: [{ image: 'cimg/node:lts' }],
    resource_class: 'medium',
  };

  it('Should match the expected output', () => {
    expect(docker.generate()).toEqual(expectedShape);
  });

  const dockerWithEnv = new CircleCI.executors.DockerExecutor('cimg/node:lts');
  dockerWithEnv.addEnvVar('MY_VAR', 'my value');
  const expectedShapeWithEnv = {
    docker: [
      {
        image: 'cimg/node:lts',
        environment: {
          MY_VAR: 'my value',
        },
      },
    ],
    resource_class: 'medium',
  };

  it('Should match the expected output with env var', () => {
    expect(dockerWithEnv.generate()).toEqual(expectedShapeWithEnv);
  });

  it('Docker executor should be instance of an Executor', () => {
    expect(docker instanceof CircleCI.executors.Executor).toBeTruthy();
  });

  const dockerWithMultipleImage = new CircleCI.executors.DockerExecutor(
    'cimg/node:lts',
  );
  dockerWithMultipleImage.addServiceImage({
    image: 'cimg/mysql:5.7',
  });
  const expectedShapeWithMultipleImage = {
    docker: [
      {
        image: 'cimg/node:lts',
      },
      {
        image: 'cimg/mysql:5.7',
      },
    ],
    resource_class: 'medium',
  };

  it('Should match the expected outputh with two images', () => {
    expect(dockerWithMultipleImage.generate()).toEqual(
      expectedShapeWithMultipleImage,
    );
  });

  it('Should have the correct static properties for persist', () => {
    expect(docker.generableType).toBe(
      CircleCI.mapping.GenerableType.DOCKER_EXECUTOR,
    );
  });
});

describe('Instantiate Machine Executor', () => {
  const machine = new CircleCI.executors.MachineExecutor();
  const expectedShape = {
    machine: { image: 'ubuntu-2004:202010-01' },
    resource_class: 'medium',
  };

  it('Should match the expected output', () => {
    expect(machine.generate()).toEqual(expectedShape);
  });

  it('Should have the correct static properties for persist', () => {
    expect(machine.generableType).toBe(
      CircleCI.mapping.GenerableType.MACHINE_EXECUTOR,
    );
  });
});

describe('Instantiate MacOS Executor', () => {
  const macos = new CircleCI.executors.MacOSExecutor('13.0.0');
  const expectedShape = {
    macos: {
      xcode: '13.0.0',
    },
    resource_class: 'medium',
  };

  it('Should match the expected output', () => {
    expect(macos.generate()).toEqual(expectedShape);
  });

  it('Should have the correct static properties for persist', () => {
    expect(macos.generableType).toBe(
      CircleCI.mapping.GenerableType.MACOS_EXECUTOR,
    );
  });
});

describe('Instantiate Large MacOS Executor', () => {
  const macos = new CircleCI.executors.MacOSExecutor('13.0.0', 'large');
  const expectedShape = {
    macos: {
      xcode: '13.0.0',
    },
    resource_class: 'large',
  };

  it('Should match the expected output', () => {
    expect(macos.generate()).toEqual(expectedShape);
  });
});

/**
  This test is an edge case where the shell parameter is manually removed from the executor
  Parsing is not applicable to this test
*/
describe('Instantiate Windows Executor and override shell', () => {
  const windows = new CircleCI.executors.WindowsExecutor();

  const expectedShape = {
    machine: {
      image: 'windows-server-2019-vs2019:stable',
    },
    resource_class: 'windows.medium',
    shell: 'powershell.exe',
    steps: [],
  };

  const job = new CircleCI.BuildJobConfig('test', windows, [], {
    shell: 'powershell.exe',
  });

  it('Should match the expected output', () => {
    expect(job.generateContents()).toEqual(expectedShape);
  });

  it('Should have the correct static properties for persist', () => {
    expect(windows.generableType).toBe(
      CircleCI.mapping.GenerableType.WINDOWS_EXECUTOR,
    );
  });
});

describe('Instantiate Windows Executor', () => {
  const windows = new CircleCI.executors.WindowsExecutor();
  const expectedShape = {
    machine: {
      image: 'windows-server-2019-vs2019:stable',
    },
    resource_class: 'windows.medium',
    shell: 'powershell.exe -ExecutionPolicy Bypass',
  };

  it('Should match the expected output', () => {
    expect(windows.generate()).toEqual(expectedShape);
  });
});

describe('Instantiate a 2xlarge Docker Executor', () => {
  const xxlDocker = new CircleCI.executors.DockerExecutor(
    'cimg/node:lts',
    '2xlarge',
  );

  const expectedShape = {
    docker: [{ image: 'cimg/node:lts' }],
    resource_class: '2xlarge',
  };

  it('Should match the expected output', () => {
    expect(xxlDocker.generate()).toEqual(expectedShape);
  });
});

describe('Instantiate Large Machine Executor', () => {
  const machineLarge = new CircleCI.executors.MachineExecutor('large');
  const expectedShapeLarge = {
    machine: {
      image: 'ubuntu-2004:202010-01',
    },
    resource_class: 'large',
  };

  it('Should match the expected large machine', () => {
    expect(machineLarge.generate()).toEqual(expectedShapeLarge);
  });

  const machineMedium = new CircleCI.executors.MachineExecutor('medium');
  const expectedShapeMedium = {
    machine: {
      image: 'ubuntu-2004:202010-01',
    },
    resource_class: 'medium',
  };

  it('Should match the expected output', () => {
    expect(machineMedium.generate()).toEqual(expectedShapeMedium);
  });
});