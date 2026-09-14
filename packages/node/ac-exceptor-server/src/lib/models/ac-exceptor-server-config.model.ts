import { kAcExceptorServerDataDictionaryName } from '../data-dictionary/ac-exceptor-server-data-dictionary';

export class AcExceptorServerConfig {
  dataDictionaryName: string = kAcExceptorServerDataDictionaryName;
  routePrefix: string = '/api/v1/exceptions';
  enableAutoMigration: boolean = true;

  constructor(init?: Partial<AcExceptorServerConfig>) {
    if (init) {
      Object.assign(this, init);
    }
  }
}
