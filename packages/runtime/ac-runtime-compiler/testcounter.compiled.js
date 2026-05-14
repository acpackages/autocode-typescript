
(function() {
  let activeEffect = null;
  function createSignal(value) {
    const subscribers = new Set();
    return [
      () => {
        if (activeEffect) subscribers.add(activeEffect);
        return value;
      },
      (newValue) => {
        if (value === newValue) return;
        value = newValue;
        subscribers.forEach(sub => sub());
      }
    ];
  }

  function createEffect(fn) {
    const effect = () => {
      activeEffect = effect;
      fn();
      activeEffect = null;
    };
    effect();
  }

  class TestCounterCompiled extends HTMLElement {
    constructor() {
      super();
      
    const [titleSig, settitleSig] = createSignal('My Counter');
    Object.defineProperty(this, 'title', {
      get: () => titleSig(),
      set: (v) => settitleSig(v),
      configurable: true
    });

    const [countSig, setcountSig] = createSignal(0);
    Object.defineProperty(this, 'count', {
      get: () => countSig(),
      set: (v) => setcountSig(v),
      configurable: true
    });
    }

    connectedCallback() {
      this.render();
      if (this.acOnInit) this.acOnInit();
    }

    render() {
      const self = this;
      const el0 = document.createTextNode("\n    ");
const el1 = document.createElement('div');
const el2 = document.createTextNode("\n      ");
el1.appendChild(el2);
const el3 = document.createElement('h1');
const el4 = document.createTextNode('');
el3.appendChild(el4);
el1.appendChild(el3);
const el5 = document.createTextNode("\n      ");
el1.appendChild(el5);
const el6 = document.createElement('button');
const el7 = document.createTextNode("Increment");
el6.appendChild(el7);
el1.appendChild(el6);
const el8 = document.createTextNode("\n      ");
el1.appendChild(el8);
const el9 = document.createElement('button');
const el10 = document.createTextNode("Decrement");
el9.appendChild(el10);
el1.appendChild(el9);
const el11 = document.createTextNode("\n      ");
el1.appendChild(el11);
const el12 = document.createElement('div');
const el13 = document.createTextNode('');
el12.appendChild(el13);
el1.appendChild(el12);
const el14 = document.createTextNode("\n      ");
el1.appendChild(el14);
const el16 = document.createComment('ac:if');
el1.appendChild(el16);
const el17 = document.createTextNode("\n    ");
el1.appendChild(el17);
const el18 = document.createTextNode("\n  ");
      this.appendChild(el0);
this.appendChild(el1);
this.appendChild(el18);
      createEffect(() => { el4.textContent = (function() { with(this) { return `Counter: ${count}` } }).call(this); });
el6.addEventListener('click', ($event) => { (function() { with(this) { return increment() } }).call(this) });
el9.addEventListener('click', ($event) => { (function() { with(this) { return decrement() } }).call(this) });
createEffect(() => { el12['style']['color'] = (function() { with(this) { return count > 5 ? 'red' : 'black' } }).call(this); });
createEffect(() => { el13.textContent = (function() { with(this) { return `
        Status: ${count > 5 ? 'High' : 'Low'}
      ` } }).call(this); });

                (function() {
                    let currentEl = null;
                    createEffect(() => {
                        const condition = (function() { with(this) { return count > 10 } }).call(this);
                        if (condition) {
                            if (!currentEl) {
                                const render = () => {
                                    const el0 = document.createElement('div');
const el1 = document.createTextNode("\n        ");
el0.appendChild(el1);
const el2 = document.createElement('h2');
const el3 = document.createTextNode("Danger: Count is too high!");
el2.appendChild(el3);
el0.appendChild(el2);
const el4 = document.createTextNode("\n      ");
el0.appendChild(el4);
                                    return el0; // Simplified, assuming single root for if
                                };
                                currentEl = render();
                                el16.parentNode.insertBefore(currentEl, el16.nextSibling);
                                // Set up child bindings
                                
                            }
                        } else {
                            if (currentEl) {
                                currentEl.remove();
                                currentEl = null;
                            }
                        }
                    });
                })();
    }

    increment() {
    this.count++;
  }

decrement() {
    this.count--;
  }

acOnInit() {
    console.log('Counter initialized with title:', this.title);
  }
  }

  if (!customElements.get('test-counter')) {
    customElements.define('test-counter', TestCounterCompiled);
  }
})();
    