import { createElement, createText } from "./dom";
import { TypeNode } from "../parser/type";
import { ReactiveType } from "../reactive/type";

export function mounter(rootElement: Element, tree: any): any {
  const stack = [tree];
  let root: any = rootElement;
  while (stack.length > 0) {
    const currentItem = stack.shift();
    const { tag, props, children, type } = currentItem;
    console.log(currentItem);
    const needChangeRoot = children && children.length > 0;

    let element;

    if (tag) {
      const nameSpace =
        tag === "svg" ? "svg" : tag === "mathtml" ? "mathtml" : undefined;
      const isCustom = props && props.is ? props.is : undefined;

      element = createElement(tag, nameSpace, isCustom);
    }

    if (type === TypeNode.Static) {
      element = createText(currentItem.value);
    }

    if (type === TypeNode.Reactive) {
      const reactiveItem = currentItem.value;

      if (reactiveItem.type === ReactiveType.Ref) {
        const value = reactiveItem.value;

        const element = createText(value);
      }
    }

    if (children) {
      stack.push(...children);
    }

    currentItem.node = element;

    if (element) root.appendChild(element);

    if (needChangeRoot && element) {
      root = element;
    }
  }
}
