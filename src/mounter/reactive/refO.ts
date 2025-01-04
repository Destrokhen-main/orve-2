import { getValueAtPath } from "../../reactive/refHelper";
import { ReactiveType } from "../../reactive/type";
import { returnType } from "../../utils";
import { createComment, createText, setText } from "../dom";
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

function mountedRefO(root: Element | null, item: any) {
  const ref = item.parent;
  const paths = item.keyPath;
  const COMMENT = createComment("RefO");
  let currentNode: Element | Comment | null = null;

  const initValue = getValueAtPath(ref.value, paths);
  const _v =
    returnType(initValue) === "object" ? JSON.stringify(initValue) : initValue;

  if (_v) {
    const node = createText(_v);
    root?.appendChild(node);
    currentNode = node;
  } else {
    root?.append(COMMENT);
    currentNode = COMMENT;
  }

  ref.$sub.subscribe({
    type: 1,
    f: (v: any) => {
      const value = getValueAtPath(v, paths);
      const _v = returnType(value) === "object" ? JSON.stringify(value) : value;
      if (currentNode?.nodeType === 8) {
        const node = createText(_v);
        currentNode.replaceWith(node);
        currentNode = node;
      } else {
        setText(currentNode, _v);
      }
    },
  });
}

export { RefOWorker, mountedRefO };
