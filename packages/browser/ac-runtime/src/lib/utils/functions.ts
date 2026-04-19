export function createDocumentFragmentFromHtml(html: string): DocumentFragment {
  const template = document.createElement('template');
  template.innerHTML = html.trim();
  return template.content.cloneNode(true) as DocumentFragment;
};

export function createElementFromHtml(html: string): HTMLElement | null {
  const template = document.createElement('template');
  template.innerHTML = html.trim();

  const el = template.content.firstElementChild;
  return el instanceof HTMLElement ? el : null;
}

export function clearElement(element:HTMLElement):void{
  for(let el of element.children){
    clearElement(el as HTMLElement);
    el.remove();
    (el as any) = null;
  }
  element.innerHTML = "";
}
