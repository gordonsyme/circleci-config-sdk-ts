import { Generable } from "../..";
import { GenerableType } from "../../../Config/exports/Mapping";
import { CircleCIConfigShape } from "../../../Config/types";
import { BuildJobConfig } from "../../Job";
import { WorkflowContentsShape } from "../types";
declare type JobType = "build" | "approval" | "release";
declare type ConfigType = BuildJobConfig | undefined;
declare type Context = string;
export interface Job {
    name: string;
    type: JobType;
    context: Set<Context>;
    config?: ConfigType;
    withContext(ctxt: Context): Job;
    withConfig(cfg: ConfigType): Job;
}
export declare class JobBase implements Job {
    name: string;
    type: JobType;
    context: Set<Context>;
    config?: ConfigType;
    constructor(name: string, type: JobType);
    withContext(ctxt: Context): Job;
    withConfig(cfg: ConfigType): Job;
}
export declare class BuildJob extends JobBase {
    constructor(name: string);
    withConfig(cfg: BuildJobConfig): Job;
}
export declare class ApprovalJob extends JobBase {
    constructor(name: string);
    withConfig(_cfg: undefined): Job;
}
declare type AdjacencyLists = Map<string, Set<string>>;
export declare class Workflow implements Generable {
    name: string;
    jobs: Job[];
    adj: AdjacencyLists;
    constructor(name: string);
    addJob(j: Job, deps?: string[]): Workflow;
    addJob(j: Job, deps?: Job[]): Workflow;
    private requiresFor;
    generateConfig(): void;
    generate(flatten?: boolean): CircleCIConfigShape;
    generateContents(flatten?: boolean): WorkflowContentsShape;
    generableType: GenerableType;
    static from(name: string, d: any, jobConfigs: Map<string, BuildJobConfig>): Workflow;
    static default(scriptName: string, image?: string): Workflow;
}
export {};
//# sourceMappingURL=NewWorkflow.d.ts.map