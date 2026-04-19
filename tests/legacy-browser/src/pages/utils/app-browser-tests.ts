import { acWebviewChannel, AcWebviewChannel } from '@autocode-ts/ac-browser';
import { AcHttp } from '@autocode-ts/autocode';

export class AppBrowserTestPage extends HTMLElement {

  connectedCallback() {
    this.innerHTML = `App Browser Detected : ${acWebviewChannel.isAppBrowser()}`;
    acWebviewChannel.send({data:'Welcome test'});
    acWebviewChannel.performAction({name:'test_action',callback:(response:any)=>{
      this.innerHTML += "<br> Found test action callback";
      console.log(response);
    }})
  }
}
