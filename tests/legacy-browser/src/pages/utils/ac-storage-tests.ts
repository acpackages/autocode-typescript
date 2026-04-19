import { acWebviewChannel, AcStorage } from '@autocode-ts/ac-browser';
import { AcHttp } from '@autocode-ts/autocode';

export class AcStorageTestPage extends HTMLElement {

  connectedCallback() {
    const storage: any = new AcStorage();

    // storage.onChange((key, val, old) => {
    //   console.log(`Changed: ${key} =`, val, `(was ${old})`);
    // });

    // storage.user = 'Sanket';
    // storage.role = 'Admin';
    // storage.user = 'Patel';

    console.log(storage.user);
    console.log(storage.keys());
    console.log(storage.values());
    console.log(storage);
    console.log(storage.toJson());
    storage.version = 2;
  }
}
