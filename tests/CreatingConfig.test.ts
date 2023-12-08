import { DockerExecutor } from "../src/lib/Components/Executors";
import { BuildJobConfig } from "../src/lib/Components/Job";
import { Workflow, ApprovalJob, BuildJob} from "../src/lib/Components/Workflow/exports/NewWorkflow";
import { readConfigFile } from "../src/lib/Config";

describe("New Config SDK", () => {
  it("can create a config entirely in code", () => {
    const executor = new DockerExecutor("cimg/clojure:1.11.1");
    const buildJobConfig = new BuildJobConfig("foo", executor);

    const build = new BuildJob("myGreatBuildJob")
      .withConfig(buildJobConfig);

    const test = new BuildJob("test")
      .withConfig(buildJobConfig);

    const approve = new ApprovalJob("approve");

    const deploy = new BuildJob("deploy")
      .withConfig(new BuildJobConfig("deploy", executor))

    const workflow = new Workflow("breaking-workspaces")
      .addJob(build)
      .addJob(approve, [test])
      .addJob(deploy, [build, test]);

    console.log(JSON.stringify(workflow.generate()));
    expect(workflow.generate()).toBeDefined();
  })

  it("can load a simple config from YAML", () => {
    const config = readConfigFile(".circleci/test-config.yml");

    const buildConfig = config.getJobConfig("build");
    if (!buildConfig) {
      throw new Error("Expected a job called \"build\"");
    }

    const workflow = new Workflow("breaking-workspaces")
      .addJob(new BuildJob("build")
                .withConfig(buildConfig)
                .withContext("org-global"));
    
    console.log("workflow is: " + JSON.stringify(workflow.generate()));

    expect(workflow.adj.size).toBe(1);
    expect(workflow.generate()).toBeDefined();
  });

  it("can load a job from YAML and use it in a workflow created from code", () => {
    // import { standardWorkflow } from "../my.company.com/stuff"
    // .. create my job in code...
    // config = standardWorkflow(myJob)
    //expect(false).toBe(true);
  })

  it("can create matrix jobs in code", () => {
    /*const executor = new DockerExecutor("cimg/clojure:1.11.1");
    const build = new BuildJob("build", new BuildJobConfig("build", executor));
    const test = new BuildJob("test", new BuildJobConfig("test", executor));
    const approve = new ApprovalJob("approve");
    const deploy = new BuildJob("deploy", new BuildJobConfig("deploy", executor))
      .withContext("deploy-credentials");
  
    buildJobs = ["aarch64", "x86_64"].map(buildJob);
  
    const workflow = makeWorkflow("breaking-workspaces");
      .addJobs(buildJobs, [test])
      .addJob(approve, [test])
      .addJob(deploy, [build, test]);
    
    expect(makeYamlGoNow(workflow)).toBeDefined();*/
  })

  it("can perform branch filtering easily in code", () => {
    //expect(false).toBe(true);
  })

  it("can perform step filtering easily in code", () => {
    //expect(false).toBe(true);
  })
})