// import { InvokeHook } from "../helper/hookHelper";
// import { FRAGMENT } from "../keys";
// import { NodeOP } from "../parser/parser";
// import { LifeHook } from "../utils/typeLifehooks";
// import { mounterChildren } from "./children";
// import { propsWorker } from "./props";

// function upperHooksWorker(tree: any, nameHook: string) {
//   const quee = [tree];

//   while (quee.length > 0) {
//     const item = quee.shift();

//     if (item.hooks !== undefined && item.hooks[nameHook] !== undefined) {
//       item.hooks[nameHook]();
//     }

//     if (item.parent) {
//       quee.push(item.parent);
//     }
//   }
// }

// /**
//  * Монтирование node
//  * @param root - HTMLElement родителя
//  * @param tree - Компонент, который нужно отрисовать
//  * @returns Обновлённый объект с HTMLElement
//  */
// function mounterNode(root: Element | null, tree: NodeOP) {
//   if (typeof tree.tag !== "string") {
//     return null;
//   }

//   if (tree.tag === FRAGMENT) {
//     tree.node = root;
//     tree.instance!.el = root;

//     return mounterChildren(root, tree.children!);
//   }

//   // before mount
//   if (!InvokeHook(tree, LifeHook.onBeforeMounted)) {
//     console.warn(
//       `[${
//         tree.nameComponent ?? "-"
//       }()] - hooks: "beforeMount" - Before mount hook error`,
//     );
//   }

//   const elem = document.createElement(tree.tag);

//   if (tree.props !== undefined) {
//     propsWorker(elem, tree.props);
//   }

//   if (tree.children !== undefined) {
//     tree.children = mounterChildren(elem, tree.children, {
//       type: tree.type,
//       $sub: tree.$sub,
//     });
//   }

//   tree.node = elem;
//   tree.instance!.el = elem;

//   // const beforeUpdate = scheduled();
//   // const updated = scheduled();
//   // tree.$sub?.subscribe((n: any) => {
//   //   switch (n) {
//   //     case "beforeUpdate":
//   //       beforeUpdate(() => upperHooksWorker(tree, n), n);
//   //       break;
//   //     case "updated":
//   //       updated(() => upperHooksWorker(tree, n), n);
//   //       break;
//   //   }
//   // });

//   if (root !== null) {
//     root.appendChild(elem);
//   }

//   if (tree.ref !== undefined) {
//     tree.ref.value = elem;
//   }

//   elem.addEventListener("beforeunload", () => {
//     InvokeHook(tree, LifeHook.onBeforeUnmounted);
//   });

//   elem.addEventListener("unload", () => {
//     InvokeHook(tree, LifeHook.onUnmounted);
//   });

//   if (!InvokeHook(tree, LifeHook.onMounted)) {
//     console.warn(
//       `[${
//         tree.nameComponent ?? "-"
//       }()] hooks: "mounted" - Before mount hook error`,
//     );
//   }

//   return tree;
// }

// export { mounterNode };

import { NodeOP } from "../parser/parser";
import { FRAGMENT } from "../keys";
import { InvokeHook } from "../helper/hookHelper";
import { LifeHook } from "../utils/typeLifehooks";
import { createElement, insert } from "./dom";

import { mounterChildren } from "./children";
import { propsWorker } from "./props";

export function mounterComponent(root: Element | null, tree: NodeOP) {
  if (tree.tag === FRAGMENT) {
    tree.instance.el = root;

    const childrenMounter = tree.children.map((child: any) => {
      return mounterChildren(root, child);
    });

    if (root === null) {
      return childrenMounter;
    }
    return tree;
  }

  if (!InvokeHook(tree, LifeHook.onBeforeMounted)) {
    console.log("error", LifeHook.onBeforeMounted);
  }

  const element = createElement(tree.tag as string);
  tree.instance.el = element;

  if (tree.props) {
    propsWorker(element, tree.props);
  }

  if (tree.children.length > 0) {
    tree.children.forEach((child: any) => {
      mounterChildren(element, child);
    });
  }

  if (root) {
    insert(element, root);
  } else {
    return element;
  }

  if (!InvokeHook(tree, LifeHook.onMounted)) {
    console.log("error", LifeHook.onBeforeMounted);
  }

  return tree as any;
}
