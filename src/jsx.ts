import { Children, NodeB, Props, Tag } from "./jsx-type";
import { FRAGMENT } from "./keys";
import { ReactiveType } from "./reactive/type";

function For(props: Props | null, children: Children[]) {
  return Node(ReactiveType.RefArrFor, props, ...children);
}

function If(props: Props | null, children: Children[]) {
  return Node(ReactiveType.Oif, props, ...children);
}

function Component(props: Props | null, children: Children[]) {
  return Node(ReactiveType.Component, props, ...children);
}

function notNullChildren(array: unknown[]) {
  return array.filter((ch) => ch !== null && ch !== undefined);
}

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
  ...children: Children[]
): NodeB {
  if (
    (typeof tag === "function" && tag.name === FRAGMENT) ||
    (typeof tag === "string" && tag.toLowerCase() === FRAGMENT.toLowerCase())
  ) {
    return Fragment(props, ...children);
  }

  if (typeof tag === "function" && tag.name === "If") {
    return If(props, children) as NodeB;
  }

  if (typeof tag === "function" && tag.name === "For") {
    return For(props, children) as NodeB;
  }

  return {
    tag: tag,
    props: props ?? {},
    children: notNullChildren(children),
  };

  // if (
  //   (typeof tag === "function" && tag.name === FRAGMENT) ||
  //   (typeof tag === "string" && tag === FRAGMENT.toLowerCase())
  // ) {
  //   return Fragment(props, ...children);
  // }
  // if (typeof tag === "string" && tag === "o-for") {
  //   return For(props, children) as any;
  // }
  // const Node: NodeB = { tag };
  // if (props !== null) {
  //   const SetProps: Record<string, any> = {};
  //   Object.keys(props).forEach((key) => {
  //     if (KEY_NEED_REWRITE.includes(key)) {
  //       SetProps[`o${key}`] = props[key];
  //     } else if (DIRECTIVES_ORVE.includes(key)) {
  //       const insertedKey = key.replace("o-", "").toLocaleLowerCase().trim();
  //       if (insertedKey === "key") {
  //         Node.keyNode = String(props[key]);
  //       } else {
  //         Node[insertedKey as keyof NodeB] = props[key];
  //       }
  //     } else {
  //       SetProps[key] = props[key];
  //     }
  //   });
  //   Node.props = SetProps;
  // }
  // if (
  //   children.length > 0 &&
  //   (typeof tag === "function" ||
  //     (typeof tag === "object" &&
  //       (tag as Record<string, any>).type === ReactiveType.RefC))
  // ) {
  //   // Проведём работы, чтобы избавиться от всех slot
  //   const newChild: any[] = [];
  //   const slot: Record<string, any> = {};
  //   children.forEach((e: any) => {
  //     if (typeof e !== "object") {
  //       newChild.push(e);
  //       return;
  //     }
  //     if (e.tag !== undefined && e.tag === FRAGMENT) {
  //       if (e.props !== undefined && e.props.name !== undefined) {
  //         slot[e.props.name] = e.children;
  //       } else {
  //         newChild.push(e);
  //       }
  //     } else {
  //       newChild.push(e);
  //     }
  //   });
  //   if (Object.keys(slot).length > 0) {
  //     if (Node.props) {
  //       Node.props.$slot = slot;
  //     } else {
  //       Node.props = { $slot: slot };
  //     }
  //   }
  //   if (newChild.length > 0) {
  //     Node.children = newChild;
  //   }
  // } else if (children.length > 0) {
  //   Node.children = children;
  // }
  // return Node;
}

/**
 * Fragment creater
 * @param node Object
 * @returns Object of Node
 */
function Fragment(props: Props | null, ...children: any[]): NodeB {
  const a = {
    tag: FRAGMENT,
    children: children.filter((e) => e !== null && e !== undefined),
  } as NodeB;

  if (props) {
    a["props"] = props;
  }

  return a;
}

export { Node, Fragment, For, If, Component };
