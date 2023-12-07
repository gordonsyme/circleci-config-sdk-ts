import { GenerableType } from '../../../../Config/exports/Mapping';
import { StringParameter } from '../../../Parameters/types';
import { CommandParameters, CommandShape } from '../../types/Command.types';
import { Command } from '../Command';

/**
 * Step to store artifacts (for example logs, binaries, etc) to be available in the web app or through the API.
 * @see {@link https://circleci.com/docs/configuration-reference#storeartifacts}
 */
export class StoreArtifacts implements Command {
  parameters: StoreArtifactsParameters;
  constructor(parameters: StoreArtifactsParameters) {
    this.parameters = parameters;
  }
  /**
   * Generate StoreArtifacts Command shape.
   * @returns The generated JSON for the StoreArtifacts Commands.
   */
  generate(): StoreArtifactsCommandShape {
    return {
      store_artifacts: { ...this.parameters },
    };
  }

  get name(): StringParameter {
    return 'store_artifacts';
  }

  get generableType(): GenerableType {
    return GenerableType.STORE_ARTIFACTS;
  }

  static from(d: any): StoreArtifacts {
    if (!validateData(d)) {
      throw new Error("Invalid store_artifacts command config");
    }

    return new StoreArtifacts(d.store_artifacts);
  }
}

function validateData(d: any): d is StoreArtifactsCommandShape {
  const {store_artifacts} = d;
  if (!store_artifacts) {
    return false;
  }

  const {path, destination} = store_artifacts;
  if (typeof(path) !== 'string') {
    return false;
  }

  if (destination && typeof(destination) !== 'string') {
    return false;
  }

  return true;
}

/**
 * Command parameters for the StoreArtifacts command
 */
export interface StoreArtifactsParameters extends CommandParameters {
  /**
   * Directory in the primary container to save as job artifacts
   */
  path: StringParameter;
  /**
   * Prefix added to the artifact paths in the artifacts API (default: the directory of the file specified in path)
   */
  destination?: StringParameter;
}

/**
 * Generated Shape of the StoreArtifacts command.
 */
interface StoreArtifactsCommandShape extends CommandShape {
  store_artifacts: StoreArtifactsParameters;
}
