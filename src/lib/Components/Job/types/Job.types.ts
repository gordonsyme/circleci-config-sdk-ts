import { Command } from '../../Commands/exports/Command';
import { Executor } from '../../Executors';
import {
  AnyExecutorShape,
  ExecutableProperties,
} from '../../Executors/types/Executor.types';
import { CustomParametersList } from '../../Parameters';
import {
  CustomParametersListShape,
  EnvironmentParameter,
} from '../../Parameters/types';
import { JobParameterLiteral } from '../../Parameters/types/CustomParameterLiterals.types';

export type JobCommonContents = {
  steps: unknown[];
  parallelism?: number;
}

export type JobContentsShape = JobCommonContents &
  AnyExecutorShape & JobEnvironmentShape;

export type JobsShape = {
  [key: string]: JobContentsShape;
};

export type JobEnvironmentShape = {
  environment?: EnvironmentParameter;
};

export type AnyExecutor = Executor;

export type ParameterizedJobContents = JobContentsShape & {
  parameters: CustomParametersListShape;
};

export type JobDependencies = {
  executor: AnyExecutor;
  steps: Command[];
  parametersList?: CustomParametersList<JobParameterLiteral>;
};

export type JobOptionalProperties = {
  parallelism?: number;
} & ExecutableProperties;

export type UnknownJobShape = {
  [key: string]: unknown;
  steps: { [key: string]: unknown }[];
  resource_class: string;
  parameters?: { [key: string]: unknown };
  environment?: { [key: string]: string };
};
