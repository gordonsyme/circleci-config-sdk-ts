import { OrbRef } from '../../../Orb/exports/OrbRef';
import { Job } from '../../Job';
import { JobParameterLiteral } from '../../Parameters/types/CustomParameterLiterals.types';
import { WorkflowJobContentsShape, WorkflowJobParameters, WorkflowJobShape } from '../types/WorkflowJob.types';
import { WorkflowJobAbstract } from './WorkflowJobAbstract';
/**
 * Assign Parameters and Filters to a Job within a Workflow.
 * Utility class for assigning parameters to a job.
 * Should only be instantiated for specific use cases.
 * @see {@link Workflow.addJob} for general use.
 */
export declare class WorkflowJob extends WorkflowJobAbstract {
    job: Job | OrbRef<JobParameterLiteral>;
    constructor(job: Job | OrbRef<JobParameterLiteral>, parameters?: Exclude<WorkflowJobParameters, 'type'>);
    generateContents(flatten?: boolean): WorkflowJobContentsShape;
    generate(flatten?: boolean): WorkflowJobShape;
    get name(): string;
}
//# sourceMappingURL=WorkflowJob.d.ts.map