import { NodeChild, NodeHtml } from "../parser/type";
import { Ref, RefFormater } from "../reactive/ref";
import { pairwise } from "rxjs";
import { EtypeComment } from "./helperType";
import { NodeOP } from "../parser/parser-type";

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

function RefChildCreator(
  root: Element | null,
  item: Ref,
  replaceItem?: Element | Comment,
  parent: NodeOP | null = null,
) {
  const textNode = document.createTextNode(String(item.value));
  const sub = item.$sub;
  sub.pipe(pairwise()).subscribe({
    next([before, after]: [string | number, string | number]) {
      if (after !== undefined && before !== after) {
        parent?.$component.next("beforeUpdate");
        textNode.textContent = String(after);
        parent?.$component.next("updated");
      }
    },
  } as any);

  if (replaceItem) {
    replaceItem.replaceWith(textNode);
    return textNode;
  } else if (root !== null) {
    root.appendChild(textNode);
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
};
