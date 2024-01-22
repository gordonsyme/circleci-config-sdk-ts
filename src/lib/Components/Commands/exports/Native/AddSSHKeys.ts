import { GenerableType } from '../../../../Config/exports/Mapping';
import { ListParameter } from '../../../Parameters/types';
import { CommandParameters, CommandShape } from '../../types/Command.types';
import { Command } from '../Command';

/**
 * The AddSSHKeys command is a special step that adds SSH keys from a project’s settings to a container. Also configures SSH to use these keys.
 * @see {@link https://circleci.com/docs/configuration-reference#add-ssh-keys}
 */
export class AddSSHKeys implements Command {
  parameters: AddSSHKeysParameters;
  constructor(parameters: AddSSHKeysParameters) {
    this.parameters = parameters;
  }
  /**
   * Generate AddSSHKeys Command shape.
   * @returns The generated JSON for the AddSSHKeys Command.
   */
  generate(): AddSSHKeysCommandShape {
    const command = { add_ssh_keys: {} };
    command.add_ssh_keys = { ...command.add_ssh_keys, ...this.parameters };
    return command as AddSSHKeysCommandShape;
  }

  get name(): string {
    return 'add_ssh_keys';
  }

  get generableType(): GenerableType {
    return GenerableType.ADD_SSH_KEYS;
  }

  static from(d: any): AddSSHKeys {
    if (!validateData(d)) {
      throw new Error("Invalid add_ssh_key command config");
    }

    return new AddSSHKeys(d.add_ssh_keys);
  }
}

function validateData(d: any): d is AddSSHKeysCommandShape {
  const {add_ssh_keys} = d;
  if (!add_ssh_keys) {
    return false;
  }

  const {fingerprints} = add_ssh_keys;

  if (!Array.isArray(fingerprints)) {
    return false;
  }

  for (const fingerprint of fingerprints) {
    if (typeof(fingerprint) !== 'string') {
      return false;
    }
  }

  return true;
}

/**
 * Command parameters for the AddSSHKeys command
 */
export interface AddSSHKeysParameters extends CommandParameters {
  /**
   * List of fingerprints corresponding to the keys to be added.
   */
  fingerprints: ListParameter;
}

/**
 * JSON shape for the AddSSHKeys command.
 */
interface AddSSHKeysCommandShape extends CommandShape {
  add_ssh_keys: AddSSHKeysParameters;
}
