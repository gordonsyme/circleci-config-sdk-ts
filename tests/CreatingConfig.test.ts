import { Workflow } from "../src";
import { DockerExecutor } from "../src/lib/Components/Executors";
import { ApprovalJob, BuildJob, BuildJobConfig } from "../src/lib/Components/Job";

describe("I can create a config entirely in code", () => {
  const executor = new DockerExecutor("cimg/clojure:1.11.1");
  const build = new BuildJob("build", new BuildJobConfig("build", executor));
  const test = new BuildJob("test", new BuildJobConfig("test", executor));
  const approve = new ApprovalJob("approve");
  const deploy = new BuildJob("deploy", new BuildJobConfig("deploy", executor))
    .withContext("deploy-credentials");

  const workflow = new Workflow("breaking-workspaces")
    .addJob(build)
    .addJob(test)
    .addJob(approve, [test])
    .addJob(deploy, [build, test]);
  
  expect(workflow.generate()).toBeDefined();
})

describe("I can load a simple config from YAML", () => {
  expect(false).toBe(true);
})

describe("I can load a job from YAML and use it in a workflow created from code", () => {
  expect(false).toBe(true);
})

describe("I can create matrix jobs in code", () => {
  expect(false).toBe(true);
})

describe("I can perform branch filtering easily in code", () => {
  expect(false).toBe(true);
})

describe("I can perform step filtering easily in code", () => {
  expect(false).toBe(true);
})