import { GenerableType } from '../../../Config/exports/Mapping';
import { ExecutorLiteral } from '../types/Executor.types';
import {
  MacOSExecutorShape,
  MacOSResourceClass,
} from '../types/MacOSExecutor.types';
import { Executor } from './Executor';

/**
 * A MacOS Virtual Machine with configurable Xcode version.
 * @see {@link https://circleci.com/docs/2.0/executor-types/#using-macos}
 */
export class MacOSExecutor extends Executor<MacOSResourceClass> {
  /**
   * Select an xcode version.
   * @see {@link https://circleci.com/developer/machine/image/macos}
   */
  xcode: string;
  constructor(xcode: string, resource_class: MacOSResourceClass = 'medium') {
    super(resource_class);
    this.xcode = xcode;
  }
  generateContents(): MacOSExecutorShape {
    return {
      xcode: this.xcode,
    };
  }

  get generableType(): GenerableType {
    return GenerableType.MACOS_EXECUTOR;
  }

  get executorLiteral(): ExecutorLiteral {
    return 'macos';
  }

  static from(d: any, resource_class: string) {
    if (!Object.hasOwn(d, 'xcode')) {
      throw new Error("Invalid MacOSExecutor config data");
    }
    // It's not up to config processing to decide what's a valid resource class,
    // at least not yet. So let's allow anything.
    return new MacOSExecutor(d.xcode, resource_class as MacOSResourceClass);
  }
}
