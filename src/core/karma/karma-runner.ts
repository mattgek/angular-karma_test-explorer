import { KarmaHttpClient } from "../integration/karma-http-client";
import { Logger } from "../shared/logger";
import { KarmaEventListener } from "../integration/karma-event-listener";
import { TestSuiteInfo } from "vscode-test-adapter-api";

export class KarmaRunner {
  public constructor(
    private readonly karmaEventListener: KarmaEventListener,
    private readonly logger: Logger,
    private readonly karmaHttpCaller: KarmaHttpClient
  ) {}

  public isKarmaRunning(): boolean {
    return this.karmaEventListener.isServerLoaded;
  }

  public async loadTests(): Promise<TestSuiteInfo[]> {
    const fakeTestPatternForSkippingEverything = "$#%#";
    const karmaRunParameters = this.karmaHttpCaller.createKarmaRunCallConfiguration(fakeTestPatternForSkippingEverything);
    this.karmaEventListener.lastRunTests = "";

    await this.karmaHttpCaller.callKarmaRunWithConfig(karmaRunParameters.config);

    return this.karmaEventListener.getLoadedTests();
  }

  public async runTests(tests: string[]): Promise<void> {
    this.log(tests);

    const karmaRunParameters = this.karmaHttpCaller.createKarmaRunCallConfiguration(tests);

    this.karmaEventListener.isTestRunning = true;
    this.karmaEventListener.lastRunTests = karmaRunParameters.tests;
    await this.karmaHttpCaller.callKarmaRunWithConfig(karmaRunParameters.config);
  }

  private log(tests: string[]): void {
    const [suit, ...description] = tests[0].split(" ");
    this.logger.info(`Running [ suite: ${suit}${description.length > 0 ? ", test: " + description.join(" ") : ""} ]`, {
      addDividerForKarmaLogs: true,
    });
  }
}