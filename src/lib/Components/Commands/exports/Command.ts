import { Generable } from '../../index';
import { AnyCommandShape, CommandParameters } from '../types/Command.types';

/**
 * Abstract - A generic Command
 */
export interface Command extends Generable {
  /**
   * The name of the CircleCI step, which will appear in the CircleCI UI.
   */
  name: string;
  /**
   * Step parameters
   */
  parameters?: CommandParameters;
  /**
   * Generate the JSON shape for the Command.
   * @param flatten - If true, short hand will be attempted.
   */
  generate(flatten?: boolean): AnyCommandShape;
}