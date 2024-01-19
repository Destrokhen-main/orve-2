import { Subject } from "rxjs";
import { FRAGMENT } from "../keys";
import { NodeOP } from "../parser/parser";
import { NodeHtml, NodeChild } from "../parser/type";
import { TypeNode } from "../parser/type";
import { Ref } from "../reactive/ref";
import { ReactiveType } from "../reactive/type";
import {
  textNodeCreator,
  htmlNodeCreate,
  RefChildCreator,
  RefArray,
  OifWorker,
  RefCComponentWorker,
} from "./helper";

import { mounterNode } from "./index";
import { RefComputedWorker } from "./reactive/refComputed";

export type InsertType = NodeOP | NodeChild | NodeHtml;

/**
 * Обработка одиночноq node
 * @param root - HTMLElement
 * @returns - переработанный node
 */
function singleMounterChildren(root: Element | null, parent?: childrenParent) {
  return (item: InsertType) => {
    if (item === undefined || item === null) {
      return null;
    }

    if (item.type === TypeNode.Component) {
      const knowItem = item as NodeOP;

      if (knowItem.tag !== FRAGMENT) {
        return mounterNode(root, knowItem);
      }

      if (knowItem.tag === FRAGMENT && knowItem.children.length > 0) {
        return mounterChildren(root, knowItem.children, parent);
      }
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
      const reactiveObject: Ref<any> = (item as any).value;
      if (
        reactiveObject.type === ReactiveType.Ref ||
        reactiveObject.type === ReactiveType.RefO
      ) {
        RefChildCreator(root, reactiveObject, undefined, parent);
        return item;
      }

      if (reactiveObject.type === ReactiveType.RefArrFor) {
        RefArray.call(
          (item as any).context,
          root,
          (reactiveObject as any).parent,
          item,
          reactiveObject.value as () => any,
        );
        return item;
      }

      if (reactiveObject.type === ReactiveType.Oif) {
        OifWorker(root, reactiveObject);
        return item;
      }

      if (reactiveObject.type === ReactiveType.RefCComponent) {
        RefCComponentWorker(root, reactiveObject);
        return item;
      }

      if (reactiveObject.type === ReactiveType.RefComputed) {
        RefComputedWorker(root, reactiveObject);
        return item;
      }
    }
  };
}

type childrenParent = { type: TypeNode; $sub: Subject<any> | null | undefined };

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

  return finaly.filter((x) => x !== undefined && x !== null);
}

export { mounterChildren, singleMounterChildren };
