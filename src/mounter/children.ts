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
import { mounterOif } from "./reactive/oif";
import { mountedFor } from "./reactive/refA";
import { mountedRefO } from "./reactive/refO";

export function isHtmlNode(item: string): boolean {
  const REQEX = /<\/?[a-z][\s\S]*>/i;
  return REQEX.test(item);
}

export function mountedStatic(root: Element | null, tree: any) {
  const text = tree.value;
  const result = createText(text);

  if (root) {
    insert(result, root);
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

/*
[x] - text | number
[X] - HTML
*/
export function mountedRef(root: Element | null, item: any) {
  const value = item.value;
  let startNode: any = null;
  let lastMountedType: string = "";

  if (value === null || value === undefined || typeof value === "boolean") {
    startNode = createComment("Ref");
    lastMountedType = "Comment";
  }

  if (typeof value === "string" || typeof value === "number") {
    if (typeof value === "string" && isHtmlNode(value)) {
      startNode = mountedHTML(null, { value });
      lastMountedType = "HTML";
    } else {
      startNode = createText(value.toString());
      lastMountedType = "Text";
    }
  }

  item.$sub.subscribe({
    type: 1,
    f: (nexValue: any) => {
      if (typeof nexValue === "string" && isHtmlNode(nexValue)) {
        const node = mountedHTML(null, { value: nexValue });
        replaceElement(startNode, node);
        startNode = node;
        lastMountedType = "HTML";
      } else {
        if (lastMountedType !== "Text") {
          const node = createText(nexValue.toString());
          replaceElement(startNode, node);
          startNode = node;
          lastMountedType = "Text";
        }

        if (lastMountedType === "Text") {
          setText(startNode, nexValue.toString());
        }
      }
    },
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

    if (i.value.type === ReactiveType.Ref) {
      mountedRef(root, i.value);
    }

    if (i.value.type === ReactiveType.RefArrFor) {
      mountedFor(root, i.value);
    }

    if (i.value.type === ReactiveType.Oif) {
      mounterOif(root, i.value);
    }

    if (i.value.type === ReactiveType.RefO) {
      mountedRefO(root, i.value);
    }
  }
}
