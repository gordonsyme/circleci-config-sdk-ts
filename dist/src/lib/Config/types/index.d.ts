import { ReusableCommandShape } from '../../Components/Commands/types/Command.types';
import { ReusableExecutorsShape } from '../../Components/Executors/types/ReusableExecutor.types';
import { BuildJobConfig } from '../../Components/Job';
import { JobsShape } from '../../Components/Job/types/Job.types';
import { CustomParametersList } from '../../Components/Parameters';
import { ParameterShape } from '../../Components/Parameters/types';
import { AnyParameterLiteral } from '../../Components/Parameters/types/CustomParameterLiterals.types';
import { Workflow } from '../../Components/Workflow/exports/NewWorkflow';
import { WorkflowsShape } from '../../Components/Workflow/types/Workflow.types';
import { Generable } from '../../Components';
import * as mapping from './Mapping.types';
/**
 * Selected config version
 */
export declare type ConfigVersion = 2 | 2.1;
/**
 * Orb import object
 */
export declare type ConfigOrbImport = Record<string, string>;
/**
 * CircleCI configuration object
 */
export declare type CircleCIConfigObject = {
    version: ConfigVersion;
    jobs?: Map<string, BuildJobConfig>;
    workflows?: Map<string, Workflow>;
};
/**
 * Generated Shape of the CircleCI config.
 */
export declare type CircleCIConfigShape = {
    version: ConfigVersion;
    setup: boolean;
    parameters?: Record<string, ParameterShape>;
    executors?: ReusableExecutorsShape;
    jobs: JobsShape;
    commands?: ReusableCommandShape;
    workflows: WorkflowsShape;
};
export declare type UnknownConfigShape = {
    setup: boolean;
    orbs?: Record<string, unknown>;
    executors?: Record<string, unknown>;
    jobs: Record<string, unknown>;
    commands?: Record<string, unknown>;
    parameters?: Record<string, unknown>;
    workflows: Record<string, unknown>;
};
export declare type ConfigDependencies = {
    jobList: BuildJobConfig[];
    workflows: Workflow[];
    parameterList?: CustomParametersList<AnyParameterLiteral>;
};
export { mapping, Generable };
//# sourceMappingURL=index.d.ts.map