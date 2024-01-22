import { isBrowser, isNode } from 'browser-or-node';
import * as YAML from 'yaml';
import { version as SDKVersion } from '../../../package-version.json';
import { Generable } from '../Components';
import { BuildJobConfig } from '../Components/Job';
import { JobsShape } from '../Components/Job/types/Job.types';
import { CustomParametersList } from '../Components/Parameters';
import { Parameterized } from '../Components/Parameters/exports/Parameterized';
import { PipelineParameterLiteral } from '../Components/Parameters/types/CustomParameterLiterals.types';
import { Job, Workflow } from '../Components/Workflow/exports/NewWorkflow';
import { WorkflowsShape } from '../Components/Workflow/types/Workflow.types';
import { GenerableType } from './exports/Mapping';
import { Pipeline } from './Pipeline';
import {
  CircleCIConfigObject,
  CircleCIConfigShape,
  ConfigVersion,
} from './types';

/**
 * A CircleCI configuration. Instantiate a new config and add CircleCI config elements.
 */
export class Config
  implements
    CircleCIConfigObject,
    Parameterized<PipelineParameterLiteral>,
    Generable
{
  /**
   * The version field is intended to be used in order to issue warnings for deprecation or breaking changes.
   */
  version: ConfigVersion = 2.1;
  /**
   * Jobs are collections of steps. All of the steps in the job are executed in a single unit, either within a fresh container or VM.
   */
  jobs: Map<string, BuildJobConfig>;
  /**
   * A Workflow is comprised of one or more uniquely named jobs.
   */
  workflows: Map<string, Workflow>;
  /**
   * A parameter allows custom data to be passed to a pipeline.
   */
  parameters?: CustomParametersList<PipelineParameterLiteral>;
  /**
   * Access information about the current pipeline.
   */
  pipeline: Pipeline = new Pipeline();
  /**
   * Designates the config.yaml for use of CircleCI’s dynamic configuration feature.
   */
  setup: boolean;

  /**
   * Instantiate a new CircleCI config. Build up your config by adding components.
   * @param jobs - Instantiate with pre-defined Jobs.
   * @param workflows - Instantiate with pre-defined Workflows.
   * @param commands - Instantiate with pre-defined reusable Commands.
   */
  constructor(
    setup = false,
    jobs?: Map<string, BuildJobConfig>,
    workflows?: Map<string, Workflow>,
    parameters?: CustomParametersList<PipelineParameterLiteral>,
  ) {
    this.setup = setup;
    this.jobs = jobs || new Map();
    this.workflows = workflows || new Map();
    this.parameters = parameters;
  }

  /**
   * Add a Workflow to the current Config. Chainable
   * @param workflow - Injectable Workflow
   */
  addWorkflow(workflow: Workflow): this {
    this.workflows.set(workflow.name, workflow);
    return this;
  }

  getJobConfig(name: string): BuildJobConfig | undefined {
    return this.jobs.get(name);
  }

  getJob(workflowName: string, jobName: string): Job | undefined {
    return this.workflows.get(workflowName)?.jobs.find((j) => { j.name === jobName });
  }

  /**
   * Add a Job to the current Config. Chainable
   * @param job - Injectable Job
   */
  addJob(job: BuildJobConfig): this {
    this.jobs.set(job.name, job);

    return this;
  }

  /**
   * Define a pipeline parameter for the current Config. Chainable
   *
   * @param name - The name of the parameter
   * @param type - The type of parameter
   * @param defaultValue - The default value of the parameter
   * @param description - A description of the parameter
   * @param enumValues - An array of possible values for parameters of enum type
   */
  defineParameter(
    name: string,
    type: PipelineParameterLiteral,
    defaultValue?: unknown,
    description?: string,
    enumValues?: string[],
  ): Config {
    if (!this.parameters) {
      this.parameters = new CustomParametersList<PipelineParameterLiteral>();
    }

    this.parameters.define(name, type, defaultValue, description, enumValues);

    return this;
  }

  private _prependVersionComment(source: string): string {
    const comment = `# This configuration has been automatically generated by the CircleCI Config SDK.
# For more information, see https://github.com/CircleCI-Public/circleci-config-sdk-ts
# SDK Version: ${SDKVersion}
`;
    return `${comment}\n${source}`;
  }

  /**
   * @param flatten - Attempt to remove unnecessary parameters when possible.
   * @returns the CircleCI config as a JSON string
   */
  generate(flatten?: boolean): CircleCIConfigShape {
    const generatedWorkflows = generateList<WorkflowsShape>(
      Array.from(this.workflows.values()),
      {},
      flatten,
    );
    const generatedJobs = generateList<JobsShape>(Array.from(this.jobs.values()), {}, flatten);
    const generatedParameters = this.parameters?.generate();

    const generatedConfig: CircleCIConfigShape = {
      version: this.version,
      setup: this.setup,
      parameters: generatedParameters,
      jobs: generatedJobs,
      workflows: generatedWorkflows,
    };

    return generatedConfig;
  }

  /**
   *
   * @param flatten - Attempt to remove unnecessary parameters when possible.
   * @param options - Modify the YAML output options.
   * @returns the CircleCI config as a YAML string
   */
  stringify(flatten?: boolean, options?: YAML.ToStringOptions): string {
    const generatedConfig = this.generate(flatten);
    const defaultOptions: YAML.ToStringOptions & YAML.CreateNodeOptions = {
      aliasDuplicateObjects: false,
      defaultStringType: YAML.Scalar.PLAIN,
      doubleQuotedMinMultiLineLength: 999,
      lineWidth: 0,
      minContentWidth: 0,
    };
    return this._prependVersionComment(
      YAML.stringify(generatedConfig, options ?? defaultOptions),
    );
  }

  get generableType(): GenerableType {
    return GenerableType.CONFIG;
  }

}

export function readConfigFile(path: string): Config {
  if (isNode) {
    const fs = require('node:fs');

    // This is the very lazy option, it should be calling code that takes the
    // data structure and instantiates the correct object for each of the
    // types of data stored in a .circleci/config.yml
    const cfg = YAML.parse(fs.readFileSync(path, {encoding: "UTF-8"})) as CircleCIConfigShape;
;;
    const jobConfigs = Object.keys(cfg.jobs).reduce((acc, k) => {
      acc.set(k, BuildJobConfig.from(k, cfg.jobs[k]));
      return acc;
    },
    new Map<string, BuildJobConfig>());

    const workflows = Object.keys(cfg.workflows).reduce(
      (acc, k) => {
        // Avoid the version key, it maps to a number not to a workflow config
        if (k !== 'version') {
          acc.set(k, Workflow.from(k, cfg.workflows[k], jobConfigs));
        }
        return acc;
      },
      new Map<string, Workflow>());

    return new Config(false, jobConfigs, workflows);
  }
  else {
    throw new Error('Unsupported environment');
  }
}

function generateList<Shape>(
  listIn?: Generable[],
  failSafe?: Shape,
  flatten?: boolean,
): Shape {
  if (!listIn) {
    return failSafe as Shape;
  }

  return Object.assign(
    {},
    ...listIn.map((generable) => {
      return generable.generate(flatten);
    }),
  );
}
