import { isNode } from 'browser-or-node';
import { Generable } from "../..";
import { GenerableType } from "../../../Config/exports/Mapping";
import { CircleCIConfigShape } from "../../../Config/types";
import { BuildJobConfig } from "../../Job";
import { JobsShape } from "../../Job/types/Job.types";
import { WorkflowContentsShape, WorkflowJobContentsShape } from "../types";

type JobType = "build" | "approval" | "release";
type ConfigType = BuildJobConfig | undefined;

type Context = string;

export interface Job {
  name: string;
  type: JobType;
  context: Set<Context>;
  config?: ConfigType;

  withContext(ctxt: Context): Job;
  withConfig(cfg: ConfigType): Job;
}

class JobBase implements Job {
  name: string;
  type: JobType;
  context: Set<Context>;
  config?: ConfigType;

  constructor(name: string, type: JobType) {
    this.name = name;
    this.type = type;
    this.context = new Set();
  }

  withContext(ctxt: Context): Job {
    this.context.add(ctxt);
    return this;
  }

  withConfig(cfg: ConfigType): Job {
    this.config = cfg;
    return this;
  }
}

export class BuildJob extends JobBase {
  constructor(name: string) {
    super(name, "build");
  }

  withConfig(cfg: BuildJobConfig): Job {
    super.withConfig(cfg);
    return this;
  }
}

export class ApprovalJob extends JobBase {
  constructor(name: string) {
    super(name, "approval");
  }

  withConfig(_cfg: undefined): Job {
    return this;
  }
}

type AdjacencyLists = Map<string, Set<string>>;

function addEdge(adj: AdjacencyLists, source: string, dest: string): AdjacencyLists {
  const edges = adj.get(source) || new Set();
  edges.add(dest);
  adj.set(source, edges);
  return adj;
}

export class Workflow implements Generable {
  name: string;
  jobs: Job[] = [];
  adj: AdjacencyLists = new Map();

  constructor(name: string) {
    this.name = name;
  }

  addJob(j: Job, deps?: string[]): Workflow
  addJob(j: Job, deps?: Job[]): Workflow
  addJob(j: Job, deps?: string[] | Job[]): Workflow {
    this.jobs.push(j);
    // Make sure that this job appears as a source in the adjacency list
    if (!this.adj.has(j.name)) {
      this.adj.set(j.name, new Set());
    }

    for (const d of deps || []) {
      if (typeof(d) === 'string') {
        this.adj = addEdge(this.adj, d, j.name);
      }
      else {
        this.adj = addEdge(this.adj, d.name, j.name);
      }
    }
    return this;
  }

  private requiresFor(j: Job): string[] {
    const requires = new Array<string>();
    this.adj.forEach((targets, source) => {
      if (targets.has(j.name)) {
        requires.push(source);
      }
    });
    return requires;
  }

  generateConfig() {
    if (isNode) {
      process.stdout.write(JSON.stringify(this.generate()));
    } else {
      throw new Error('Unsupported environment');
    }
  }

  generate(flatten?: boolean): CircleCIConfigShape {
    return {
      version: 2.1,
      setup: false,
      jobs: this.jobs.reduce((acc, j) => {
        if (j.config) {
          acc[j.name] = j.config.generateContents();
        }
        return acc;
      }, ({} as JobsShape)),
      workflows: {
        [this.name]: this.generateContents(flatten),
      }
    };
  }

  generateContents(flatten?: boolean): WorkflowContentsShape {
    return {jobs: this.jobs.map((j) => {
      const contexts = Array.from(j.context.values());
      const requires = Array.from(this.requiresFor(j));

      const jobCfg: WorkflowJobContentsShape = {
        context: contexts,
        requires: requires
      }
      if (j.type === 'approval') {
        jobCfg.type = "approval";
      }

      return {
        [j.name]: jobCfg
      }
    })};
  }
  generableType = GenerableType.WORKFLOW;

