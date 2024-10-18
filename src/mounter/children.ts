import { mounterComponent } from ".";
import { NodeOP } from "../parser/parser";
import { TypeNode } from "../parser/type";
import { createText, insert } from "./dom";

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
    //
  }
}
