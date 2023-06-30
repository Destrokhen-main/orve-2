import { NodeChild, NodeHtml } from "../parser/type";
import { Ref, RefFormater } from "../reactive/ref";

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
        
  item.$sub.subscribe({
    next(value: string | number) {
      textNode.textContent = String(value) 
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
    next(value: string | number) {
      const formatedItem = item.value(value);
      textNode.textContent = String(formatedItem);
    }
  })

  if (root !== null) {
    root.appendChild(textNode);
  }
}

export { textNodeCreator, htmlNodeCreate, RefChildCreator, RefFormateChildCreator }