import { IRefC } from "./reactive/refC";
export type Tag = string | (() => unknown) | IRefC;
export type Props = {
  [x: string]: unknown;
  template?: Record<string, unknown>;
};

export type Children = NodeB | unknown | (() => unknown);
export type FragmentT = { children?: Children };

export interface NodeHooks {
  beforeCreate: (instance?: any) => void;
  created: (instance?: any) => void;
  beforeMount: (instance?: any) => void;
  mounted: (instance?: any) => void;
  beforeUpdate: (instance?: any) => void;
  updated: (instance?: any) => void;
  beforeUnmount: (instance?: any) => void;
  unmounted: (instance?: any) => void;
}

export interface NodeB {
  tag: Tag;
  keyNode?: string | number;
  props?: Props;
  children?: Children[];
  hooks?: NodeHooks;
  nameC?: string;
  ref?: any; // TODO fix this
}

export interface JSX {
  Node: (
    tag: Tag,
    props: Props | null,
    ...children: Children[]
  ) => NodeB | null;
  Fragment: (node: FragmentT) => NodeB | null;
}

export interface iTemplate {
  tag: "template";
  props: Record<string, unknown> | { name: string };
  children: unknown[] | NodeB;
}
