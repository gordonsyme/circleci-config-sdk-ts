import { GenerableType } from '../../../../../Config/exports/Mapping';
import { ListParameter, StringParameter } from '../../../../Parameters/types';
import { CommandParameters, CommandShape } from '../../../types/Command.types';
import { Command } from '../../Command';
/**
 * Restores a previously saved cache based on a key. A cache must have been previously created using the Save step.
 * @see {@link https://circleci.com/docs/configuration-reference#restorecache}
 */
export class Restore implements Command {
  parameters: RestoreCacheParameters;
  constructor(parameters: RestoreCacheParameters) {
    this.parameters = parameters;
  }
  /**
   * Generate Restore.cache Command shape.
   * @returns The generated JSON for the Restore.cache Command.
   */
  generate(): RestoreCacheCommandShape {
    return {
      restore_cache: { ...this.parameters },
    };
  }

  get name(): StringParameter {
    return 'restore_cache';
  }

  get generableType(): GenerableType {
    return GenerableType.RESTORE;
  }

  static from(d: any): Restore {
    if (!validateData(d)) {
      throw new Error("Invalid restore_cache command config");
    }

    return new Restore(d.restore_cache);
  }
}

function validateData(d: any): d is RestoreCacheCommandShape {
  const {restore_cache} = d;
  if (!restore_cache) {
    return false;
  }

  const {key, keys} = restore_cache;
  if (key) {
    return typeof(key) === 'string';
  }

  if (!keys || !Array.isArray(keys)) {
    return false;
  }

  for (const k of keys) {
    if (typeof(k) !== 'string') {
      return false;
    }
  }

  return true;
}

/**
 * Command parameters for the RestoreCache command
 */
export interface RestoreCacheParameters extends CommandParameters {
  /**
   * List of cache keys to lookup for a cache to restore. Only first existing key will be restored.
   */
  readonly keys?: ListParameter;
  readonly key?: StringParameter;
}
/**
 * Generated Shape of the RestoreCache command.
 */
interface RestoreCacheCommandShape extends CommandShape {
  restore_cache: RestoreCacheParameters;
}
