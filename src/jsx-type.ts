import { refL } from "./reactive/refL";

export type Tag = string | (() => any); // TODO изменить типы
export type Props = Record<string, any>;
export type Children = any;
export type FragmentT = { props: Props | null, children: Children };

export const HOOKS_STRING_NAME = [
  "beforeCreate",
  "created",
  "beforeMount",
  "mounted",
  "beforeUpdate",
  "updated",
  "beforeUnmount",
  "unmounted",
];

type hookCallback = (instance?: any) => void;
export interface NodeHooks {
  beforeCreate: hookCallback;
  created: hookCallback;
  beforeMount: hookCallback;
  mounted: hookCallback;
  beforeUpdate: hookCallback;
  updated: hookCallback;
  beforeUnmount: hookCallback;
  unmounted: hookCallback;
}

export const ACCESS_KEY = [
  "tag",
  "props",
  "children",
  "hooks",
  "ref",
  "keyNode",
  "nameC",
];

export interface NodeB {
  tag: Tag;
  keyNode?: string | number;
  props?: Props;
  children?: Children[];
  hooks?: NodeHooks;
  nameC?: string;
  ref?: refL;
}


export interface JSX {
  Node: (tag: Tag, props: Props | null, ...children: Children) => NodeB;
  Fragment: (node: FragmentT) => NodeB;
}

export const DIRECTIVES_ORVE = ["o-hooks", "o-ref", "o-key"];
export const DIRECTIVES_WITHOUT_O = ["hooks", "ref", "key"];

export type TYPE_DIRECTIVES_W_O = typeof DIRECTIVES_WITHOUT_O[number];
export type TYPE_DIRECTIVES = typeof DIRECTIVES_ORVE[number];