type FullscreenChangeCallback = (isFullscreen: boolean, element: Element | null) => void;

export const AcFullscreen = {
  /**
   * Returns true if any element is in fullscreen
   */
  isFullscreen(): boolean {
    const doc: any = document;
    return !!(doc.fullscreenElement || doc.webkitFullscreenElement || doc.mozFullScreenElement);
  },

  /**
   * Returns current fullscreen element
   */
  element(): Element | null {
    const doc: any = document;
    return doc.fullscreenElement || doc.webkitFullscreenElement || doc.mozFullScreenElement || null;
  },

  /**
   * Enter fullscreen
   * If no element provided → fullscreen entire document
   */
  async enter(element?: HTMLElement): Promise<void> {
    const target: any = element ?? document.documentElement;

    if (!this.isFullscreen()) {
      try {
        if (target.requestFullscreen) {
          await target.requestFullscreen();
        } else if (target.webkitRequestFullscreen) {
          await target.webkitRequestFullscreen();
        } else if (target.mozRequestFullScreen) {
          await target.mozRequestFullScreen();
        }
      } catch (err) {
        console.warn('Fullscreen request failed or is disallowed on this device', err);
      }
    }
  },

  /**
   * Exit fullscreen
   */
  async exit(): Promise<void> {
    const doc: any = document;
    if (this.isFullscreen()) {
      try {
        if (doc.exitFullscreen) {
          await doc.exitFullscreen();
        } else if (doc.webkitExitFullscreen) {
          await doc.webkitExitFullscreen();
        } else if (doc.mozCancelFullScreen) {
          await doc.mozCancelFullScreen();
        }
      } catch (err) {
        console.warn('Exit fullscreen failed', err);
      }
    }
  },

  /**
   * Toggle fullscreen
   */
  async toggle(element?: HTMLElement) {
    if (this.isFullscreen()) {
      await this.exit();
    } else {
      await this.enter(element);
    }
  },

  /**
   * Listen for fullscreen changes
   * Returns unsubscribe function
   */
  onChange(callback: FullscreenChangeCallback) {
    const handler = () => {
      callback(this.isFullscreen(), this.element());
    };

    document.addEventListener("fullscreenchange", handler);
    document.addEventListener("webkitfullscreenchange", handler);
    document.addEventListener("mozfullscreenchange", handler);

    return () => {
      document.removeEventListener("fullscreenchange", handler);
      document.removeEventListener("webkitfullscreenchange", handler);
      document.removeEventListener("mozfullscreenchange", handler);
    };
  }
};
