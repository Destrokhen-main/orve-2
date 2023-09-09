import { Subject } from "rxjs";
import { NodeB, Props, Children } from "../jsx-type";
import { TypeNode } from "./type";

export interface NodeO extends NodeB {
  tag: string | ((props?: Record<string, unknown>) => unknown);
  props?: Props;
  children?: Children[];
}

export interface NodeOP extends NodeO {
  keyNode?: string | number;
  node: Element | null;
  parent: NodeOP | null;
  $component: Subject<string>;
  type: TypeNode;
}
