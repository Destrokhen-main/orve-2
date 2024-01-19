import { NodeChild, NodeHtml, TypeNode } from "../parser/type";
import { Ref, RefFormater } from "../reactive/ref";
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

export function toString(value: unknown): string {
  if (typeof value === "object" && value !== undefined && value !== null) {
    return JSON.stringify(value);
  }
  return String(value);
}

function RefChildCreator(
  root: Element | null,
  item: Ref<any>,
  replaceItem?: Element | Comment,
  parent?: any,
) {
  let textNode = document.createTextNode("");

  const sub = item.$sub;
  let firstRender = true;
  let isHTML = false;
  // TODO при первом вызове обновления не приходит next
  sub.subscribe({
    next(after: string | number) {
      if (parent && !firstRender) {
        // TODO посылает запрос если 2 и больше реактивных переменных
        // будет слать столько сколько переменных
        // так не должно быть.
        parent.$sub.next("beforeUpdate");
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
      if (parent && !firstRender) {
        parent.$sub.next("updated");
      }
      firstRender = false;
    },
  });

  if (replaceItem !== undefined) {
    replaceItem.replaceWith(textNode);
    return textNode;
  } else if (root !== null) {
    root.appendChild(textNode);
  }
}

function RefChildCreatorObject(
  root: Element | null,
  item: any,
  replaceItem?: Element | Comment,
  parent?: any,
) {
  let isExist = item.isExistValue;
  let element = isExist
    ? document.createTextNode("")
    : document.createComment(` obj - ${item.key}`);
  let isFirstRender = true;

  item.proxy.$sub.subscribe({
    next(value: any) {
      if (parent && !isFirstRender) {
        parent.$sub.next("beforeUpdate");
      }
      const valueByKey = value[item.key];
      if (isExist) {
        if (
          typeof valueByKey === "object" &&
          valueByKey.type === ReactiveType.Ref
        ) {
          // TODO сюда может прийти реактивный объект это надо обработать
          // RefChildCreator(root, valueByKey, element, parent);
        } else if (
          typeof valueByKey === "object" &&
          valueByKey.type === ReactiveType.RefO
        ) {
          // TODO сюда может прийти реактивный объект это надо обработать
          // RefChildCreatorObject(root, valueByKey, element, parent);
        } else {
          element.textContent = toString(valueByKey);
        }
      } else if (!isFirstRender) {
        isExist = true;
        const n = document.createTextNode(value);
        element.replaceWith(n);
        element = n;
      }

      isFirstRender = false;
      if (parent && !isFirstRender) {
        parent.$sub.next("updated");
      }
    },
  });

  if (root !== null) {
    root.appendChild(element);
  }
}

function RefFormateChildCreator(root: Element | null, item: RefFormater) {
  const formItem = item.value(item.parent.value);

  const textNode = document.createTextNode(String(formItem));

  item.parent.$sub.subscribe({
    next(after: string | number) {
      const formatedItem = item.value(after);
      textNode.textContent = String(formatedItem);
    },
  });

  if (root !== null) {
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

export {
  textNodeCreator,
  htmlNodeCreate,
  RefChildCreator,
  RefFormateChildCreator,
  RefChildCreatorObject,
};
