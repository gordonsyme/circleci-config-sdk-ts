import { FilterParameter, ListParameter, MatrixParameter, StringParameter } from '../../Parameters/types';
import { JobParameterTypes } from '../../Parameters/types/ComponentParameters.types';
import { AnyCommandShape } from '../../Commands/types/Command.types';
export declare type approval = 'approval';
/**
 * Full Workflow Job parameter type
 */
export declare type WorkflowJobShape = {
    [workflowJobName: StringParameter]: WorkflowJobContentsShape;
} | string;
export declare type WorkflowJobContentsShape = WorkflowJobParametersShape | undefined;
/**
 * Workflow Job parameter output shape
 */
export interface WorkflowJobParametersShape {
    requires?: ListParameter;
    context?: ListParameter;
    type?: approval;
    filters?: FilterParameter;
    matrix?: WorkflowMatrixShape;
    [key: string]: JobParameterTypes | WorkflowMatrixShape | undefined | AnyCommandShape[];
}
/**
 * A map of parameter names to every value the job should be called with
 */
export interface WorkflowMatrixShape {
    parameters: MatrixParameter;
}
//# sourceMappingURL=WorkflowJob.types.d.ts.map