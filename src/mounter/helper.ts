import { parseChildren } from "../parser/children";
import { NodeChild, NodeHtml } from "../parser/type";
import { Ref, RefA, RefFormater } from "../reactive/ref";
import { pairwise, startWith } from "rxjs";
import { InsertType, mounterChildren } from "./children";

function textNodeCreator(item: NodeChild) {
  const textNode = document.createTextNode(String(item.value));
  item.node = textNode;
  return item;
}

function htmlNodeCreate(item: NodeHtml) {
  const element = new DOMParser()
    .parseFromString(item.value, "text/html")
    .getElementsByTagName("body")[0];

  item.node = element.firstChild as HTMLElement;
  return item;
}

function RefChildCreator(root: Element | null, item: Ref) {
  const textNode = document.createTextNode(String(item.value));

  const sub = item.$sub;
  sub.pipe(startWith(item.value), pairwise()).subscribe({
    next([before, after]: [string | number, string | number]) {
      if (after !== undefined && before !== after) {
        textNode.textContent = String(after);
      }
    }
  } as any)

  if (root !== null) {
    root.appendChild(textNode);
  }
}

function RefFormateChildCreator(root: Element | null, item: RefFormater) {
  const formItem = item.value(item.parent.value);

  const textNode = document.createTextNode(String(formItem));

  item.parent.$sub.subscribe({
    next(after: string | number) {
        const formatedItem = item.value(after);
        textNode.textContent = String(formatedItem);
      }
    }
  )

  if (root !== null) {
    root.appendChild(textNode);
  }
}

function RefArray(root: Element | null, item: RefA, parent: any = null) {
  /*
  Если есть списки то что-то вставляется + -

  Если нет списка что делать

  Если новый список полностью новый

  Если список очиститься полностью
  */

  let mountedNode: Comment | any[] | null  = null;
  if (item.value.length === 0) {
    const comment = document.createComment(` refA - ${parent.keyNode} `);
    root?.appendChild(comment);
    mountedNode = comment;
  } else {
    const allNode = parseChildren(item.value, null);
    const mounted = mounterChildren(null, allNode as InsertType[]);
    if (root === null) return mounted;

    mountedNode = mounted;

    let startNode = root;

    for(let i = 0; i !== mounted.length; i++) {
      if (i === 0) {
        startNode.appendChild(mounted[i].node)
      } else {
        startNode?.after(mounted[i].node);
      }
      startNode = mounted[i].node;
    }
  }

  item.$sub.subscribe((next: Record<string, any>) => {
    if (next.type === "insert") {
      const newNode = parseChildren(next.value, null);
      const newMounted = mounterChildren(null, newNode as InsertType[]);

      const dir = next.dir;

      if (!Array.isArray(mountedNode)) {
        const startNode = newMounted.shift();
        mountedNode?.replaceWith(startNode.node);

        mountedNode = [ startNode ];
      }
      
      let nodeStart = dir === "right" ? mountedNode[mountedNode.length - 1].node : mountedNode[0].node; 
      for(let i = 0; i !== newMounted.length; i++) {
        if (i === 0) {
          nodeStart[dir === "right" ? "after" : "before"](newMounted[i].node);
        }
      }
      mountedNode[dir === "right" ? "push" : "unshift"](...newMounted);
      return;
    }

    if (next.type === "delete") {
      if (next.dir !== undefined) {
        const dir = next.dir === "left" ? "shift" : "pop";
        if (Array.isArray(mountedNode) && mountedNode.length >= 2) {
          const nd = mountedNode[dir]();
          nd.node.remove();
        } else if (Array.isArray(mountedNode) && mountedNode.length === 1) {
          const nd = mountedNode[dir]();
          const comment = document.createComment(` refA - ${parent.keyNode} `)

          nd.node.replaceWith(comment);
          mountedNode = comment;
        }
        return;
      } else if (next.start !== undefined && next.count !== undefined) {
        if (Array.isArray(mountedNode) && next.start >= 0) {
          const end = next.start + next.count > mountedNode.length ? mountedNode.length : next.start + next.count;
          if (end === mountedNode.length) {
            for(let i = 0; i !== end - 1; i++) {
              mountedNode[i].node.remove()
            }
            mountedNode.splice(0, end-1);
            const nd = mountedNode[0];

            const comment = document.createComment(` refA - ${parent.keyNode} `);

            nd.node.replaceWith(comment);
            mountedNode = comment;
          } else {
            for(let i = next.start;i < end; i++) {
              mountedNode[i].node.remove();
            }

            mountedNode.splice(next.start, end);
          }
        }
      }
      return;
    }

    if (next.type === "insertByIndex") {
      const newNode = parseChildren(next.value, null);
      const newMounted = mounterChildren(null, newNode as InsertType[]);

      if (Array.isArray(mountedNode)) {
        const start = next.start <= mountedNode.length - 1 ? next.start : mountedNode.length - 1;

        let nd = mountedNode[start].node;

        for (let i = 0; i !== newMounted.length; i++) {
          if (i === 0 && start !== mountedNode.length - 1) {
            nd.before(newMounted[i].node)
          } else {
            nd.after(newMounted[i].node);
          }
          nd = newMounted[i].node;
        }
        mountedNode.splice(start, 0, ...newMounted);
      }
    }
  });
}


export { textNodeCreator, htmlNodeCreate, RefChildCreator, RefFormateChildCreator, RefArray }

