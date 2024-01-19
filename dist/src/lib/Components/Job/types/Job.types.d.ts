import { Executor } from '../../Executors';
import { AnyExecutorShape, ExecutableProperties } from '../../Executors/types/Executor.types';
import { EnvironmentParameter } from '../../Parameters/types';
export declare type JobCommonContents = {
    steps: unknown[];
    parallelism?: number;
};
export declare type JobContentsShape = JobCommonContents & AnyExecutorShape & JobEnvironmentShape;
export declare type JobsShape = {
    [key: string]: JobContentsShape;
};
export declare type JobEnvironmentShape = {
    environment?: EnvironmentParameter;
};
export declare type AnyExecutor = Executor;
export declare type JobOptionalProperties = {
    parallelism?: number;
} & ExecutableProperties;
//# sourceMappingURL=Job.types.d.ts.map