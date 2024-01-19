import { WorkflowJobShape } from './WorkflowJob.types';
export declare type WorkflowsShape = {
    [workflowName: string]: {
        jobs: WorkflowJobShape[];
    };
};
export declare type WorkflowContentsShape = {
    jobs: WorkflowJobShape[];
};
export declare type UnknownWorkflowShape = {
    jobs: {
        [key: string]: unknown;
    }[];
};
export declare type UnknownWorkflowJobShape = {
    requires?: string[];
    parameters?: {
        [key: string]: unknown;
    };
    name?: string;
    type?: 'approval';
};
//# sourceMappingURL=Workflow.types.d.ts.map