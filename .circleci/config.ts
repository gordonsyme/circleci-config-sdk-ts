import {Workflow, BuildJob, ApprovalJob} from "../src/lib/Components/Workflow";
import { BuildJobConfig } from "../src/lib/Components/Job";

const build = new BuildJob("build")
  .withConfig(BuildJobConfig.from("build",
    {docker: [{image: "python:2.7"}],
     resource_class: "medium",
     steps: ["checkout",
             {run: {name: "make some files",
                    command: `
mkdir -p /tmp/my_workspace
echo "first artifact" > /tmp/my_workspace/first
echo "second artifact" > /tmp/my_workspace/second
mkdir -p /tmp/my_workspace/python
echo "print(\"hello, world\")" > hello.py
cp hello.py /tmp/my_workspace/python/`}},
             {persist_to_workspace: {root: "/tmp/my_workspace",
                                     paths: ["*"]}},
             {store_artifacts: {path: "/tmp/my_workspace",
                                destination: "text-data"}}]}));

const workflow = new Workflow("breaking-workspaces")
  .addJob(build)
  .addJob(new ApprovalJob("approve"), ["build"]);

workflow.generateConfig();
