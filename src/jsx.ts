import { Tag, Props, Children, NodeB, iTemplate, FragmentT } from "./jsx-type";
import { KEY_NEED_REWRITE } from "./keys";
import { FRAGMENT, TEMPLATE } from "./keys";
import { ReactiveType } from "./reactive/type";

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

export const ACCESS_KEY = [
  "tag",
  "props",
  "children",
  "hooks",
  "ref",
  "keyNode",
  "nameC",
];

const DIRECTIVES_ORVE = ["o-hooks", "o-ref", "o-key"];

/* TODO 
[ ] - Если пользовать использует RefC template тоже должен работать
*/

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
): NodeB | null {
  if (typeof tag === "function" && tag.name === FRAGMENT) {
    return Fragment({ children });
  }

  const Node: NodeB = { tag };

  if (props !== null) {
    const SetProps: Record<string, unknown> = {};

    Object.keys(props).forEach((key) => {
      if (KEY_NEED_REWRITE.includes(key)) {
        SetProps[`o${key}`] = props[key];
      } else if (DIRECTIVES_ORVE.includes(key)) {
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
  if (
    children.length > 0 &&
    (typeof tag === "function" ||
      (typeof tag === "object" && tag.type === ReactiveType.RefC))
  ) {
    // Проведём работы, чтобы избавиться от всех template
    const newChild: Children[] = [];

    const template: Record<string, unknown> = {};

    children.forEach((e: unknown) => {
      if (typeof e !== "object") {
        newChild.push(e as Children);
        return;
      }

      // <template name="asd">
      if (e && typeof e === "object") {
        const m = e as Record<string, unknown> | iTemplate;
        if (m.tag && m.tag === TEMPLATE && m.props) {
          const props = m.props as Record<string, unknown>;
          if (props.name && typeof props.name === "string") {
            template[props.name] = m.children;
          } else {
            template.default = m.children;
          }
        }
      }
    });

    if (Object.keys(template).length > 0) {
      if (Node.props) {
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
    const prep: unknown[] = [];
    for (let i = 0; i !== children.length; i++) {
      if (typeof children[i] !== "object") {
        prep.push(children[i]);
      } else if (
        (typeof children[i] === "object" &&
          (children[i] as Record<string, unknown>).tag === undefined) ||
        ((children[i] as Record<string, unknown>).tag &&
          (children[i] as Record<string, unknown>).tag !== TEMPLATE)
      ) {
        prep.push(children[i]);
      }
    }
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
function Fragment(node: FragmentT): NodeB | null {
  if (!Array.isArray(node.children)) {
    return null;
  }

  return {
    tag: FRAGMENT,
    children: node.children !== undefined ? node.children : [],
  };
}

export { Node, Fragment };
