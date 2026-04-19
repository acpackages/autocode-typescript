import { AcHttp } from '@autocode-ts/autocode';

export class HttpTestPage extends HTMLElement {

  connectedCallback() {
    AcHttp.getPromise({url:'http://localhost:8081/api/customers/get'}).then((response:any)=>{
      console.log(response);
    });
  }
}
