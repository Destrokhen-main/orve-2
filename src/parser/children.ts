import { validationNode } from "./helper";
import { NodeO, NodeOP } from "./parser";
import { parserNodeO } from "./parser";
import { TypeNode, NodeChild, NodeHtml, IRefCSetup } from "./type";
import { isComponent, isHtmlNode, isReactiveObject } from "./childrenHelper";
import { genUID } from "../helper/generation";
import { ReactiveType } from "../reactive/type";

function compareStatic(item: string | number): NodeChild {
  return {
    type: TypeNode.Static,
    value: item,
    node: null,
  };
}

function compareHTML(item: string): NodeHtml {
  return {
    type: TypeNode.HTML,
    value: item,
    node: null,
  };
}

function hasUnreformateArray(nodes: unknown[]): boolean {
  if (Array.isArray(nodes)) {
    for (let i = 0; i !== nodes.length; i++) {
      if (Array.isArray(nodes[i])) {
        return true;
      }
    }
  }

  return false;
}

function setupRefCAsComponent(parse: NodeO) {
  const ObjectForWork: IRefCSetup = {
    type: ReactiveType.RefCComponent,
    proxy: parse.tag,
    props: {},
  };
  if (parse.props !== undefined) {
    ObjectForWork.props = { ...parse.props };
  }

  if (parse.children !== undefined && ObjectForWork.props) {
    ObjectForWork.props.children = parse.children;
  }

  return {
    type: TypeNode.Reactive,
    keyNode: genUID(8),
    value: ObjectForWork,
  };
}

/**
 * if you wanna use this function u need do .call(context);
 * @param parent NodeOP | null - node
 * @returns
 */
const parseSingleChildren = function (parent: NodeOP | null) {
  return function (item: unknown) {
    if (typeof item === "object" && item !== null && isReactiveObject(item)) {
      return {
        type: TypeNode.Reactive,
        keyNode: genUID(8),
        value: item,
      };
    }

    if (
      typeof item === "object" &&
      item !== null &&
      isComponent(item) &&
      validationNode(item)
    ) {
      const component = item as NodeO;

      // Проверь, есть ли tag реактивный объект.
      if (
        typeof component.tag === "object" &&
        (component.tag as Record<string, any>).type !== undefined &&
        (component.tag as Record<string, any>).type === ReactiveType.RefC
      ) {
        return setupRefCAsComponent(component);
      }

      const parse = parserNodeO.call(this, component, parent);

      return parse !== null ? parse : null;
    }

    if (typeof item === "string" && isHtmlNode(item)) {
      return compareHTML(item);
    }

    if (typeof item === "string" || typeof item === "number") {
      return compareStatic(item);
    }

    return item;
  }.bind(this);
};

function parseChildren(arrayNode: unknown[], parent: NodeOP | null): any {
  const singleChildParser = parseSingleChildren.call(this, parent);

  // TODO
  // [ ] - Необходимо убедиться, что тут после flat всё ещё валидный массив
  let workNodes = arrayNode;
  if (hasUnreformateArray(arrayNode)) {
    workNodes = (arrayNode as any).flat(1);
  }
  return workNodes.map(singleChildParser);
}

export { parseChildren, parseSingleChildren };
