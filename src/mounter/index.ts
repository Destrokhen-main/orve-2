import { InvokeHook } from "../helper/hookHelper";
import { FRAGMENT } from "../keys";
import { NodeOP } from "../parser/parser";
import { scheduled } from "../utils/line/schedual";
import { mounterChildren } from "./children";
import { propsWorker } from "./props";

function upperHooksWorker(tree: any, nameHook: string) {
  const quee = [tree];

  while (quee.length > 0) {
    const item = quee.shift();

    if (item.hooks !== undefined && item.hooks[nameHook] !== undefined) {
      item.hooks[nameHook]();
    }

    if (item.parent) {
      quee.push(item.parent);
    }
  }
}

/**
 * Монтирование node
 * @param root - HTMLElement родителя
 * @param tree - Компонент, который нужно отрисовать
 * @returns Обновлённый объект с HTMLElement
 */
function mounterNode(root: Element | null, tree: NodeOP) {
  if (typeof tree.tag !== "string") {
    return null;
  }

  if (tree.tag === FRAGMENT) {
    return mounterChildren(root, tree.children!);
  }

  // before mount
  if (tree.hooks && !InvokeHook(tree, "beforeMount")) {
    console.warn(
      `[${tree.nameC ?? "-"
      }()] - hooks: "beforeMount" - Before mount hook error`,
    );
  }

  const elem = document.createElement(tree.tag);

  if (tree.props !== undefined) {
    propsWorker(elem, tree.props);
  }

  if (tree.children !== undefined) {
    tree.children = mounterChildren(elem, tree.children, {
      type: tree.type,
      $sub: tree.$sub,
    });
  }

  tree.node = elem;

  const beforeUpdate = scheduled();
  const updated = scheduled();
  tree.$sub?.subscribe((n: any) => {
    switch (n) {
      case 'beforeUpdate':
        beforeUpdate(() => upperHooksWorker(tree, n), n);
        break;
      case 'updated':
        updated(() => upperHooksWorker(tree, n), n);
        break;
    }
  });

  if (root !== null) {
    root.appendChild(elem);
  }

  if (tree.ref !== undefined) {
    tree.ref.value = elem;
  }

  if (tree.hooks && !InvokeHook(tree, "mounted")) {
    console.warn(
      `[${tree.nameC ?? "-"}()] hooks: "mounted" - Before mount hook error`,
    );
  }

  return tree;
}

export { mounterNode };
