import { BuildJobConfig } from "../../Job";

type JobType = "build" | "approval" | "release";
type ConfigType = BuildJobConfig | undefined;

type Context = string;

export interface Job {
  name: string;
  type: JobType;
  context?: Set<Context>;
  config?: ConfigType;

  withContext(ctxt: Context): Job;
  withConfig(cfg: ConfigType): Job;
}

class JobBase implements Job {
  name: string;
  type: JobType;
  context?: Set<Context>;
  config?: ConfigType;

  constructor(name: string, type: JobType) {
    this.name = name;
    this.type = type;
  }

  withContext(ctxt: Context): Job {
    this.context = this.context ? this.context : new Set();
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

  withConfig(cfg: undefined): Job {
    return this;
  }
}

type AdjacencyLists = Map<string, Set<string>>;

function addEdge(adj: AdjacencyLists, source: Job, dest: Job): AdjacencyLists {
  const edges = adj.get(source.name) || new Set();
  edges.add(dest.name);
  adj.set(source.name, edges);
  return adj;
}

export class Workflow {
  name: string;
  jobs: Job[] = [];
  adj: AdjacencyLists = new Map();

  constructor(name: string) {
    this.name = name;
  }

  addJob(j: Job, deps?: Job[]): Workflow {
    this.jobs.push(j);
    for (const d of deps || []) {
      this.adj = addEdge(this.adj, d, j)
    }
    return this;
  }

  makeYamlGoNow(): string {
    return "";
  }
}