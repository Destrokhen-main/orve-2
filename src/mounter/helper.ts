import { NodeChild, NodeHtml } from "../parser/type";
import { Ref, RefFormater } from "../reactive/ref";
import { pairwise, startWith } from "rxjs";

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

export { textNodeCreator, htmlNodeCreate, RefChildCreator, RefFormateChildCreator }

