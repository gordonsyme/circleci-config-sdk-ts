import { Pair } from 'yaml';
import { Generable } from '../..';
import { GenerableType } from '../../../Config/exports/Mapping';
import { BuildJobConfig, JobBase } from '../../Job';
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
export class Workflow implements Generable, Conditional {
  /**
   * The name of the Workflow.
   */
  name: string;
  jobs: JobBase[] = []
  adj: Map<string, Set<string>> = new Map();

  /**
   * The conditional statement that will be evaluated to determine whether to trigger this workflow.
   */
  when?: When;

  /**
   * Instantiate a Workflow
   * @param name - Name your workflow. Must be unique.
   * @param jobs - A list of jobs to be executed as part of your Workflow.
   */
  constructor(
    name: string,
    jobs?: Array<BuildJobConfig | WorkflowJobAbstract>,
    when?: When,
  ) {
    this.name = name;
    this.when = when;

    if (jobs) {
      this.jobs = jobs.map((job) =>
        job instanceof BuildJobConfig ? new WorkflowJob(job) : job,
      );
    }
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
    const generatedWorkflowJobs = this.jobs.map((job) => {
      return job.generate(flatten);
    });

    const generatedWhen = this.when?.generate();

    const workflowContents: WorkflowContentsShape = {
      jobs: generatedWorkflowJobs,
    };

    generatedWhen ? (workflowContents.when = generatedWhen) : null;

    return workflowContents;
  }

  private addEdges(...edges: Pair<JobBase, JobBase>[]) {
    /*  (reduce (fn [acc dep]
            (update-in acc [:adj dep] (fnil conj #{}) (:name job)))
          wflow
          deps))
    */
    edges.forEach(element => {
      this.adj
    });
  }

  addJob(job: JobBase, dependencies?: JobBase[]): this {
    this.addEdges();
    return this;
  }

  get generableType(): GenerableType {
    return GenerableType.WORKFLOW;
  }
}
