import { Props, Children, NodeB } from "../jsx-type";
import { validationNode } from "./helper";
import { parseChildren } from "./children";
import { propsWorker } from "./props";
import { TypeNode } from "./type";
import { InvokeHook } from "../helper/hookHelper";
import {
  REACTIVE_COMPONENT,
  reactiveWorkComponent,
} from "./reactiveComponentWorker";
import { definedProps, getName } from "../utils";
import { snakeToCamel } from "../utils/transformFunctions";
import { Line } from "../utils/line";
import { logger } from "../utils/logger";

export interface NodeO extends NodeB {
  tag: string | ((props?: Record<string, any>) => unknown);
  props?: Props;
  children?: Children;
}

export interface NodeOP extends NodeO {
  keyNode?: string | number;
  node: Element | null;
  parent: NodeOP | null;
  type: TypeNode;
  $sub?: Line | null;
}

function initPropsGuard(func: () => unknown, propsW: Props) {
  const propFunction = (func as Record<string, any>).props;
  delete (func as Record<string, any>).props;
  let prepFunc = null;
  try {
    prepFunc = definedProps(func, propFunction);
  } catch (error) {
    console.warn(`[${func.name ?? "-"}()] defineProps `, error);
  }

  return prepFunc !== null ? prepFunc.call(this, propsW) : null;
}

/**
 * Так как мы не знаем, что мы получим после вызова функции,
 * то необходимо перед работой с объектом вызвать её и проверить всё ли окей.
 * @param func - компонент
 * @param props - объект props с комопнента выше
 * @returns Или объект или null
 */
export function prepareComponent(
  func: (props?: Props) => unknown,
  props: Props | null = null,
): NodeO | null {
  let component: unknown | null = null;
  const funcAsObject = func as Record<string, any>;
  const propsW = props !== null ? props : {};

  if (propsW.$slot === undefined) {
    propsW.$slot = {};
  }

  try {
    component =
      funcAsObject.props !== undefined
        ? initPropsGuard.call(this, func, propsW)
        : func.call(this, propsW);
  } catch (error) {
    logger("error", `[${getName(func)}()] - [Parser error]:`, error);
  }

  if (component && validationNode(component, func.name)) {
    const comp = component as NodeO;
    const funcAsObject = func as Record<string, any>;

    if (funcAsObject.hooks !== undefined) {
      comp.hooks = funcAsObject.hooks;
    }
    return comp;
  }

  return null;
}

/**
 * Если функция в tag имеет ещё компонент, то необходимо обработать его
 * @param node - Component
 * @returns Или объект или null
 */
export function recursiveNode(node: NodeO): NodeO | null {
  const quee: NodeO[] = [node];
  let returnedNode: NodeO = node;

  while (quee.length > 0) {
    const node = quee.shift();

    if (node && typeof node.tag === "function") {
      let object: Record<string, any> = {};

      if (node.props !== undefined) {
        object = { ...node.props };
      }
      if (node.children !== undefined) {
        const ch = (node.children as any).flat(1);
        object["children"] = ch;
      }

      if (object.$slot === undefined) {
        object.$slot = {};
      }

      let component: unknown | null = null;
      try {
        if ((node.tag as Record<string, any>).props !== undefined) {
          component = initPropsGuard(node.tag, object);
        } else {
          component = node.tag.call(this, object);
        }
      } catch (error) {
        console.warn(`[${node.tag.name ?? "-"}()] Recursive `, error);
      }

      if (component && validationNode(component, node.tag.name) === true) {
        if ((node.tag as Record<string, any>).hooks !== undefined) {
          (component as any).hooks = (node.tag as Record<string, any>).hooks;
        }

        returnedNode = component as NodeO;
        quee.push(returnedNode);
      } else if (component === null) {
        return null;
      }
    }
  }

  return returnedNode;
}

/**
 * Функция помогающая обработать компонент.
 * @param app Функция компонента
 * @param props Объект props сверху
 * @returns Или объект или null
 */
function parserNodeF(
  app: (() => unknown) | NodeO,
  props: Props | null = null,
  parent: NodeOP | null = null,
): NodeOP | null {
  let component;

  if (typeof app === "function") {
    component = prepareComponent.call(this, app, props);

    if (component === null) {
      console.warn("Component don't be build");
      return null;
    }

    component.nameC = app.name;
  } else {
    component = app;
  }

  if (
    this &&
    this.globalComponents !== undefined &&
    typeof component.tag === "string"
  ) {
    const nameTag = /([-_][a-z])/g.test(component.tag)
      ? snakeToCamel(component.tag)
      : component.tag;

    if (this.globalComponents[nameTag] !== undefined) {
      component = prepareComponent.call(
        this,
        this.globalComponents[nameTag],
        props,
      );
    }
  }

  if (component === null) {
    return null;
  }

  let nameC;
  if (typeof component.tag === "function") {
    if (typeof app === "object") {
      nameC = component.tag.name;
    }

    component = recursiveNode.call(this, component);
  }

  if (component === null) {
    return null;
  }

  const componentO = {
    type: TypeNode.Component,
    $sub: !this.__SUB__ ? new Line() : null,
    ...component,
    props: component.props as any,
    node: null,
    parent: !this.__CTX_PARENT__ ? parent : null,
  };
  if (typeof app === "object") {
    componentO.nameC = nameC ?? parent?.nameC ?? "Unknow component";
  }

  if (component.keyNode === undefined) {
    // componentO.keyNode = !this["__CTX_ID__"] ? genUID(8) : "1";
  }

  if (REACTIVE_COMPONENT.includes(String(componentO.tag))) {
    return reactiveWorkComponent.call(this, componentO) as any;
  }

  //NOTE beforeCreate
  if (componentO.hooks && !InvokeHook(componentO, "beforeCreate")) {
    console.error(
      `[${componentO.nameC ?? "-"}()] hooks: "beforeCreate" - Error in hook`,
    );
  }

  if (componentO.props !== undefined) {
    componentO.props = propsWorker.call(this, componentO.props);
  }

  if (componentO.children !== undefined) {
    componentO.children = parseChildren.call(
      this,
      componentO.children,
      componentO,
    );
  }

  if (componentO.hooks && !InvokeHook(componentO, "created")) {
    console.error(
      `[${componentO.nameC ?? "-"}()] hooks: "created" - Error in hook`,
    );
  }
  return componentO;
}

export { parserNodeF };
