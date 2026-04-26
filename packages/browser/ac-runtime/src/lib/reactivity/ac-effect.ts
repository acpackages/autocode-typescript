/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-this-alias */
import { AC_RUNTIME_CONFIG } from "../consts/ac-runtime-config.const";

export type AcEffectFn = () => (Promise<void> | void | (() => void));

export interface IAcEffectSubscriber {
  notify(): void;
  dependencies: Set<Set<IAcEffectSubscriber>>;
}

export let activeSubscriber: IAcEffectSubscriber | null = null;
const subscriberStack: IAcEffectSubscriber[] = [];


/**
 * Microtask-based effect batch scheduler.
 * Multiple triggers within the same synchronous frame are deduplicated —
 * each effect runs at most once per microtask flush.
 */
const pendingEffects = new Set<AcEffect>();
let isFlushing = false;
let isFlushScheduled = false;


function scheduleEffect(effect: AcEffect) {
  pendingEffects.add(effect);
  if (!isFlushScheduled) {
    isFlushScheduled = true;
    queueMicrotask(flushEffects);
  }
}

function flushEffects() {
  if (isFlushing) return;
  isFlushing = true;
  try {
    // Iterate a snapshot; effects added during flush are picked up in a follow-up
    const effects = Array.from(pendingEffects);
    pendingEffects.clear();
    isFlushScheduled = false;
    for (const effect of effects) {
      effect.execute();
    }
    // If new effects were scheduled during this flush, schedule another
    if (pendingEffects.size > 0 && !isFlushScheduled) {
      isFlushScheduled = true;
      queueMicrotask(flushEffects);
    }
  } finally {
    isFlushing = false;
  }
}

/**
 * Effect class that manages subscription and re-execution.
 * Uses microtask batching to deduplicate multiple triggers per tick.
 */
export class AcEffect implements IAcEffectSubscriber {
  private cleanupFn?: () => void;
  dependencies = new Set<Set<IAcEffectSubscriber>>();

  constructor(private fn: AcEffectFn) {
    // Initial run is synchronous (not batched) to ensure DOM is ready on first render
    this.run();
  }

  notify() {
    // Prevent recursive triggers from within the same effect
    if (subscriberStack.includes(this)) {
      return;
    }
    // Queue into the microtask batch instead of running immediately
    scheduleEffect(this);
  }

  /** Called by the batch scheduler */
  execute() {
    this.run();
  }

  private run() {
    this.cleanup();

    try {
      subscriberStack.push(this);
      activeSubscriber = this;
      const result = this.fn();
      if (typeof result === 'function') {
        this.cleanupFn = result;
      }
    } finally {
      subscriberStack.pop();
      activeSubscriber = subscriberStack[subscriberStack.length - 1] || null;
    }
  }

  private cleanup() {
    if (this.cleanupFn) {
      try {
        this.cleanupFn();
      } catch (e) {
        AC_RUNTIME_CONFIG.logError('Error during effect cleanup:', e);
      }
      this.cleanupFn = undefined;
    }

    this.dependencies.forEach(dep => dep.delete(this));
    this.dependencies.clear();
  }

  public destroy() {
    this.cleanup();
  }
}


/**
 * Creates a reactive effect.
 */
export function acEffect(fn: AcEffectFn) {
  return new AcEffect(fn);
}
