import { NodeOP } from "../parser/parser";
import { mounterChildren } from "./children";

export function mounterTemplate(root: Element | null, tree: NodeOP) {
  if (tree.parent === null || tree.parent?.node === null) {
    const nodes = mounterChildren(null, tree.children);
    if (root !== null) {
      nodes.forEach((e) => {
        root?.appendChild(e.node);
      });
    }
    return nodes;
  }

  return [];
}
