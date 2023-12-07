import * as YAML from 'yaml';
import * as CircleCI from '../src/index';
import { GenerableType } from '../src/lib/Config/exports/Mapping';

describe('Instantiate Docker Job', () => {
  const docker = new CircleCI.executors.DockerExecutor('cimg/node:lts');
  const helloWorld = new CircleCI.commands.Run({
    command: 'echo hello world',
  });
  const jobName = 'my-job';
  const job = new CircleCI.Job(jobName, docker, [helloWorld]);
  const jobContents = {
    docker: [{ image: 'cimg/node:lts' }],
    resource_class: 'medium',
    steps: [{ run: 'echo hello world' }],
  };

  it('Should match the expected output', () => {
    expect(job.generate(true)).toEqual({ [jobName]: jobContents });
  });

  it('Add job to config and validate', () => {
    const myConfig = new CircleCI.Config();
    myConfig.addJob(job);
    expect(myConfig.jobs.size).toBeGreaterThan(0);
  });
});

describe('Instantiate Parameterized Docker Job With Custom Parameters', () => {
  const docker = new CircleCI.executors.DockerExecutor('cimg/node:lts');
  const helloWorld = new CircleCI.commands.Run({
    command: 'echo << parameters.greeting >>',
  });

  const job = new CircleCI.reusable.ParameterizedJob('my-job', docker);

  job.addStep(helloWorld).defineParameter('greeting', 'string', 'hello world');

  const expectedOutput = `my-job:
  parameters:
    greeting:
      type: string
      default: hello world
  docker:
    - image: cimg/node:lts
  resource_class: medium
  steps:
    - run: echo << parameters.greeting >>`;

  it('Should match the expected output', () => {
    expect(job.generate(true)).toEqual(YAML.parse(expectedOutput));
  });

  it('Should throw error when no enum values are provided', () => {
    expect(() => {
      job.defineParameter('axis', 'enum', 'x');
    }).toThrowError('Enum values must be provided for enum type parameters.');
  });

  it('Add job to config and validate', () => {
    const myConfig = new CircleCI.Config();
    myConfig.addJob(job);
    expect(myConfig.jobs.size).toBeGreaterThan(0);
  });
});

describe('Instantiate a Job with two environment variables', () => {
  const docker = new CircleCI.executors.DockerExecutor('cimg/node:lts');
  const helloWorld = new CircleCI.commands.Run({
    command: 'echo hello',
  });

  const job = new CircleCI.Job('my-job', docker);
  job.addStep(helloWorld);
  job.addEnvVar('MY_VAR_1', 'value1');
  job.addEnvVar('MY_VAR_2', 'value2');

  const expectedOutput = `my-job:
  docker:
    - image: cimg/node:lts
  environment:
    MY_VAR_1: value1
    MY_VAR_2: value2
  resource_class: medium
  steps:
    - run: echo hello
`;

  it('Should match the expected output', () => {
    expect(job.generate(true)).toEqual(YAML.parse(expectedOutput));
  });
});