  static from(name: string, d: any, jobConfigs: Map<string, BuildJobConfig>): Workflow {
    if (!validateData(d)) {
      throw new Error("Invalid workflow configuration: " + d);
    }

    const workflow = d.jobs.reduce((acc, j) => {
      const { job, requires } = jobFrom(j, jobConfigs);
      acc.addJob(job, requires);
      return acc;
    }, new Workflow(name));

    checkGraph(workflow);

    return workflow;
  }

  static default(scriptName: string, image = "cimg/base:current"): Workflow {
    const runScript = new BuildJob("run-script")
      .withConfig(BuildJobConfig.from("build",
        {
          docker: [{ image: image }],
          resource_class: "medium",
          steps: [
            "checkout",
            {
              run: {
                name: `Run ${scriptName}`,
                command: `bash "${scriptName}"`
              }
            }
          ]
        }
      ));

    return new Workflow("default")
      .addJob(runScript);
  }
}

function validateData(d: any): d is WorkflowContentsShape {
  const { jobs } = d;
  if (!jobs || !Array.isArray(jobs)) {
    return false;
  }

  return true;
}

type WorkflowJobData = {
  job: Job,
  requires: string[]
}

function jobFrom(d: any, jobConfigs: Map<string, BuildJobConfig>): WorkflowJobData {
  // Plain string references a build job
  if (typeof(d) === 'string') {
    return {
      job: makeBuildJob(d, [], jobConfigs),
      requires: []
    };
  }

  if (Object.keys(d).length !== 1) {
    throw new Error("Invalid workflow jobs config: too many keys: " + Object.keys(d));
  }

  const name = Object.keys(d)[0];
  const {context, requires, type} = d[name];

  if (context) {
    if (!Array.isArray(context)) {
      throw new Error("Invalid workflow jobs config: bad context - not array");
    }
    for (const req of context) {
      if (typeof(req) !== 'string') {
        throw new Error("Invalid workflow jobs config: bad context - not string");
      }
    }
  }

  if (requires) {
    if (!Array.isArray(requires)) {
      throw new Error("Invalid workflow jobs config: bad requires - not array");
    }
    for (const req of requires) {
      if (typeof(req) !== 'string') {
        throw new Error("Invalid workflow jobs config: bad requires - not string");
      }
    }
  }

  const validTypes = new Set(["build", "approval"]);
  if (type && !validTypes.has(type)) {
    throw new Error("Invalid workflow jobs config: bad type");
  }

  switch (type) {
    case "build":
    case undefined:
      return {
        job: makeBuildJob(name, context, jobConfigs),
        requires: requires
      };
    case "approval":
      return {
        job: makeApprovalJob(name, context),
        requires: requires
      }
    default:
      throw new Error("Invalid workflow jobs config: unknown job type");
  }
}

function makeBuildJob(name: string, context: string[] = [], jobConfigs: Map<string, BuildJobConfig>): Job {
  const j = context.reduce((acc, c) => {
    return acc.withContext(c)
  }, new BuildJob(name));

  const cfg = jobConfigs.get(name);
  if (!cfg) {
    throw new Error("Missing config for \"build\" job " + name);
  }

  return j.withConfig(cfg);
}

function makeApprovalJob(name: string, context: string[] = []): Job {
  return context.reduce((acc, c) => {
    return acc.withContext(c);
  }, new ApprovalJob(name));
}

function checkGraph(w: Workflow) {
  // assert that every key of adj refers to a job in the jobs array
  // assert that every destintation refers to a job in the jobs array

  let xs = new Set<string>();
  w.adj.forEach((targets, source) => {
    xs.add(source);
    targets.forEach((t => {
      xs.add(t)
    }));
  });

  let jobNames = w.jobs.reduce((acc, j) => {
    acc.add(j.name)
    return acc
  },
  new Set<string>())

  return xs === jobNames;
}