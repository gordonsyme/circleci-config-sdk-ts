import { GenerableType } from '../../../../../Config/exports/Mapping';
import { StringParameter } from '../../../../Parameters/types';
import { CommandParameters, CommandShape } from '../../../types/Command.types';
import { Command } from '../../Command';
/**
 * Special step used to attach the workflow’s workspace to the current container. The full contents of the workspace are downloaded and copied into the directory the workspace is being attached at.
 * @see {@link https://circleci.com/docs/configuration-reference#attachworkspace}
 */
export class Attach implements Command {
  parameters: AttachParameters;
  constructor(parameters: AttachParameters) {
    this.parameters = parameters;
  }
  /**
   * Generate Save.cache Command shape.
   * @returns The generated JSON for the Save.cache Commands.
   */
  generate(): AttachCommandShape {
    return {
      attach_workspace: { ...this.parameters },
    };
  }

  get name(): StringParameter {
    return 'attach_workspace';
  }

  get generableType(): GenerableType {
    return GenerableType.ATTACH;
  }

  static from(d: any): Attach {
    if (!validateData(d)) {
      throw new Error("Invalid attach_workspace command config");
    }

    return new Attach(d.attach_workspace);
  }
}

function validateData(d: any): d is AttachCommandShape {
  const {attach_workspace} = d;
  if (!attach_workspace) {
    return false;
  }

  const { at } = attach_workspace;
  if (typeof (at) !== 'string') {
    return false;
  }

  return true;
}

/**
 * Generated Shape of the Attach command.
 */
interface AttachCommandShape extends CommandShape {
  attach_workspace: AttachParameters;
}

/**
 * Command parameters for the Attach command
 */
export interface AttachParameters extends CommandParameters {
  /**
   * Directory to attach the workspace to.
   */
  at: StringParameter;
}
