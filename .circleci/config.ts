import {readConfigFile, writeFile} from "../src/lib/Config";
import {Workflow, BuildJob} from "../src/lib/Components/Workflow";

const buildConfig = readConfigFile(".circleci/test-config.yml")
  .getJobConfig("build");


const workflow = new Workflow("breaking-workspaces")
  .addJob(new BuildJob("build")
    .withConfig(buildConfig!)
    .withContext("org-global"));

writeFile(".circleci/processed-config.yml", workflow.generate());
