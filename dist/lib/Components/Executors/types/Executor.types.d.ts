import { Executor } from '..';
import { CustomParametersList } from '../../Parameters';
import { ExecutorParameterLiteral } from '../../Parameters/types/CustomParameterLiterals.types';
import { ExecutableProperties } from './ExecutorParameters.types';
import { MachineResourceClassArm, MachineResourceClassGPU } from './MachineExecutor.types';
import { MacOSResourceClassAdvanced } from './MacOSExecutor.types';
import { ReusedExecutorShape } from './ReusableExecutor.types';
export type UnknownExecutableShape = {
    resource_class: AnyResourceClass;
    [key: string]: unknown;
};
/**
 * The executor output shapes for YAML string
 */
export type ExecutorShape = {
    resource_class: string;
} & Partial<Record<ExecutorLiteral, unknown>> & ExecutableProperties;
export type AnyExecutorShape = ExecutorShape | ReusedExecutorShape;
/**
 * All valid resource classes found for an executor object for standard use cases
 */
export type AnyResourceClassBase = 'small' | 'medium' | 'medium+' | 'large' | 'xlarge' | '2xlarge' | '2xlarge+';
/**
 * The valid resource classes for advanced use cases
 */
export type AnyResourceClassExtended = MachineResourceClassArm | MachineResourceClassGPU | MacOSResourceClassAdvanced;
/**
 * All valid resource classes found for an executor object
 */
export type AnyResourceClass = AnyResourceClassBase | AnyResourceClassExtended;
/**
 * The valid executors found on an executor object
 * Windows is covered by the machine literal
 */
export type ExecutorLiteral = 'docker' | 'machine' | 'macos';
/**
 * The valid executors found on an object referencing an executor
 */
export type ExecutorUsageLiteral = ExecutorLiteral | 'executor';
export type UnknownParameterized = {
    parameters?: {
        [key: string]: unknown;
    };
};
export type ReusableExecutorDefinition = {
    [key: string]: UnknownExecutableShape & UnknownParameterized;
};
export type ReusableExecutorDependencies = {
    parametersList?: CustomParametersList<ExecutorParameterLiteral>;
    executor: Executor;
};
export { type ExecutableParameters, type ExecutableProperties, } from './ExecutorParameters.types';
