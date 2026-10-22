/* eslint-disable @angular-eslint/prefer-inject */
/* eslint-disable @typescript-eslint/no-inferrable-types */
/* eslint-disable @angular-eslint/no-output-on-prefix */
/* eslint-disable @angular-eslint/component-selector */
import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, Input, OnDestroy, Renderer2, ViewChild } from '@angular/core';
import { acNullifyInstanceProperties } from '@autocode-ts/autocode'

/**
 * Allowed URL schemes for stylesheet and script resources injected into the iframe.
 * Only `http:`, `https:`, and same-origin relative paths are permitted.
 * This prevents `javascript:`, `data:` and other dangerous schemes from being injected.
 */
const ALLOWED_URL_PATTERN = /^(https?:\/\/|\/[^/]|\.[./])/;

/**
 * Sanitize a resource URL before embedding it in iframe HTML.
 * Returns an empty string if the URL does not match an allowed scheme.
 */
function sanitizeUrl(url: string): string {
  const trimmed = url.trim();
  if (!trimmed) return '';
  if (ALLOWED_URL_PATTERN.test(trimmed)) return trimmed;
  console.warn(`[AcNgIframeContent] Rejected unsafe URL: ${trimmed}`);
  return '';
}

@Component({
    selector: 'ac-ng-iframe-content',
    templateUrl: './ac-iframe-content.component.html',
    styleUrl: './ac-iframe-content.component.css',
    standalone: true
})
export class AcNgIframeContentComponent implements AfterViewInit, OnDestroy {
  @ViewChild('iframeElement') iframeElement!: ElementRef;
  @ViewChild('contentContainer') contentContainer!: ElementRef;
  @Input() stylesheetUrls: string[] = [];
  @Input() scriptUrls: string[] = [];

  /**
   * Debounce delay (ms) between DOM mutations and iframe re-render.
   * Prevents thrashing when many nodes are mutated in quick succession
   * (e.g. on every keystroke inside a content-editable child).
   */
  @Input() debounceMs: number = 150;

  private mutationObserver!: MutationObserver;
  /** Timer id for the debounced MutationObserver callback (ANG-8). */
  private debounceTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(elementRef: ElementRef, private changeDetectorRef: ChangeDetectorRef, private renderer: Renderer2) {
  }

  ngAfterViewInit() {
    this.updateIframeContent();
    // ANG-8: Debounce the observer callback — a 150ms delay collapses bursts of
    // mutations (e.g. sequential DOM updates, typing) into a single re-render.
    this.mutationObserver = new MutationObserver(() => {
      if (this.debounceTimer !== null) clearTimeout(this.debounceTimer);
      this.debounceTimer = setTimeout(() => {
        this.debounceTimer = null;
        this.updateIframeContent();
      }, this.debounceMs);
    });
    this.mutationObserver.observe(this.contentContainer.nativeElement, {
      childList: true,
      subtree: true,
      attributes: true,
      characterData: true
    });
    this.changeDetectorRef.detectChanges();
  }

  printIframe() {
    const iframe = this.iframeElement.nativeElement;
    if (iframe.contentWindow) {
      iframe.contentWindow.focus();
      iframe.contentWindow.print();
    }
  }

  updateIframeContent() {
    const iframeEl = this.iframeElement.nativeElement;
    const iframeDoc: Document = iframeEl.contentDocument ?? iframeEl.contentWindow?.document;
    if (!iframeDoc) return;

    const content: string = this.contentContainer.nativeElement.innerHTML;

    // ANG-7: Build the iframe HTML using sanitized URLs only.
    // Invalid or dangerous URLs are dropped with a console warning.
    let iframeHtml = '<html><head>';
    for (const link of this.stylesheetUrls) {
      const safe = sanitizeUrl(link);
      if (safe) iframeHtml += `<link rel="stylesheet" href="${safe}"/>`;
    }
    for (const link of this.scriptUrls) {
      const safe = sanitizeUrl(link);
      if (safe) iframeHtml += `<script src="${safe}"><\/script>`;
    }
    iframeHtml += '</head><body>' + content + '</body></html>';

    iframeDoc.open();
    iframeDoc.write(iframeHtml);
    iframeDoc.close();
  }

  ngOnDestroy() {
    // Cancel any pending debounce timer
    if (this.debounceTimer !== null) {
      clearTimeout(this.debounceTimer);
      this.debounceTimer = null;
    }
    if (this.mutationObserver) {
      this.mutationObserver.disconnect();
    }
    acNullifyInstanceProperties({ instance: this });
  }
}