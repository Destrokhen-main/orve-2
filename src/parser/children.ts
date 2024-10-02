import { isValidNode } from "./helper";
import { NodeO, NodeOP, parserNodeF } from "./parser";
import { TypeNode } from "./type";
import {
  compareHTML,
  compareStatic,
  hasUnreformedArray,
  isComponent,
  isHtmlNode,
  isReactiveObject,
  setupRefCAsComponent,
} from "./childrenHelper";
import { ReactiveType } from "../reactive/type";
import { snakeToCamel } from "../utils/transformFunctions";
import { generateInstace } from "../utils/instance";

/**
 * if you wanna use this function u need do .call(context);
 * @param parent NodeOP | null - node
 * @returns
 */
const parseSingleChildren = function (parent: NodeOP | null) {
  return function (item: unknown) {
    if (typeof item === "object" && item !== null && isReactiveObject(item)) {
      const _item = item as any;

      if ([ReactiveType.Oif, ReactiveType.RefArrFor].includes(_item.type)) {
        // валидировать надо
      }

      return {
        type: TypeNode.Reactive,
        context: generateInstace(parent),
        value: _item,
      };
    }
    if (
      typeof item === "object" &&
      item !== null &&
      isComponent(item) &&
      isValidNode(item)
    ) {
      const component = item as NodeO;
      // Проверим есть ли globalComponent

      // if (
      //   typeof component.tag === "string" &&
      //   context !== null &&
      //   context.globalComponents !== undefined
      // ) {
      //   const nameTag = /([-_][a-z])/g.test(component.tag)
      //     ? snakeToCamel(component.tag)
      //     : component.tag;

      //   if (context.globalComponents[nameTag] !== undefined) {
      //     const parse = parserNodeF.call(
      //       context,
      //       context.globalComponents[nameTag],
      //       component.props ?? null,
      //       parent,
      //     );
      //     return parse !== null ? parse : null;
      //   }
      // }

      // Проверь, есть ли tag реактивный объект.
      // if (
      //   typeof component.tag === "object" &&
      //   (component.tag as Record<string, any>).type !== undefined &&
      //   (component.tag as Record<string, any>).type === ReactiveType.RefC
      // ) {
      //   return setupRefCAsComponent.call(this, component, parent);
      // }
      const parse = parserNodeF.call({}, component, null, parent);

      return parse !== null ? parse : null;
    }

    if (typeof item === "object" && !isComponent(item as any)) {
      return compareStatic(item as any);
    }

    if (typeof item === "string" && isHtmlNode(item)) {
      return compareHTML(item);
    }

    if (
      typeof item === "string" ||
      typeof item === "number" ||
      typeof item === "boolean"
    ) {
      return compareStatic(item);
    }

    return item;
  };
};

/**
 * Проходиться по children комопнента
 * @param arrayNode - массив компонентов
 * @param parent - родитель этого массива
 * @returns - обработанный массив
 */
function parseChildren(arrayNode: unknown[], parent: NodeOP | null): any {
  const singleChildParser = parseSingleChildren(parent);

  // TODO
  // [ ] - Необходимо убедиться, что тут после flat всё ещё валидный массив
  let workNodes = arrayNode;
  if (hasUnreformedArray(arrayNode)) {
    workNodes = (arrayNode as any).flat(1);
  }
  return workNodes.map(singleChildParser);
}

export { parseChildren, parseSingleChildren };
