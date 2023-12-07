import { GenerableType } from '../../../Config/exports/Mapping';
import { Generable } from '../../index';
import {
  AnyResourceClass,
  ExecutorLiteral,
  ExecutorShape,
} from '../types/Executor.types';

/**
 * A generic reusable Executor.
 */
export abstract class Executor<
  ResourceClass extends AnyResourceClass = AnyResourceClass,
> implements Generable
{
  resource_class: ResourceClass;

  /**
   * @param resource_class - The resource class of the environment
   * @param parameters - Optional parameters to describe the executable environment
   */
  constructor(resource_class: ResourceClass) {
    this.resource_class = resource_class;
  }
  abstract get generableType(): GenerableType;
  abstract get executorLiteral(): ExecutorLiteral;
  abstract generateContents(): unknown;
  get generateResourceClass(): ResourceClass | string {
    return this.resource_class;
  }

  generate(flatten?: boolean): ExecutorShape {
    return {
      [this.executorLiteral]: this.generateContents(),
      resource_class: this.generateResourceClass,
    };
  }
}
