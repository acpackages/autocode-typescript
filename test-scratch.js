const path = require('path');
const { JSDOM } = require('jsdom');
const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>', {
  url: 'http://localhost',
  pretendToBeVisual: true
});
global.window = dom.window;
global.document = dom.window.document;
global.HTMLElement = dom.window.HTMLElement;
global.customElements = dom.window.customElements;
global.CustomEvent = dom.window.CustomEvent;
global.Event = dom.window.Event;
global.FocusEvent = dom.window.FocusEvent;
global.KeyboardEvent = dom.window.KeyboardEvent;
global.MouseEvent = dom.window.MouseEvent;
global.TouchEvent = dom.window.TouchEvent || class TouchEvent extends dom.window.UIEvent {};
global.getComputedStyle = dom.window.getComputedStyle;

try {
  require('./dist/packages/browser/ac-browser/ac-browser.umd.js');
  const AcRepeaterElement = customElements.get('ac-repeater');
  console.log('AcRepeaterElement defined:', !!AcRepeaterElement);

  const repeater = document.createElement('ac-repeater');
  document.body.appendChild(repeater);

  repeater.repeaterApi.usePagination = true;
  repeater.repeaterApi.rowRendererFunction = (args) => {
    const el = document.createElement('div');
    el.textContent = 'Row: ' + JSON.stringify(args.row.data);
    return el;
  };

  const testData = [
    { id: 1, name: 'Alice' },
    { id: 2, name: 'Bob' },
    { id: 3, name: 'Charlie' }
  ];

  repeater.repeaterApi.data = testData;

  const body = repeater.querySelector('ac-repeater-body');
  console.log('Body childElementCount:', body.children.length);
  console.log('Body renderedRowMap size:', body._renderedRowMap ? body._renderedRowMap.size : 'none');
  console.log('Body innerHTML preview:', body.innerHTML);
  for (let i = 0; i < body.children.length; i++) {
    console.log(`Child ${i}:`, body.children[i].tagName, body.children[i].innerHTML);
  }
} catch (e) {
  console.error('Error running test:', e);
}
