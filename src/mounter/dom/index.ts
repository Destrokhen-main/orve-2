// import { patchListener } from "./patch/listener";
import { patchClass } from "./patch/class";
import { patchStyle } from "./patch/style";
import { patchImage } from "./patch/image";

type OrveElement = HTMLElement & { oNode: Record<string, any> };

export function patchProps(
  el: any,
  key: string,
  prevValue: any,
  nextValue: any,
  // namespace?: "svg" | "mathml",
  // prevChildren?: any[],
  // parentComponent?: any | null,
  // parentSuspense?: any | null,
  // unmountChildren?: any,
) {
  if (key === "style") {
    patchStyle(el, nextValue);
  } else if (key === "class") {
    patchClass(el, nextValue);
  } else if (key === "src") {
    patchImage(el, nextValue);
  } else if (nextValue === null) {
    el.removeAttribute(key);
  } else if (typeof nextValue === "boolean") {
    if (nextValue) {
      el.setAttribute(key, "");
    } else {
      el.removeAttribute(key);
    }
  } else {
    el.setAttribute(key, nextValue);
  }
}

export function insert(child: any, parent: any, anchor?: any) {
  parent.insertBefore(child, anchor);
}

export function insertAfter(child: any, parent: any) {
  parent.after(child);
}

export function remove(child: any) {
  child.parentNode.removeChild(child);
}

export function replaceElement(node: any, el: any) {
  node.replaceWith(el);
}

export function createElement(
  tag: string,
  namespace?: "svg" | "mathtml",
  isCustomizedBuiltInt?: string,
): OrveElement {
  let el;
  if (namespace === "svg") {
    el = document.createElementNS("http://www.w3.org/2000/svg", tag);
  }

  if (namespace === "mathtml") {
    el = document.createElementNS("http://www.w3.org/1998/Math/MathML", tag);
  }

  if (isCustomizedBuiltInt) {
    const optionsCustomized = {
      is: isCustomizedBuiltInt,
    };

    el = document.createElement(tag, optionsCustomized);
  }

  el = document.createElement(tag);

  // TODO miltiple для select, хз мб нужен будет

  return el as OrveElement;
}

export function createText(text: string) {
  return document.createTextNode(text);
}

export function createComment(text: string) {
  return document.createComment(text);
}

export function setText(node: any, text: string) {
  node.nodeValue = text;
}

export function parentNode(node: any) {
  return node.parentNode;
}

export function nextSibling(node: any) {
  return node.nextSibling;
}

export function querySelector(selector: string) {
  return document.querySelector(selector);
}

export function setScopeId(el: any, id: string) {
  el.setAttribute(id, "");
}

export function cloneNode(node: any) {
  return document.cloneNode(node);
}

// export function insertStaticContent() {
//   // Возможно не нужно
// }
