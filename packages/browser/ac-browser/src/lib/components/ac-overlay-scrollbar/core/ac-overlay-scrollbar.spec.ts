/**
 * @jest-environment jsdom
 */
import { AcOverlayScrollbar } from "./ac-overlay-scrollbar";

describe('AcOverlayScrollbar', () => {
  let container: HTMLElement;
  let target: HTMLElement;

  beforeEach(() => {
    container = document.createElement('div');
    container.style.width = '300px';
    container.style.height = '200px';
    container.style.position = 'relative';
    container.style.overflow = 'hidden';

    target = document.createElement('div');
    target.style.width = '100%';
    target.style.height = '100%';
    target.style.overflow = 'auto';

    container.appendChild(target);
    document.body.appendChild(container);
  });

  afterEach(() => {
    container.remove();
  });

  it('should initialize and apply overlay-scroll-container class', () => {
    const os = new AcOverlayScrollbar({
      target,
      host: container,
      vertical: true,
      horizontal: true,
    });

    expect(target.classList.contains('ac-overlay-scroll-container')).toBe(true);

    const vTrack = container.querySelector('.ac-os-track-v');
    const hTrack = container.querySelector('.ac-os-track-h');

    expect(vTrack).not.toBeNull();
    expect(hTrack).not.toBeNull();

    os.destroy();
  });

  it('should hide tracks when content does not overflow', () => {
    // In JSDOM, clientHeight and scrollHeight are 0 by default unless mocked
    Object.defineProperty(target, 'clientHeight', { configurable: true, value: 200 });
    Object.defineProperty(target, 'scrollHeight', { configurable: true, value: 200 });
    Object.defineProperty(target, 'clientWidth', { configurable: true, value: 300 });
    Object.defineProperty(target, 'scrollWidth', { configurable: true, value: 300 });

    const os = new AcOverlayScrollbar({
      target,
      host: container,
    });

    os.update();

    const vTrack = container.querySelector('.ac-os-track-v') as HTMLElement;
    const hTrack = container.querySelector('.ac-os-track-h') as HTMLElement;

    expect(vTrack.style.display).toBe('none');
    expect(hTrack.style.display).toBe('none');

    os.destroy();
  });

  it('should display vertical track when vertical content overflows', () => {
    Object.defineProperty(target, 'clientHeight', { configurable: true, value: 200 });
    Object.defineProperty(target, 'scrollHeight', { configurable: true, value: 600 });
    Object.defineProperty(target, 'clientWidth', { configurable: true, value: 300 });
    Object.defineProperty(target, 'scrollWidth', { configurable: true, value: 300 });

    const os = new AcOverlayScrollbar({
      target,
      host: container,
    });

    os.update();

    const vTrack = container.querySelector('.ac-os-track-v') as HTMLElement;
    const hTrack = container.querySelector('.ac-os-track-h') as HTMLElement;

    expect(vTrack.style.display).toBe('block');
    expect(hTrack.style.display).toBe('none');

    os.destroy();
  });

  it('should remove tracks and classes upon destroy', () => {
    const os = new AcOverlayScrollbar({
      target,
      host: container,
    });

    os.destroy();

    expect(target.classList.contains('ac-overlay-scroll-container')).toBe(false);
    expect(container.querySelector('.ac-os-track-v')).toBeNull();
    expect(container.querySelector('.ac-os-track-h')).toBeNull();
  });
});
