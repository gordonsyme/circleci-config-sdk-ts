import { WorkflowJobShape } from './WorkflowJob.types';
export type WorkflowsShape = {
    [workflowName: string]: {
        jobs: WorkflowJobShape[];
    };
};
export type WorkflowContentsShape = {
    jobs: WorkflowJobShape[];
};
export type UnknownWorkflowShape = {
    jobs: {
        [key: string]: unknown;
    }[];
};
export type UnknownWorkflowJobShape = {
    requires?: string[];
    parameters?: {
        [key: string]: unknown;
    };
    name?: string;
    type?: 'approval';
};
