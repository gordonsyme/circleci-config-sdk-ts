import * as YAML from 'yaml';
import { Generable } from '../Components';
import { BuildJobConfig } from '../Components/Job';
import { CustomParametersList } from '../Components/Parameters';
import { Parameterized } from '../Components/Parameters/exports/Parameterized';
import { PipelineParameterLiteral } from '../Components/Parameters/types/CustomParameterLiterals.types';
import { Job, Workflow } from '../Components/Workflow/exports/NewWorkflow';
import { GenerableType } from './exports/Mapping';
import { CircleCIConfigObject, CircleCIConfigShape, ConfigVersion } from './types';
/**
 * A CircleCI configuration. Instantiate a new config and add CircleCI config elements.
 */
export declare class Config implements CircleCIConfigObject, Parameterized<PipelineParameterLiteral>, Generable {
    /**
     * The version field is intended to be used in order to issue warnings for deprecation or breaking changes.
     */
    version: ConfigVersion;
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
     * Designates the config.yaml for use of CircleCI’s dynamic configuration feature.
     */
    setup: boolean;
    /**
     * Instantiate a new CircleCI config. Build up your config by adding components.
     * @param jobs - Instantiate with pre-defined Jobs.
     * @param workflows - Instantiate with pre-defined Workflows.
     * @param commands - Instantiate with pre-defined reusable Commands.
     */
    constructor(setup?: boolean, jobs?: Map<string, BuildJobConfig>, workflows?: Map<string, Workflow>, parameters?: CustomParametersList<PipelineParameterLiteral>);
    /**
     * Add a Workflow to the current Config. Chainable
     * @param workflow - Injectable Workflow
     */
    addWorkflow(workflow: Workflow): this;
    getJobConfig(name: string): BuildJobConfig | undefined;
    getJob(workflowName: string, jobName: string): Job | undefined;
    /**
     * Add a Job to the current Config. Chainable
     * @param job - Injectable Job
     */
    addJob(job: BuildJobConfig): this;
    /**
     * Define a pipeline parameter for the current Config. Chainable
     *
     * @param name - The name of the parameter
     * @param type - The type of parameter
     * @param defaultValue - The default value of the parameter
     * @param description - A description of the parameter
     * @param enumValues - An array of possible values for parameters of enum type
     */
    defineParameter(name: string, type: PipelineParameterLiteral, defaultValue?: unknown, description?: string, enumValues?: string[]): Config;
    private _prependVersionComment;
    /**
     * @param flatten - Attempt to remove unnecessary parameters when possible.
     * @returns the CircleCI config as a JSON string
     */
    generate(flatten?: boolean): CircleCIConfigShape;
    /**
     *
     * @param flatten - Attempt to remove unnecessary parameters when possible.
     * @param options - Modify the YAML output options.
     * @returns the CircleCI config as a YAML string
     */
    stringify(flatten?: boolean, options?: YAML.ToStringOptions): string;
    get generableType(): GenerableType;
}
export declare function readConfigFile(path: string): Config;
