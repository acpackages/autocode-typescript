/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-inferrable-types */
import { AcElementRenderer } from './ac-element-renderer';
export class AcElementLoopRenderer extends AcElementRenderer {
  private expression: string = '';
  private indexVar: string = '';
  private itemVar: string = '';
  private bindingId: string = '';
  private loopItemRendererMap:Record<string,number> = {};

  appendArrayItems({ items, index = -1 }: { items: any[], index?: number }) {
    const startIdx = Number(index);
    let endComment = `${this.targetId}-end`;
    if (startIdx !== -1) {
      const targetItemId = Object.keys(this.loopItemRendererMap).find(
        key => this.loopItemRendererMap[key] === startIdx
      );
      if (targetItemId) {
        endComment = `${targetItemId}-start`;
      }
    }

    if (startIdx !== -1) {
      const shiftCount = items.length;
      const sortedKeys = Object.keys(this.loopItemRendererMap).sort(
        (a, b) => this.loopItemRendererMap[b] - this.loopItemRendererMap[a]
      );
      for (const key of sortedKeys) {
        const currIdx = this.loopItemRendererMap[key];
        if (currIdx >= startIdx) {
          const newIdx = currIdx + shiftCount;
          this.loopItemRendererMap[key] = newIdx;
          this.updateChildRendererContext(key, { [this.indexVar]: newIdx });
        }
      }
    }

    let i: number = startIdx !== -1 ? startIdx : Object.keys(this.loopItemRendererMap).length;
    for (const item of items) {
      const itemId: string = this.rootElement.generateHexId();
      const startCommentHtml = `${itemId}-start`;
      const endCommentHtml = `${itemId}-end`;
      this.appendNodesBetweenComments({
        startComment: `${this.targetId}-start`,
        endComment: endComment,
        nodes: this.createNodesFromHtml(`<!--${startCommentHtml}--><!--${endCommentHtml}-->`),
        processNodes: false
      });
      const context: any = {
        ...this.parentRenderer?.context
      };
      context[this.itemVar] = item;
      context[this.indexVar] = i;
      this.createChildRenderer({
        targetId: `${itemId}`,
        html: this.html,
        startComment: startCommentHtml,
        endComment: endCommentHtml,
        context,
        rootElement: this.parentRenderer?.rootElement,
        ownedTargetIds:this.ownedTargetIds
      });
      this.loopItemRendererMap[itemId] = i;
      i++;
    }
  }

  init(
    { indexVar, itemVar, expression, items, bindingId }: { indexVar: string, itemVar: string, expression: string, items: any, bindingId: string }) {
    this.indexVar = indexVar;
    this.itemVar = itemVar;
    this.expression = expression;
    this.bindingId = bindingId;

    this.parentRenderer?.removeNodesBetweenComments({ startComment: `${this.targetId}-start`, endComment: `${this.targetId}-end` });
    // console.log(items, this);
    this.appendArrayItems({ items });
    this.rootElement.subscribeArrayPropertyChangeListeners({
      bindingId: this.bindingId, property: this.expression, callback: (args: any) => {
        // console.log(`[AcElementLoopRenderer] Array changes`, args);
        if (args.type === 'arrayInsert') {
          const { index, items } = args.newValue;
          // console.log(`[AcElementLoopRenderer] Inserting ${items.length} items at index ${index}`);
          this.appendArrayItems({ items, index });
        }
        else if (args.type === 'arrayReplace') {
          // console.log(`[AcElementLoopRenderer] Replacing items`, args);
          this.refresh({ items: args.newValue });
        }
        else if (args.type === 'arrayDelete') {
          const { index, items } = args.oldValue;
          // console.log(`[AcElementLoopRenderer] Deleting ${items.length} items at index ${index}`);
          this.removeArrayItems({ items, index });
        }
        else if (args.type === 'arrayUpdate') {
          // console.log(`[AcElementLoopRenderer] Updating item`, args);
          let targetIndex = args.index;
          let newItem = undefined;
          if (args.newValue && typeof args.newValue === 'object' && 'items' in args.newValue && 'index' in args.newValue) {
            targetIndex = args.newValue.index;
            if (Array.isArray(args.newValue.items) && args.newValue.items.length > 0) {
              newItem = args.newValue.items[0];
            }
          }
          if (targetIndex !== undefined) {
            const key = Object.keys(this.loopItemRendererMap).find(
              k => this.loopItemRendererMap[k] === targetIndex
            );
            if (key) {
              const childRenderer = this.childRenderers[key];
              if (childRenderer) {
                if (newItem !== undefined) {
                  this.updateChildRendererContext(key, { [this.itemVar]: newItem });
                } else {
                  childRenderer.triggerUpdate();
                }
              }
            }
          }
        }
        else if (args.type === 'arraySplice') {
          // console.log(`[AcElementLoopRenderer] Splicing items`, args);
          this.removeArrayItems({ items: args.oldValue.items, index: args.oldValue.index });
          this.appendArrayItems({ items: args.newValue.items, index: args.newValue.index });
        }
        else if (args.type === 'arraySort') {
          // console.log(`[AcElementLoopRenderer] Sorting items`, args);
          this.refresh({ items: args.newValue });
        }
        else if (args.type === 'arrayReverse') {
          // console.log(`[AcElementLoopRenderer] Reversing items`, args);
          this.refresh({ items: args.newValue });
        }
        else if (args.type === 'arrayFill') {
          // console.log(`[AcElementLoopRenderer] Filling items`, args);
          this.refresh({ items: args.newValue });
        }
        else if (args.type === 'arrayCopyWithin') {
          // console.log(`[AcElementLoopRenderer] CopyWithin items`, args);
          this.refresh({ items: args.newValue });
        }
      }
    });
  }

  refresh({ items }: { items: any[] }) {
    this.parentRenderer?.removeNodesBetweenComments({ startComment: `${this.targetId}-start`, endComment: `${this.targetId}-end` });
    this.childRenderers = {};
    this.loopItemRendererMap = {};
    this.appendArrayItems({ items });
  }

  removeArrayItems({ items, index = 0 }: { items: any[], index?: number }) {
    const startIdx = Number(index);
    // console.log(`[AcElementLoopRenderer] removeArrayItems: index=${index} (cast to ${startIdx}), deleteCount=${items.length}, loopItemRendererMap=`, { ...this.loopItemRendererMap });
    const deleteCount = items.length;
    const keysToDelete: string[] = [];
    for (let i = 0; i < deleteCount; i++) {
      const targetIdx = startIdx + i;
      const key = Object.keys(this.loopItemRendererMap).find(
        k => this.loopItemRendererMap[k] === targetIdx
      );
      // console.log(`[AcElementLoopRenderer] targetIdx=${targetIdx}, foundKey=${key}`);
      if (key) {
        keysToDelete.push(key);
      }
    }

    for (const key of keysToDelete) {
      this.removeChildRenderer(
        key,
        `${key}-start`,
        `${key}-end`
      );
      delete this.loopItemRendererMap[key];
    }

    const sortedKeys = Object.keys(this.loopItemRendererMap).sort(
      (a, b) => this.loopItemRendererMap[a] - this.loopItemRendererMap[b]
    );
    for (const key of sortedKeys) {
      const currIdx = this.loopItemRendererMap[key];
      if (currIdx >= startIdx + deleteCount) {
        const newIdx = currIdx - deleteCount;
        this.loopItemRendererMap[key] = newIdx;
        this.updateChildRendererContext(key, { [this.indexVar]: newIdx });
      }
    }
  }
}
