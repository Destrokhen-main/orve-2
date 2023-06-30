import { validationNode } from "./helper";
import { NodeO, NodeOP } from "./parser"
import { parserNodeO } from "./parser";
import { TypeNode, NodeChild, NodeHtml } from "./type"
import { isComponent, isFormater, isHtmlNode, isReactiveObject } from "./childrenHelper";

function compareStatic(item: string | number): NodeChild {
  return {
    type: TypeNode.Static,
    value: item,
    node: null
  }
}

function compareHTML(item: string): NodeHtml {
  return {
    type: TypeNode.HTML,
    value: item,
    node: null
  }
}


/**
 * if you wanna use this function u need do .call(context);
 * @param parent NodeOP | null - node
 * @returns 
 */
const parseSingleChildren = function(parent: NodeOP | null) {
  return (function (item: unknown) {
    if (typeof item === "object" && item !== null && isReactiveObject(item)) {
      return {
        type: TypeNode.Reactive,
        value: item
      };
    }

    if (typeof item === "object" && item !== null && isComponent(item) && validationNode(item)) {
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
  }).bind(this);
}

function parseChildren(arrayNode: unknown[], parent: NodeOP | null) {
  const singleChildParser = parseSingleChildren.call(this, parent);

  return arrayNode.map(singleChildParser);
}

export { parseChildren, parseSingleChildren }