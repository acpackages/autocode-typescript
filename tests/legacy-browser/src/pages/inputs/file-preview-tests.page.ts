/* eslint-disable @typescript-eslint/no-inferrable-types */
import { acInit } from '@autocode-ts/ac-browser';

export class FilePreviewTestPage extends HTMLElement {
  connectedCallback() {
    acInit();
    this.innerHTML = `
      <div>
      Sample Extension
      <div style="width:250px;height:150px">
        <ac-file-preview file-path="hello.mp3" style="border:solid 1px #555;height:125px;"></ac-file-preview>
      </div>
      </div>
      <div>
      Image
      <div style="width:250px;height:250px">
        <ac-file-preview file-path="https://cdn.pixabay.com/photo/2025/10/02/10/07/duck-9868154_1280.jpg" style="border:solid 1px #555;height:125px;padding:10px;boder-radius:12px;"></ac-file-preview>
      </div>
      </div>
    `;
  }
}
