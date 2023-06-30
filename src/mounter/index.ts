import { NodeOP } from "../parser/parser";
import { mounterChildren } from "./children";
import { propsWorker } from "./props";

function mounterNode(root: Element | null, tree: NodeOP) {
  if (typeof tree.tag !== "string") {
    return null
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

  return tree;
}

export { mounterNode }