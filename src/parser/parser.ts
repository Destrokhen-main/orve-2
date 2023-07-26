import { Props, Children, NodeB } from "../jsx";
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
}

function prepareComponent(
  func: (props?: Props) => unknown,
  props: Props | null = null,
): NodeO | null {
  let component: unknown | null = null;

  try {
    component = func.call(this, props !== null ? props : {});
  } catch (error) {
    console.error(`[Parser error]: ${error}`);
  }

  if (
    component !== null &&
    validationNode(component) === true &&
    component !== undefined
  ) {
    return component as NodeO;
  }

  return null;
}

function recursiveNode(node: NodeO): NodeO | null {
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

      let component: unknown | null = null;
      try {
        component = node.tag.call(this, object);
      } catch (error) {
        console.warn(`Recursive ${error}`);
      }

      if (
        component !== null &&
        validationNode(component) === true &&
        component !== undefined
      ) {
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
 * parse function component
 * @param app function
 * @param props
 * @returns
 */
function parserNodeF(
  app: () => unknown,
  props: Props | null = null,
  parent: NodeOP | null = null,
): NodeOP | null {
  let component = prepareComponent.call(this, app, props);

  if (component === null) {
    console.warn("Component don't be build");
    return null;
  }
  if (typeof component.tag === "function") {
    component = recursiveNode.call(this, component);
  }

  if (component === null) {
    return null;
  }

  const componentO: NodeOP = {
    ...component,
    node: null,
    parent,
    type: TypeNode.Component,
  };
  if (component.keyNode === undefined) {
    componentO.keyNode = genUID(8);
  }

  if (REACTIVE_COMPONENT.includes(String(componentO.tag))) {
    return reactiveWorkComponent(componentO) as any;
  }

  //NOTE beforeCreate
  if (componentO.hooks && !InvokeHook(componentO, "beforeCreate")) {
    console.error('Error in hook "beforeCreate"');
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
    console.error('Error in hook "created"');
  }

  return componentO;
}

/**
 * parsing object component
 * @param node
 */
function parserNodeO(node: NodeO, parent: NodeOP | null = null): NodeOP | null {
  let workNode: NodeO | null = node;
  if (typeof workNode.tag === "function") {
    workNode = recursiveNode.call(this, workNode);
  }

  if (workNode === null) {
    return null;
  }

  const componentO: NodeOP = {
    ...workNode,
    node: null,
    parent,
    type: TypeNode.Component,
  };

  if (workNode.keyNode === undefined) {
    componentO.keyNode = genUID(8);
  }

  if (REACTIVE_COMPONENT.includes(String(componentO.tag))) {
    return reactiveWorkComponent(componentO) as any;
  }

  if (componentO.hooks && !InvokeHook(componentO, "beforeCreate")) {
    console.warn('Error in hook "beforeCreate"');
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
    console.error('Error in hook "beforeCreate"');
  }
  return componentO;
}

export { parserNodeF, parserNodeO };
