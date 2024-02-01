import { NodeChild, NodeHtml, TypeNode } from "../parser/type";
import { Ref } from "../reactive/ref";
import { EtypeComment } from "./helperType";
import { isHtmlNode } from "../parser/childrenHelper";
import { ReactiveType } from "../reactive/type";

function textNodeCreator(item: NodeChild) {
  const textNode = document.createTextNode(String(item.value));
  item.node = textNode;
  return item;
}

function htmlNodeCreate(item: NodeHtml) {
  const element = new DOMParser()
    .parseFromString(item.value, "text/html")
    .getElementsByTagName("body")[0];

  item.node = element.firstChild as HTMLElement;
  return item;
}

function removeAllSub(obj: Record<string, any>) {
  if (Array.isArray(obj) || typeof obj !== "object") return obj;

  let newObj: Record<string, any> = {};

  if (obj.$sub !== undefined) {
    newObj = removeAllSub(obj.value);
  } else {
    const keys = Object.keys(obj);
    keys.forEach((key: string) => {
      newObj[key] = removeAllSub(obj[key]);
    });
  }

  return newObj;
}

export function toString(value: unknown): string {
  if (typeof value === "object" && value !== undefined && value !== null) {
    return JSON.stringify(removeAllSub(value));
  }
  if (value === undefined) return "";
  return String(value);
}

function worker(_after: any, item: any, isHTML: any, textNode: any) {
  let after = _after;
  if (item.type === ReactiveType.RefO) {
    const i = item as any;
    after = i.parent[i.key];
  }

  if (typeof after === "string" && isHtmlNode(after)) {
    isHTML = true;
    const node = htmlNodeCreate({
      type: TypeNode.HTML,
      value: after,
      node: null,
    });
    if (node.node !== null) {
      textNode.replaceWith(node.node);
      textNode = node.node as any;
    } else {
      console.warn("[ ref ] - HTML code can't be parsed");
    }
  } else if (
    (isHTML && typeof after === "string" && !isHtmlNode(after)) ||
    (isHTML && typeof after !== "string")
  ) {
    const n = document.createTextNode(toString(after));
    textNode.replaceWith(n);
    textNode = n;
    isHTML = false;
  } else {
    textNode.textContent = toString(after);
  }

  return [isHTML, textNode];
}

function RefChildCreator(
  root: Element | null,
  item: Ref<any>,
  replaceItem?: Element | Comment,
  parent?: any,
) {
  let textNode = document.createTextNode("");
  const sub = item.$sub;
  let isHTML = false;

  [isHTML, textNode] = worker(item.value, item, isHTML, textNode);
  // TODO при первом вызове обновления не приходит next
  sub.subscribe((_after: string | number) => {
    // TODO посылает запрос если 2 и больше реактивных переменных
    // будет слать столько сколько переменных
    // так не должно быть.
    parent.$sub.next("beforeUpdate");
    [isHTML, textNode] = worker(_after, item, isHTML, textNode);
    parent.$sub.next("updated");
  });

  if (replaceItem !== undefined) {
    replaceItem.replaceWith(textNode);
    return textNode;
  } else if (root !== null) {
    root.appendChild(textNode);
  }
}

// function fragmentWorker(mountedNode: any[]): any[] {
//   const newMounted: any = [];

//   while(mountedNode.length > 0) {
//     const item = mountedNode.shift();

//     if (Array.isArray(item)) {
//       mountedNode.unshift(...item);
//     } else {
//       newMounted.push(item);
//     }
//   }

//   return newMounted;
// }

export function createCommentAndInsert(
  root: Element,
  text: string,
  type: EtypeComment = EtypeComment.append,
) {
  const comment = document.createComment(` refA - ${text} `);

  switch (type) {
    case EtypeComment.append:
      root?.appendChild(comment);
      break;
    case EtypeComment.replace:
      root.replaceWith(comment);
      break;
  }

  return comment;
}

export * from "./reactive/refC";
export * from "./reactive/oif";
export * from "./reactive/refO";
export * from "./reactive/refA";

export { textNodeCreator, htmlNodeCreate, RefChildCreator };
