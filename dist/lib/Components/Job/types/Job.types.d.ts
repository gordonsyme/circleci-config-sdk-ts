import { Executor } from '../../Executors';
import { AnyExecutorShape, ExecutableProperties } from '../../Executors/types/Executor.types';
import { EnvironmentParameter } from '../../Parameters/types';
export type JobCommonContents = {
    steps: unknown[];
    parallelism?: number;
};
export type JobContentsShape = JobCommonContents & AnyExecutorShape & JobEnvironmentShape;
export type JobsShape = {
    [key: string]: JobContentsShape;
};
export type JobEnvironmentShape = {
    environment?: EnvironmentParameter;
};
export type AnyExecutor = Executor;
export type JobOptionalProperties = {
    parallelism?: number;
} & ExecutableProperties;
