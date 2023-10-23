import { InvokeHook } from "../helper/hookHelper";
import { FRAGMENT, TEMPLATE } from "../keys";
import { NodeOP } from "../parser/parser";
import { mounterChildren } from "./children";
import { propsWorker } from "./props";

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

  if (tree.tag === TEMPLATE) {
    return mounterChildren(root, tree.children);
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
    tree.children = mounterChildren(elem, tree.children);
  }

  tree.node = elem;

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
