import { AcElement } from "@autocode-ts/ac-runtime";
import { IAppMenuItem } from "src/_app.export";

@AcElement({
  selector: 'file-preview-page',
  template: `
    <div class="app-page">
      <app-header
        [title]="'AcFilePreview Test Page'"
        [dropdownItems]="dropdownItems"
      ></app-header>
      <div class="container py-4 flex-fill overflow-auto">
        <p class="mb-5 text-muted">Preview different file types including audio, images, and videos in the browser.</p>

        <div class="row g-4">
          <div class="col-md-6 col-lg-4">
            <div class="card h-100 shadow-sm border p-3">
              <h6 class="mb-3 text-primary"><i class="fa-solid fa-music me-2"></i> Audio Preview</h6>
              <div class="preview-box border rounded bg-light d-flex align-items-center justify-content-center p-2">
                <ac-file-preview file-path="assets/demo/sample-audio.mp3" class="w-100 h-100"></ac-file-preview>
              </div>
            </div>
          </div>

          <div class="col-md-6 col-lg-4">
            <div class="card h-100 shadow-sm border p-3">
              <h6 class="mb-3 text-success"><i class="fa-solid fa-image me-2"></i> Image Preview</h6>
              <div class="preview-box border rounded overflow-hidden">
                <ac-file-preview file-path="https://cdn.pixabay.com/photo/2025/11/02/10/07/duck-9168154_1280.jpg" class="w-100 h-100"></ac-file-preview>
              </div>
            </div>
          </div>

          <div class="col-md-6 col-lg-4">
            <div class="card h-100 shadow-sm border p-3">
              <h6 class="mb-3 text-danger"><i class="fa-solid fa-video me-2"></i> Video Preview</h6>
              <div class="preview-box border rounded overflow-hidden">
                <ac-file-preview file-path="assets/demo/sample-video.mp4" class="w-100 h-100"></ac-file-preview>
              </div>
            </div>
          </div>
        </div>

        <div class="mt-5 p-4 border rounded bg-white shadow-sm">
           <h5>Supported Formats</h5>
           <div class="d-flex flex-wrap gap-2 mt-3">
              <span class="badge bg-light text-dark border">MP3</span>
              <span class="badge bg-light text-dark border">WAV</span>
              <span class="badge bg-light text-dark border">JPG/PNG/GIF</span>
              <span class="badge bg-light text-dark border">MP4</span>
              <span class="badge bg-light text-dark border">PDF</span>
              <span class="badge bg-light text-dark border">TXT</span>
           </div>
        </div>
      </div>
    </div>
  `,
  styles: `
    .preview-box {
      height: 200px;
      position: relative;
    }
  `
})
export class FilePreviewPage {
  dropdownItems: IAppMenuItem[] = [{ label: 'Preview Tools', isHeader: true }];
}
