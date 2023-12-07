import { Pair } from 'yaml';
import { Generable } from '../..';
import { GenerableType } from '../../../Config/exports/Mapping';
import { BuildJobConfig } from '../../Job';
import { When } from '../../Logic';
import { Conditional } from '../../Logic/exports/Conditional';
import {
  WorkflowContentsShape,
  WorkflowJobParameters,
  WorkflowsShape,
} from '../types';
import { WorkflowJob } from './WorkflowJob';
import { WorkflowJobAbstract } from './WorkflowJobAbstract';
import { WorkflowJobApproval } from './WorkflowJobApproval';

/**
 * A workflow is a set of rules for defining a collection of jobs and their run order.
 */
export class Workflow implements Generable {
  /**
   * The name of the Workflow.
   */
  name: string;
  adjacencyLists: Map<string, Set<string>> = new Map();

  /**
   * Instantiate a Workflow
   * @param name - Name your workflow. Must be unique.
   * @param jobs - A list of jobs to be executed as part of your Workflow.
   */
  constructor(
    name: string,
    jobs?: Array<BuildJobConfig | WorkflowJobAbstract>,
  ) {
    this.name = name;
  }

  /**
   * Generate Workflow Shape.
   * @returns The generated JSON for the Workflow.
   */
  generate(flatten?: boolean): WorkflowsShape {
    return {
      [this.name]: this.generateContents(flatten),
    };
  }

  /**
   * Generate contents of the Workflow.
   */
  generateContents(flatten?: boolean): WorkflowContentsShape {
    const workflowContents: WorkflowContentsShape = {
      jobs: []
    };

    return workflowContents;
  }

  get generableType(): GenerableType {
    return GenerableType.WORKFLOW;
  }
}
