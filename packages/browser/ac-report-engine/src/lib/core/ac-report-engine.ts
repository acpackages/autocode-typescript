/* eslint-disable @typescript-eslint/no-inferrable-types */
/* eslint-disable @typescript-eslint/no-unsafe-function-type */
import { AcPipeRegistry, AcPipeTransform } from "@autocode-ts/ac-pipes";

export class AcReportEngine {
  private static customPipes: Record<string, Function> = {};
  private static isInitialized: boolean = false;

  static logError: Function = (...args: any[]) => {
    // console.error(args);
  };

  static logWarn: Function = (...args: any[]) => {
    // console.warn(args);
  };

  static registerPipe(name: string, transform: AcPipeTransform): void {
    const key = name.toLowerCase();
    AcReportEngine.customPipes[key] = transform;
    AcPipeRegistry.register({ name, transform });
  }

  static getPipe(name: string): Function | undefined {
    return AcReportEngine.customPipes[name.toLowerCase()];
  }

  static getCustomPipes(): Record<string, Function> {
    return { ...AcReportEngine.customPipes };
  }

  static init() {
    if (AcReportEngine.isInitialized) {
      return;
    }
    AcReportEngine.isInitialized = true;
  }
}
