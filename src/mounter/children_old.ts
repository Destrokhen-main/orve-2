import { Line } from "../utils/line";
import { FRAGMENT } from "../keys";
import { NodeOP } from "../parser/parser";
import { NodeHtml, NodeChild } from "../parser/type";
import { TypeNode } from "../parser/type";

// import { ReactiveType } from "../reactive/type";
import {
  textNodeCreator,
  htmlNodeCreate,
  // RefChildCreator,
  // RefArray,
  // RefCComponentWorker,
} from "./helper_old";

import { mounterComponent } from "./index";
// import { RefComputedWorker } from "./reactive/refComputed";

export type InsertType = NodeOP | NodeChild | NodeHtml;

/**
 * Обработка одиночноq node
 * @param root - HTMLElement
 * @returns - переработанный node
 */
function singleMounterChildren(root: Element | null, parent?: childrenParent) {
  return (item: InsertType) => {
    if (!item) {
      return null;
    }

    if (item.type === TypeNode.Component) {
      const knowItem = item as NodeOP;

      if (knowItem.tag === FRAGMENT && knowItem.children.length > 0) {
        knowItem.node = root;
        knowItem.instance!.el = root;
        return mounterChildren(root, knowItem.children, parent);
      }

      return mounterComponent(root, knowItem);
    }

    if (item.type === TypeNode.Static) {
      const knowItem = textNodeCreator(item as NodeChild);

      if (root !== null && knowItem.node !== null) {
        root.appendChild(knowItem.node);
      }

      return knowItem;
    }

    if (item.type === TypeNode.HTML) {
      const knowItem = htmlNodeCreate(item as NodeHtml);

      if (root !== null && knowItem.node !== null) {
        root.appendChild(knowItem.node);
      }
      return knowItem;
    }

    if (item.type === TypeNode.Reactive) {
      return item;
      // const reactiveObject: Ref<any> = (item as any).value;
      // if (
      //   reactiveObject.type === ReactiveType.Ref ||
      //   reactiveObject.type === ReactiveType.RefO
      // ) {
      //   RefChildCreator(root, reactiveObject, undefined, parent);
      //   return item;
      // }
      // if (reactiveObject.type === ReactiveType.RefArrFor) {
      //   RefArray.call(
      //     (item as any).context,
      //     root,
      //     (reactiveObject as any).parent,
      //     item,
      //     reactiveObject.value as () => any,
      //   );
      //   return item;
      // }
      // if (reactiveObject.type === ReactiveType.Oif) {
      //   OifWorker(root, reactiveObject);
      //   return item;
      // }
      // if (reactiveObject.type === ReactiveType.RefCComponent) {
      //   RefCComponentWorker.call(this, root, reactiveObject);
      //   return item;
      // }
      // if (reactiveObject.type === ReactiveType.RefComputed) {
      //   RefComputedWorker(root, reactiveObject);
      //   return item;
      // }
    }
  };
}

type childrenParent = { type: TypeNode; $sub: Line | null | undefined };

/**
 * Монтирование node
 * @param root - HTMLElement
 * @param listNode - массив node
 * @returns - обработанные массив node
 */
function mounterChildren(
  root: Element | null,
  listNode: InsertType[],
  parent?: childrenParent,
): any {
  const prepaireFunction = singleMounterChildren(root, parent);

  const finaly = listNode.map(prepaireFunction);

  return finaly.filter((x) => x);
}

export { mounterChildren, singleMounterChildren };
