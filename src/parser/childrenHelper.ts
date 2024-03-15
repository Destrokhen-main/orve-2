import { genUID } from "../helper";
import { ReactiveType } from "../reactive/type";
import { returnNewClone } from "../utils/returnClone";
import { NodeO } from "./parser";
import { NodeChild, TypeNode, NodeHtml, IRefCSetup } from "./type";

/**
 * Проверяет элемент на компонент
 * @param item - Элемент
 * @returns - true если это правда
 */
function isComponent(item: object): boolean {
  const obj: Record<string, any> = item;
  if (obj.tag !== undefined) {
    return true;
  }
  return false;
}

/**
 * Проверяет html ли это
 * @param item - строка
 * @returns true - если правда
 */
function isHtmlNode(item: string): boolean {
  const REQEX = /<\/?[a-z][\s\S]*>/i;
  if (REQEX.test(item)) {
    return true;
  }

  return false;
}

/**
 * Проверяет является ли это реактивным объектом
 * @param item - обхект
 * @returns true если это правда
 */
function isReactiveObject(item: unknown): boolean {
  if (typeof item !== "object") {
    return false;
  }

  if (item === null) {
    return false;
  }

  const workObject = item as Record<string, any>;

  if (
    workObject.type !== undefined &&
    Object.keys(ReactiveType).includes(workObject.type)
  ) {
    return true;
  }

  return false;
}


/**
 * Надстройка для статики.
 * @param item
 * @returns
 */
function compareStatic(item: string | number | boolean): NodeChild {
  return {
    type: TypeNode.Static,
    value: typeof item === "object" ? JSON.stringify(item) : item,
    node: null,
  };
}

/**
 * Надстройка для html кода внутри children
 * @param item
 * @returns
 */
function compareHTML(item: string): NodeHtml {
  return {
    type: TypeNode.HTML,
    value: item,
    node: null,
  };
}

/**
 * Если в children есть массив
 * @param nodes - массив node
 * @returns boolean true - если массив есть
 */
function hasUnreformedArray(nodes: unknown[]): boolean {
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
 * Преднастройка для <refC />
 * @param parse
 * @returns
 */
function setupRefCAsComponent(parse: NodeO, parent: any) {
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
    value: ObjectForWork,
    parent,
    context: returnNewClone(this),
  };
}

export { isComponent, isHtmlNode, isReactiveObject, setupRefCAsComponent, hasUnreformedArray, compareHTML, compareStatic };
