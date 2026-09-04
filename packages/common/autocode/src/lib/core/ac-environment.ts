import { AcEnumEnvironment } from "../enums/ac-enum-environment.enum";


export class AcEnvironment {
  static environment: AcEnumEnvironment = AcEnumEnvironment.Development;
  static config: { [key: string]: any } = {};

  static isDevelopment(): boolean {
    return this.environment === AcEnumEnvironment.Development;
  }

  static isProduction(): boolean {
    return this.environment === AcEnumEnvironment.Production;
  }

  static isStaging(): boolean {
    return this.environment === AcEnumEnvironment.Staging;
  }

  static isLocal(): boolean {
    return this.environment === AcEnumEnvironment.Local;
  }
}

