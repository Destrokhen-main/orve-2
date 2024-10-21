import { Props, Children, NodeB } from "../jsx-type";
import { isValidNode } from "./helper";
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
import { generateInstace } from "../utils/instance";
import { LifeHook } from "../utils/typeLifehooks";
import { isStepCreateApp, setIsStepCreateApp } from "../instance";
import { ReactiveType } from "../reactive/type";

export interface NodeO extends NodeB {
  tag: string | ((props?: Record<string, any>) => unknown);
  props?: Props;
  children?: Children;
}

export interface NodeOP extends NodeO {
  keyNode?: string | number;
  node: Element | null;
  parent: NodeOP | null;
  instance: Record<string, any>;
  type: TypeNode;
  $sub?: Line | null;
}

// function initPropsGuard(func: () => unknown, propsW: Props) {
//   const propFunction = (func as Record<string, any>).props;
//   delete (func as Record<string, any>).props;
//   let prepFunc = null;
//   try {
//     prepFunc = definedProps(func, propFunction);
//   } catch (error) {
//     console.warn(`[${func.name ?? "-"}()] defineProps `, error);
//   }

//   return prepFunc !== null ? prepFunc.call(this, propsW) : null;
// }

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
  const propsW = props !== null ? props : {};

  // if (propsW.$slot === undefined) {
  //   propsW.$slot = {};
  // }

  try {
    component = func(propsW);
  } catch (error) {
    logger("error", `[${getName(func)}()] - [Parser error]:`, error);
  }

  // try {
  //   component =
  //     funcAsObject.props !== undefined
  //       ? initPropsGuard.call(this, func, propsW)
  //       : func.call(this, propsW);
  // } catch (error) {
  //
  // }

  if (component && isValidNode(component, func.name)) {
    const comp = component as NodeO;
    // const funcAsObject = func as Record<string, any>;

    // if (funcAsObject.hooks !== undefined) {
    //   comp.hooks = funcAsObject.hooks;
    // }
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

      // if (object.$slot === undefined) {
      //   object.$slot = {};
      // }

      let component: unknown | null = null;
      try {
        component = node.tag(object);
        // if ((node.tag as Record<string, any>).props !== undefined) {
        //   component = initPropsGuard(node.tag, object);
        // } else {
        //   component = node.tag.call(this, object);
        // }
      } catch (error) {
        console.warn(`[${node.tag.name ?? "-"}()] Recursive `, error);
      }

      if (component && isValidNode(component, node.tag.name)) {
        // if ((node.tag as Record<string, any>).hooks !== undefined) {
        //   (component as any).hooks = (node.tag as Record<string, any>).hooks;
        // }

        returnedNode = component as NodeO;
        quee.push(returnedNode);
      } else if (component === null) {
        return null;
      }
    }
  }

  return returnedNode;
}

export let currentInstance: any = null;

/**
 * Функция помогающая обработать компонент.
 * @param app Функция компонента
 * @param props Объект props сверху
 * @returns Или объект или null
 */
function parserNodeF(
  this: any,
  app: (() => unknown) | NodeO,
  props: Props | null = null,
  parent: NodeOP | null = null,
): NodeOP | null {
  currentInstance = generateInstace(parent);
  const localThis = this ?? {};

  let component;
  let _nameComponent = "Unknow Component";

  if (typeof app === "function") {
    component = prepareComponent(app, props);
    if (!component) {
      console.warn("Component don't be build");
      return null;
    }

    _nameComponent = app.name;
  } else {
    component = app;
  }

  // if (
  //   this &&
  //   this.globalComponents !== undefined &&
  //   typeof component.tag === "string"
  // ) {
  //   const nameTag = /([-_][a-z])/g.test(component.tag)
  //     ? snakeToCamel(component.tag)
  //     : component.tag;

  //   if (this.globalComponents[nameTag] !== undefined) {
  //     component = prepareComponent.call(
  //       this,
  //       this.globalComponents[nameTag],
  //       props,
  //     );
  //   }
  // }

  // if (component === null) {
  //   return null;
  // }
  if (typeof component.tag === "function") {
    if (typeof app === "object") {
      _nameComponent = component.tag.name;
    }

    component = recursiveNode(component);
  }

  if (component === null) {
    console.warn("ERRROR");
    return null;
  }

  const componentO = {
    type: TypeNode.Component,
    $sub: !localThis.__SUB__ ? new Line() : null,
    instance: currentInstance,
    ...component,
    node: null,
    parent: !localThis.__CTX_PARENT__ ? parent : null,
    nameComponent: _nameComponent,
  };

  currentInstance = null;
  if (!isStepCreateApp) {
    setIsStepCreateApp(true);
  }

  if (
    [ReactiveType.Oif, ReactiveType.RefArrFor].includes(
      component.tag as ReactiveType,
    )
  ) {
    const res = reactiveWorkComponent(componentO) as any;
    if (res) {
      res.instance = componentO.instance;
      return res;
    }
    return null;
  }

  if (componentO.props) {
    componentO.props = propsWorker(componentO.props);
  }

  if (componentO.children) {
    componentO.children = parseChildren(componentO.children, componentO);
  }

  if (!InvokeHook(componentO, LifeHook.onCreated)) {
    console.error(
      `[${componentO.nameComponent ?? "-"}()] hooks: "created" - Error in hook`,
    );
  }
  return componentO;
}

export { parserNodeF };
