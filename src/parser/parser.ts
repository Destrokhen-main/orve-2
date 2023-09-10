import { NodeB, Props } from "../jsx-type";
import { validationNode } from "./helper";
import { genUID } from "../helper/generation";
import { parseChildren } from "./children";
import { propsWorker } from "./props";
import { TypeNode } from "./type";
import { InvokeHook } from "../helper/hookHelper";
import {
  REACTIVE_COMPONENT,
  reactiveWorkComponent,
} from "./reactiveComponentWorker";
import { definedProps } from "../utils";
import { snakeToCamel } from "../utils/transformFunctions";
import { NodeO, NodeOP } from "./parser-type";
import { Subject } from "rxjs";

/**
 * Так как мы не знаем, что мы получим после вызова функции,
 * то необходимо перед работой с объектом вызвать её и проверить всё ли окей.
 * @param func - компонент
 * @param props - объект props с комопнента выше
 * @returns Или объект или null
 */
function prepareComponent(
  func: (props?: Props) => unknown,
  props: Props | null = null,
): NodeO | null {
  let component: unknown | null = null;
  try {
    let f = func as ((insertProps: Props) => NodeB | null) | (() => unknown);
    if ((func as Record<string, any>).props !== undefined) {
      const funcRecord = func as Record<string, any>;
      const propFunction = funcRecord.props;
      delete funcRecord.props;
      f = definedProps(func, propFunction);
    }

    component = f.call(this, props !== null ? props : {});
  } catch (error) {
    console.error(`[${func.name ?? "-"}()] - [Parser error]: ${error}`);
  }

  if (component && validationNode(component, func.name) === true) {
    return component as NodeO;
  }

  return null;
}

/**
 * Если функция в tag имеет ещё компонент, то необходимо обработать его
 * @param node - Component
 * @returns Или объект или null
 */
function recursiveNode(node: NodeO): NodeO | null {
  const quee: NodeO[] = [node];
  let returnedNode: NodeO = node;

  while (quee.length > 0) {
    const node = quee.shift();

    if (node && typeof node.tag === "function") {
      let object: Record<string, unknown> = {};

      if (node.props) {
        object = { ...node.props };
      }
      if (node.children) {
        const ch = node.children.flat(1);
        object["children"] = ch;
      }

      let component: unknown | null = null;
      try {
        let f = node.tag as
          | ((insertProps: Props) => NodeB | null)
          | (() => unknown);
        if ((node.tag as Record<string, any>).props !== undefined) {
          const prop = (node.tag as Record<string, any>).props;
          delete (node.tag as Record<string, any>).props;
          f = definedProps(node.tag, prop);
        }

        component = f.call(this, object);
      } catch (error) {
        console.warn(`[${node.tag.name ?? "-"}()] Recursive ${error}`);
      }

      if (component && validationNode(component, node.tag.name) === true) {
        returnedNode = component as NodeO;
        if (Array.isArray(returnedNode)) {
          quee.push(...returnedNode);
        } else {
          quee.push(returnedNode);
        }
      } else if (component === null) {
        return null;
      }
    }
  }

  return returnedNode;
}

/* TODO
[ ] - Есть чувство, что parseNodeF и parseNodeO - имеют очень много общего и их можно объединить 
*/

/**
 * Функция помогающая обработать компонент.
 * @param app Функция компонента
 * @param props Объект props сверху
 * @returns Или объект или null
 */
function parserNodeF(
  app: () => unknown,
  props: Props | null = null,
  parent: NodeOP | null = null,
): NodeOP | null {
  let component = prepareComponent.call(this, app, props);

  if (component === null) {
    console.warn(`[${app.name ?? "-"}()] Component don't be build`);
    return null;
  }

  component.nameC = app.name;

  if (this.globalComponents && typeof component.tag === "string") {
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
    console.warn(`[${app.name ?? "-"}()] Component don't parse`);
    return null;
  }

  if (typeof component.tag === "function") {
    component = recursiveNode.call(this, component);
  }

  if (component === null) {
    console.warn(`[${app.name ?? "-"}()] Component don't be build`);
    return null;
  }

  const componentO: NodeOP = {
    ...component,
    node: null,
    parent,
    type: TypeNode.Component,
    $component: new Subject(),
  };

  if (component.keyNode === undefined) {
    componentO.keyNode = genUID(8);
  }

  if (
    typeof componentO.tag === "string" &&
    REACTIVE_COMPONENT.includes(componentO.tag)
  ) {
    return reactiveWorkComponent(componentO) as any;
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

  if (componentO.hooks) {
    // Тут сразу запуститься проверка на update и beforeUpdate
    InvokeHook(componentO, "updated");
  }

  return componentO;
}

/**
 * Функция для обработки объекта Компонента
 * @param node - объект с настройками компонента
 * @returns Или объект или null
 */
function parserNodeO(node: NodeO, parent: NodeOP | null = null): NodeOP | null {
  let workNode: NodeO | null = node;

  // TODO Не уверен в этом коде
  if (this.globalComponents !== undefined && typeof workNode.tag === "string") {
    const nameTag = /([-_][a-z])/g.test(workNode.tag)
      ? snakeToCamel(workNode.tag)
      : workNode.tag;

    if (this.globalComponents[nameTag] !== undefined) {
      workNode = prepareComponent.call(this, this.globalComponents[nameTag]);
    }
  }
  if (workNode === null) {
    return null;
  }
  let nameC = undefined;
  if (typeof workNode.tag === "function") {
    nameC = workNode.tag.name;
    workNode = recursiveNode.call(this, workNode);
  }

  if (workNode === null) {
    console.warn(`[${nameC}()] - failed parsing`);
    return null;
  }

  const componentO: NodeOP = {
    ...workNode,
    node: null,
    parent,
    type: TypeNode.Component,
    $component: new Subject(),
  };

  componentO.nameC = nameC ?? parent?.nameC;

  if (workNode.keyNode === undefined) {
    componentO.keyNode = genUID(8);
  }

  if (REACTIVE_COMPONENT.includes(String(componentO.tag))) {
    return reactiveWorkComponent(componentO) as any;
  }

  if (componentO.hooks && !InvokeHook(componentO, "beforeCreate")) {
    console.warn(
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
    console.warn(
      `[${componentO.nameC ?? "-"}()] hooks: "created" - Error in hook`,
    );
  }

  if (componentO.hooks) {
    // Тут сразу запуститься проверка на update и beforeUpdate
    InvokeHook(componentO, "updated");
  }
  return componentO;
}

export { parserNodeF, parserNodeO };
