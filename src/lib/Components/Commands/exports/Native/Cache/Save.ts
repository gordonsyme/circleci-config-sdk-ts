import { GenerableType } from '../../../../../Config/exports/Mapping';
import { ListParameter, StringParameter } from '../../../../Parameters/types';
import { CommandParameters, CommandShape } from '../../../types/Command.types';
import { Command } from '../../Command';

/**
 * Generates and stores a cache of a file or directory of files such as dependencies or source code in our object storage. Later jobs can restore this cache.
 * @see {@link https://circleci.com/docs/configuration-reference#savecache}
 */
export class Save implements Command {
  parameters: SaveCacheParameters;
  constructor(parameters: SaveCacheParameters) {
    this.parameters = parameters;
  }
  /**
   * Generate Save Cache Command shape.
   * @returns The generated JSON for the Save Cache Commands.
   */
  generate(): SaveCacheCommandShape {
    return { save_cache: { ...this.parameters } };
  }

  get name(): StringParameter {
    return 'save_cache';
  }

  get generableType(): GenerableType {
    return GenerableType.SAVE;
  }

  static from(d: any): Save {
    if (!validateData(d)) {
      throw new Error("Invalid save_cache command config");
    }

    return new Save(d.save_cache);
  }
}

function validateData(d: any): d is SaveCacheCommandShape {
  const {save_cache} = d;
  if (!save_cache) {
    return false;
  }

  const {key, paths, when} = save_cache;

  if (!key || typeof (key) !== 'string') {
    return false;
  }

  const whenVals = new Set(['always', 'on_success', 'on_fail']);
  if (when && !whenVals.has(when)) {
    return false;
  }

  if (!paths || !Array.isArray(paths)) {
    return false;
  }

  for (const path of paths) {
    if (typeof (path) !== 'string') {
      return false;
    }
  }

  return true;
}

/**
 * Command parameters for the SaveCache command
 */
export interface SaveCacheParameters extends CommandParameters {
  /**
   * List of directories which should be added to the cache
   */
  paths: ListParameter;
  /**
   * Unique identifier for this cache
   */
  key: StringParameter;
  /**
   * Specify when to enable or disable the step.
   */
  when?: 'always' | 'on_success' | 'on_fail';
}
/**
 * Generated Shape of the SaveCache command.
 */
interface SaveCacheCommandShape extends CommandShape {
  save_cache: SaveCacheParameters;
}
