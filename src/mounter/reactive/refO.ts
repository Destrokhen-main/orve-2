import { ReactiveType } from "../../reactive/type";
import { RefChildCreator } from "../helper_old";

type refOItem = {
  isDefined: boolean;
  key: string;
  proxy: any;
  type: ReactiveType.RefO;
};

function reactiveHelper(
  root: Element | null,
  next: Record<string, any>,
  node: HTMLElement,
): Text | undefined {
  switch (next.value.type) {
    case ReactiveType.Ref:
      return RefChildCreator(root, next.value, node);
  }
}

/* TODO
[ ] - В next может приходить другие реактивные переменные, надо их обрабатывать тоже.
*/
function RefOWorker(root: Element | null, item: Record<string, any>) {
  const obj: refOItem = item.value;
  const currentKey = obj.key;
  if (obj.isDefined) {
    const printValue = obj.proxy.value[obj.key];

    const node = document.createTextNode(
      typeof printValue === "string" ? printValue : JSON.stringify(printValue),
    );

    root?.appendChild(node);

    obj.proxy.$sub.subscribe((next: any) => {
      if (
        typeof next === "object" &&
        next.type === ReactiveType.RefO &&
        next.key === currentKey
      ) {
        node.textContent =
          typeof next.value === "string"
            ? next.value
            : JSON.stringify(next.value);
      }
    });
  } else if (!obj.isDefined) {
    let isComment = true;
    let node: any = document.createComment(` refO - ${currentKey}`);

    root?.appendChild(node);

    obj.proxy.$sub.subscribe((next: any) => {
      if (
        typeof next === "object" &&
        next.type === ReactiveType.RefO &&
        next.key === currentKey
      ) {
        if (isComment) {
          isComment = false;
          if (
            typeof next.value === "object" &&
            Object.values(ReactiveType).includes(next.value.type)
          ) {
            node = reactiveHelper(root, next.value, node);
            return;
          }

          const newNode = document.createTextNode(
            typeof next.value === "string"
              ? next.value
              : JSON.stringify(next.value),
          );

          node.replaceWith(newNode);
        } else {
          if (
            typeof next.value === "object" &&
            Object.values(ReactiveType).includes(next.value.type)
          ) {
            node = reactiveHelper(root, next.value, node);
            return;
          }

          node.textContent =
            typeof next.value === "string"
              ? next.value
              : JSON.stringify(next.value);
        }
      }
    });
  }
}

export { RefOWorker };
