import { Workflow, BuildJob, Job, ApprovalJob } from "../src/lib/Components/Workflow";
import { BuildJobConfig } from "../src/lib/Components/Job";
import { DockerExecutor} from "../src/lib/Components/Executors";
import { Command } from "../src/lib/Components/Commands/exports/Command";
import { Checkout, Run } from "../src/lib/Components/Commands";

function testNode(version: string): Job {
  const name = `test-node-${version}`.replace(".", "-");
  const executor = new DockerExecutor(`cimg/node:${version}`);
  const steps: Array<Command> = [
    new Checkout(),
    new Run({ name: "Install dependencies", command: "npm install" }),
    new Run({ name: "Run tests", command: "npm test -- --coverageThreshold '{}'" }),
  ]

  return new BuildJob(name)
    .withConfig(new BuildJobConfig(name, executor, steps));
}

const workflow = new Workflow("breaking-workspaces")
  .addJob(new ApprovalJob("hold"));

const testJobs = ["current", "lts", "16.12", "15.14"].map((version) => {
  return testNode(version);
});

testJobs.forEach((j) => {
  workflow.addJob(j, ["hold"])
});

workflow.addJob(new ApprovalJob("final-hold"), testJobs);

workflow.generateConfig();
