import { parseChildren } from "../parser/children";
import { NodeChild, NodeHtml } from "../parser/type";
import { Ref, RefA, RefFormater } from "../reactive/ref";
import { pairwise, startWith } from "rxjs";
import { InsertType, mounterChildren } from "./children";

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

function RefChildCreator(root: Element | null, item: Ref) {
  const textNode = document.createTextNode(String(item.value));

  const sub = item.$sub;
  sub.pipe(startWith(item.value), pairwise()).subscribe({
    next([before, after]: [string | number, string | number]) {
      if (after !== undefined && before !== after) {
        textNode.textContent = String(after);
      }
    }
  } as any)

  if (root !== null) {
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
      }
    }
  )

  if (root !== null) {
    root.appendChild(textNode);
  }
}

function RefArray(root: Element | null, item: RefA) {
  /*
  Если есть списки то что-то вставляется + -

  Если нет списка что делать

  Если новый список полностью новый

  Если список очиститься полностью
  */

  const allNode = parseChildren(item.value, null);

  const mounted = mounterChildren(null, allNode as InsertType[]);

  if (root === null) return mounted;

  let startNode = root;

  for(let i = 0; i !== mounted.length; i++) {
    if (i === 0) {
      startNode.appendChild(mounted[i].node)
    } else {
      startNode?.after(mounted[i].node);
    }
    startNode = mounted[i].node;
  }

  item.$sub.subscribe((next: Record<string, any>) => {
    if (next.type === "insert") {
      const newNode = parseChildren(next.value, null);
      const newMounted = mounterChildren(null, newNode as InsertType[]);

      const dir = next.dir;
     
      let nodeStart = dir === "right" ? mounted[mounted.length - 1].node : mounted[0].node;
      for(let i = 0; i !== newMounted.length; i++) {
        if (i === 0) {
          nodeStart[dir === "right" ? "after" : "before"](newMounted[i].node);
        }
      }
      mounted[dir === "right" ? "push" : "unshift"](...newMounted);
    }
  });
}


export { textNodeCreator, htmlNodeCreate, RefChildCreator, RefFormateChildCreator, RefArray }

