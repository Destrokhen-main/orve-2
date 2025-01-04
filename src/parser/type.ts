import { RefImp } from "../reactive/ref";
import { ReactiveType } from "../reactive/type";

export enum TypeNode {
  Static = "Static",
  HTML = "HTML",
  Component = "Component",
  Reactive = "Reactive",
}

export enum TypeProps {
  Static = "Static",
  Event = "Event",
  EventReactive = "EventReactive",
  EventReactiveF = "EventReactiveF",
  StaticReactive = "StaticReactive",
  ReactiveComputed = "ReactiveComputed",
  Reactive = "Reactive",
}

// Static Child Node
export interface NodeChild {
  type: TypeNode;
  value: string | number | boolean;
  node: Element | null | Text;
}

export interface NodeHtml {
  type: TypeNode;
  value: string;
  node: HTMLElement | null;
}

export interface ReactiveNode {
  type: TypeNode;
  value: RefImp<any>;
  node: HTMLElement | null;
}

export interface IRefCSetup {
  type: ReactiveType;
  proxy: any;
  props?: Record<string, any>;
  context: Record<string, any>;
}
