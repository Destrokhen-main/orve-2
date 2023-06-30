import { InvokeHook } from "../helper/hookHelper";
import { NodeOP } from "../parser/parser";
import { mounterChildren } from "./children";
import { propsWorker } from "./props";

function mounterNode(root: Element | null, tree: NodeOP) {
  if (typeof tree.tag !== "string") {
    return null
  }

  // before mount
  if (tree.hooks && !InvokeHook(tree, "beforeMount", null)) {
    console.warn("Before mount hook error")
  }

  const elem = document.createElement(tree.tag);

  if (tree.props !== undefined) {
    propsWorker(elem, tree.props);
  }

  if (tree.children !== undefined) {
    tree.children = mounterChildren(elem, tree.children)
  }

  tree.node = elem;

  if (root !== null) {
    root.appendChild(elem);
  }

  if (tree.hooks && !InvokeHook(tree, "mounted", null)) {
    console.warn("Before mount hook error")
  }

  return tree;
}

export { mounterNode }