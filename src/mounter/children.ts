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
  RefFormateChildCreator,
  RefArray,
  RefOWorker,
  OifWorker,
  RefCWorker,
  RefCComponentWorker,
} from "./helper";

import { mounterNode } from "./index";

export type InsertType = NodeOP | NodeChild | NodeHtml;

/**
 * Обработка одиночноq node
 * @param root - HTMLElement
 * @returns - переработанный node
 */
function singelMounterChildren(root: Element | null) {
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
        return mounterChildren(root, knowItem.children);
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
      const reactiveObject: Ref = (item as any).value;
      if (reactiveObject.type === ReactiveType.Ref) {
        RefChildCreator(root, reactiveObject);
        return item;
      }

      if (reactiveObject.type === ReactiveType.RefFormater) {
        RefFormateChildCreator(root, reactiveObject as any);
        return item;
      }

      if (reactiveObject.type === ReactiveType.RefA) {
        console.warn(
          'Пожалуйста, используйте "for" для отображения массива правильно',
        );
        return item;
      }

      if (reactiveObject.type === ReactiveType.RefArrFor) {
        RefArray(
          root,
          (reactiveObject as any).parent,
          item,
          reactiveObject.value as () => any,
        );
        return item;
      }

      if (reactiveObject.type === ReactiveType.RefO) {
        RefOWorker(root, item as any);
        return item;
      }

      if (reactiveObject.type === ReactiveType.Oif) {
        OifWorker(root, reactiveObject);
        return item;
      }

      if (reactiveObject.type === ReactiveType.RefC) {
        RefCWorker(root, reactiveObject);
        return item;
      }

      if (reactiveObject.type === ReactiveType.RefCComponent) {
        RefCComponentWorker(root, reactiveObject);
        return item;
      }
    }
  };
}

/**
 * Монтирование node
 * @param root - HTMLElement
 * @param listNode - массив node
 * @returns - обработанные массив node
 */
function mounterChildren(root: Element | null, listNode: InsertType[]): any {
  const prepaireFunction = singelMounterChildren(root);

  const finaly = listNode.map(prepaireFunction);

  return finaly.filter((x) => x !== null);
}

export { mounterChildren, singelMounterChildren };
