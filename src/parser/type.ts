import { Ref } from "../reactive/ref"

export enum TypeNode {
  Static = "Static",
  HTML = "HTML",
  Component = "Component",
  Reactive = "Reactive"
}

export enum TypeProps {
  Static = "Static",
  Event = "Event"
}

// Static Child Node
export interface NodeChild {
  type: TypeNode,
  value: string | number,
  node: Element | null | Text
}

export interface NodeHtml {
  type: TypeNode,
  value: string,
  node: HTMLElement | null
}

export interface ReactiveNode {
  type: TypeNode,
  value: Ref,
  node: HTMLElement | null
}