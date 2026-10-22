import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AcNgIframeContentComponent } from './components/ac-iframe-content/ac-iframe-content.component';


@NgModule({
  imports: [
    CommonModule,
    AcNgIframeContentComponent
  ],
  exports: [
    AcNgIframeContentComponent
  ]
})
export class AcNgRuntimeModule { }
