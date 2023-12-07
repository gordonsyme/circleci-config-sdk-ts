import { GenerableType } from '../../Config/exports/Mapping';
import { AddSSHKeys, Checkout, Run, SetupRemoteDocker, StoreArtifacts, StoreTestResults } from '../Commands';
import { Command } from '../Commands/exports/Command';
import { Restore, Save } from '../Commands/exports/Native/Cache';
import { Attach, Persist } from '../Commands/exports/Native/Workspace';
import { CommandShape } from '../Commands/types/Command.types';
import { DockerExecutor, MachineExecutor, MacOSExecutor } from '../Executors';
import { Executor } from '../Executors/exports/Executor';
import { ExecutorShape } from '../Executors/types/Executor.types';
import { Executable } from '../Executors/types/ExecutorParameters.types';
import { ReusableExecutorsShape, ReusedExecutorShape } from '../Executors/types/ReusableExecutor.types';
import { Generable } from '../index';
import {
  EnvironmentParameter,
  IntegerParameter,
  StringParameter,
} from '../Parameters/types';
import {
  AnyExecutor,
  JobCommonContents,
  JobContentsShape,
  JobOptionalProperties,
  JobsShape,
} from './types/Job.types';

/**
 * Jobs define a collection of steps to be run within a given executor, and are orchestrated using Workflows.
 */
export class BuildJobConfig implements Generable, Executable {
  /**
   * The name of the current Job.
   */
  name: StringParameter;
  /**
   * The reusable executor to use for this job. The Executor must have already been instantiated and added to the config.
   */
  executor: AnyExecutor;
  /**
   * A list of Commands to execute within the job in the order which they were added.
   */
  steps: Command[];
  /**
   * Number of parallel instances of this job to run (defaults to 1 if undefined)
   */
  parallelism: IntegerParameter | undefined;

  // Execution environment properties

  environment?: EnvironmentParameter;
  shell?: StringParameter;
  working_directory?: StringParameter;

  /**
   * Instantiate a CircleCI Job
   * @param name - Name your job with a unique identifier
   * @param executor - The reusable executor to use for this job. The Executor must have already been instantiated and added to the config.
   * @param steps - A list of Commands to execute within the job in the order which they were added.
   * @param properties - Additional optional properties to further configure the job.
   * @see {@link https://circleci.com/docs/2.0/configuration-reference/?section=configuration#jobs}
   */
  constructor(
    name: string,
    executor: AnyExecutor,
    steps: Command[] = [],
    properties?: JobOptionalProperties,
  ) {
    this.name = name;
    this.executor = executor;
    this.steps = steps;
    this.environment = properties?.environment;
    this.shell = properties?.shell;
    this.working_directory = properties?.working_directory;
    this.parallelism = properties?.parallelism;
  }

  /**
   * Generates the contents of the Job.
   * @returns The generated JSON for the Job's contents.
   */
  generateContents(flatten?: boolean): JobContentsShape {
    const generatedSteps = this.steps.map((step) => {
      return step.generate(flatten);
    });
    const generatedExecutor = this.executor.generate(flatten);

    return {
      ...generatedExecutor,
      steps: generatedSteps,
      environment: this.environment,
      shell: this.shell,
      working_directory: this.working_directory,
      parallelism: this.parallelism,
    };
  }
  /**
   * Generate Job schema
   * @returns The generated JSON for the Job.
   */
  generate(flatten?: boolean): JobsShape {
    return {
      [this.name]: this.generateContents(flatten),
    };
  }

  /**
   * Add steps to the current Job. Chainable.
   * @param command - Command to use for step
   */
  addStep(command: Command): this {
    this.steps.push(command);
    return this;
  }

  /**
   * Add an environment variable to the job.
   * This will be set in plain-text via the exported config file.
   * Consider using project-level environment variables or a context for sensitive information.
   * @see {@link https://circleci.com/docs/env-vars}
   * @example
   * ```
   * myJob.addEnvVar('MY_VAR', 'my value');
   * ```
   */
  addEnvVar(name: string, value: string): this {
    if (!this.environment) {
      this.environment = {
        [name]: value,
      };
    } else {
      this.environment[name] = value;
    }
    return this;
  }

  get generableType(): GenerableType {
    return GenerableType.JOB;
  }

  static from(n: string, d: any): BuildJobConfig {
    if (!validateJobData(d)) {
      throw new Error("Invalid job config data");
    }

    let executor: Executor = new DockerExecutor("DON'T DO THIS");
    const data = d as JobCommonContents & ExecutorShape;
    if (Object.hasOwn(d, 'docker')) {
      executor = DockerExecutor.from(data.docker, data.resource_class);
    }
    /*else if (Object.hasOwn(d, 'machine')) {
      executor = MachineExecutor.from(data.machine, data.resource_class);
    }
    else if (Object.hasOwn(d, 'macos')) {
      executor = MacOSExecutor.from(data.macos, data.resource_class);
    }
    else {
      throw new Error("Invalid job config data");
    }*/

    const config = new BuildJobConfig(n, executor);
    d.steps.forEach((step) => {
      config.addStep(commandFrom(step));
    });
    return config;
  }
}

function validateJobData(d: any): d is JobContentsShape {
  if (!Array.isArray(d.steps)) {
    return false;
  }
  return true;
}

function commandFrom(d: any): Command {
  const { add_ssh_keys,
    attach_workspace,
    checkout,
    persist_to_workspace,
    restore_cache,
    run,
    save_cache,
    setup_remote_docker,
    store_artifacts,
    store_test_results } = d;

  if (add_ssh_keys) {
    return AddSSHKeys.from(d);
  }

  if (attach_workspace) {
    return Attach.from(d);
  }

  if (checkout || d === 'checkout') {
    return Checkout.from(d);
  }

  if (persist_to_workspace) {
    return Persist.from(d);
  }

  if (restore_cache) {
    return Restore.from(d);
  }

  if (run) {
    return Run.from(d);
  }

  if (save_cache) {
    return Save.from(d);
  }

  if (setup_remote_docker) {
    return SetupRemoteDocker.from(d);
  }

  if (store_artifacts) {
    return StoreArtifacts.from(d);
  }

  if (store_test_results) {
    return StoreTestResults.from(d);
  }

  console.log("bad command data:" + d);
  throw new Error("Invalid command config data");
}