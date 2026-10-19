export interface IAcOverlayScrollbarOptions {
  /** The scrollable element (e.g. ac-datagrid-body, ac-repeater-body) */
  target: HTMLElement;
  /** Host element where scrollbar tracks are mounted. Defaults to target. */
  host?: HTMLElement;
  /** Enable vertical overlay scrollbar. Default: true */
  vertical?: boolean;
  /** Enable horizontal overlay scrollbar. Default: true */
  horizontal?: boolean;
  /** Delay in milliseconds before auto-hiding the scrollbar. Default: 1000 */
  autoHideDelay?: number;
  /** Minimum thumb length in pixels. Default: 24 */
  minThumbSize?: number;
  /** Custom CSS class prefix or extra class name */
  className?: string;
  /** Callback on scroll or update */
  onScroll?: (event: Event) => void;
}
