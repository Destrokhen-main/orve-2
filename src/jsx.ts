import { FRAGMENT, TEMPLATE } from "./keys";

type Tag = string | (() => any); // TODO изменить типы
export type Props = Record<string, any>;
export type Children = any;
export type FragmentT = { children?: Children };

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

export const ACCESS_KEY = [
  "tag",
  "props",
  "children",
  "hooks",
  "ref",
  "keyNode",
];

export interface NodeB {
  tag: Tag;
  keyNode?: string | number;
  props?: Props;
  children?: Children[];
  hooks?: NodeHooks;
  ref?: any; // TODO fix this
}

export interface JSX {
  Node: (tag: Tag, props: Props | null, ...children: Children) => NodeB;
  Fragment: (node: FragmentT) => NodeB;
}

const DIRECTIVES_ORVE = ["o-hooks", "o-ref", "o-key"];
/**
 * Node creater
 * @param tag - String or Component
 * @param props - Object props for component
 * @param children - Array is any items
 * @returns Object of Node
 */
function Node(
  tag: Tag,
  props: Props | null = null,
  ...children: Children
): NodeB {
  if (typeof tag === "function" && tag.name === FRAGMENT) {
    return Fragment({ children });
  }

  const Node: NodeB = { tag };

  if (props !== null) {
    const SetProps: Record<string, any> = {};

    Object.keys(props).forEach((key) => {
      if (DIRECTIVES_ORVE.includes(key)) {
        const inseredKey = key
          .replace("o-", "")
          .toLocaleLowerCase()
          .trim() as keyof NodeB;

        if ((inseredKey as string) === "key") {
          Node.keyNode = String(props[key]);
        } else {
          Node[inseredKey] = props[key];
        }
      } else {
        SetProps[key] = props[key];
      }
    });

    Node.props = SetProps;
  }
  if (children.length > 0 && typeof tag === "function") {
    // Проведём работы, чтобы избавиться от всех template
    const newChild: any[] = [];

    const template: Record<string, any> = {};

    children.forEach((e: any) => {
      if (typeof e !== "object") {
        newChild.push(e);
        return;
      }

      if (e.tag !== undefined && e.tag === TEMPLATE) {
        if (e.props !== undefined && e.props.name !== undefined) {
          template[e.props.name] = e.children;
        } else {
          template.default = e.children;
        }
      }
    });

    if (Object.keys(template).length > 0) {
      if (Node.props !== undefined && Node.props !== null) {
        Node.props.template = template;
      } else {
        Node.props = { template };
      }
    }

    if (newChild.length > 0) {
      Node.children = newChild;
    }
  } else if (children.length > 0) {
    // На всякий случай, если остается тут template
    // но прошлое уловие не прошло, тогда надо удалить все template
    const prep = children.filter(
      (e: any) => typeof e !== "object" && e.tag !== TEMPLATE,
    );

    if (prep.length > 0) {
      Node.children = prep;
    }
  }
  return Node;
}

/**
 * Fragment creater
 * @param node Object
 * @returns Object of Node
 */
function Fragment(node: FragmentT): NodeB {
  return {
    tag: FRAGMENT,
    children: node.children !== undefined ? node.children : [],
  };
}

export { Node, Fragment };
