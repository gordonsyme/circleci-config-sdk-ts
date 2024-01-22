import { GenerableType } from '../../Config/exports/Mapping';
import { AddSSHKeys, Checkout, Run, SetupRemoteDocker, StoreArtifacts, StoreTestResults } from '../Commands';
import { Command } from '../Commands/exports/Command';
import { Restore, Save } from '../Commands/exports/Native/Cache';
import { Attach, Persist } from '../Commands/exports/Native/Workspace';
import { DockerExecutor, MachineExecutor, MacOSExecutor } from '../Executors';
import { Executor } from '../Executors/exports/Executor';
import { ExecutorShape } from '../Executors/types/Executor.types';
import { Executable } from '../Executors/types/ExecutorParameters.types';
import { Generable } from '../index';
import {
  EnvironmentParameter,
  IntegerParameter,
  StringParameter,
} from '../Parameters/types';
import { Job, JobBase } from '../Workflow/exports/NewWorkflow';
import {
  AnyExecutor,
  JobCommonContents,
  JobContentsShape,
  JobOptionalProperties,
  JobsShape,
} from './types/Job.types';


export class BuildJob extends JobBase {
  constructor(name: string) {
    super(name, "build");
  }

  withConfig(cfg: BuildJobConfig): Job {
    super.withConfig(cfg);
    return this;
  }
}

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

    const executor = executorFrom(d);

    const steps = d.steps.map((step) => {
      return commandFrom(step);
    });

    const options = optionsFrom(d);

    return new BuildJobConfig(n, executor, steps, options);
  }
}

function validateJobData(d: any): d is JobContentsShape {
  if (!Array.isArray(d.steps)) {
    return false;
  }

  return true;
}

function executorFrom(d: any): Executor {
  const { docker,
    machine,
    macos,
    resource_class } = d as JobCommonContents & ExecutorShape;

    if (docker) {
      return DockerExecutor.from(docker, resource_class);
    }

    if (machine) {
      return MachineExecutor.from(machine, resource_class);
    }

    if (macos) {
      return MacOSExecutor.from(macos, resource_class);
    }
    
    throw new Error("Invalid job config data");
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

  throw new Error("Invalid command config data");
}

function optionsFrom(d: any): JobOptionalProperties {
  const { parallelism,
    shell,
    working_directory,
    environment } = d;
  
  if (parallelism && typeof(parallelism) !== 'number') {
    throw new Error("Invalid parallelism config data");
  }

  if (shell && typeof(shell) !== 'string') {
    throw new Error("Invalid shell config data");
  }

  if (working_directory && typeof(working_directory) !== 'string') {
    throw new Error("Invalid working_directory config data");
  }
  // FIXME validate environment properly

  let ret = {} as JobOptionalProperties;
  if (parallelism) {
    ret = {...ret, parallelism: parallelism};
  }
  if (shell) {
    ret = {...ret, shell: shell};
  }
  if (working_directory) {
    ret = {...ret, working_directory: working_directory};
  }
  if (environment) {
    ret = {...ret, environment: environment};
  }

  return ret;
}