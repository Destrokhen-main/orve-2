import { mounterComponent } from ".";
import { NodeOP } from "../parser/parser";
import { TypeNode } from "../parser/type";
import { ReactiveType } from "../reactive/type";
import {
  createComment,
  createText,
  insert,
  replaceElement,
  setText,
} from "./dom";

function isComment(el: any) {
  return el.nodeType === 8;
}

export function mountedStatic(root: Element | null, tree: any) {
  const text = tree.value;
  let result = null;

  if (root) {
    const textNode = createText(text);
    insert(textNode, root);
    result = textNode;
  }

  return result;
}

export function mountedHTML(root: Element | null, tree: any) {
  const element = new DOMParser()
    .parseFromString(tree.value, "text/html")
    .getElementsByTagName("body")[0];

  const node = element.firstChild as HTMLElement;

  if (root) {
    insert(node, root);
  }

  return node;
}

export function mountedRef(root: Element | null, item: any) {
  console.log(item);

  const value = item.value;

  let startNode: any = null;

  if (value === null || value === undefined || typeof value === "boolean") {
    startNode = createComment("Ref");
  }

  if (typeof value === "string" || typeof value === "number") {
    startNode = createText(value.toString());
  }

  item.$sub.subscribe((nexValue: any) => {
    if (isComment(startNode)) {
      const el = createText(nexValue.toString());
      replaceElement(startNode, el);
      startNode = el;
    } else {
      setText(startNode, nexValue.toString());
    }
  });

  if (root && startNode !== null) {
    insert(startNode, root);
  }
}

export function mounterChildren(root: Element | null, tree: NodeOP) {
  if (tree.type === TypeNode.Component) {
    return mounterComponent(root, tree);
  }

  if (tree.type === TypeNode.Static) {
    return mountedStatic(root, tree);
  }

  if (tree.type === TypeNode.HTML) {
    return mountedHTML(root, tree);
  }

  if (tree.type === TypeNode.Reactive) {
    const i = tree as any;

    if (typeof i.value === "object" && i.value.type === ReactiveType.Ref) {
      mountedRef(root, i.value);
    }
  }
}
