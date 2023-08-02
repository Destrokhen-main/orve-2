import { validationNode } from "./helper";
import { NodeO, NodeOP } from "./parser";
import { parserNodeO } from "./parser";
import { TypeNode, NodeChild, NodeHtml } from "./type";
import { isComponent, isHtmlNode, isReactiveObject } from "./childrenHelper";
import { genUID } from "../helper/generation";

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
