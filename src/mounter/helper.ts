import { parseChildren, parseSingleChildren } from "../parser/children";
import { NodeChild, NodeHtml } from "../parser/type";
import { Ref, RefA, RefFormater } from "../reactive/ref";
import { pairwise, startWith } from "rxjs";
import { InsertType, mounterChildren } from "./children";

import fastEqual from "fast-deep-equal"
import { mounterNode } from "./index";

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

function RefArray(root: Element | null, item: RefA, parent: any = null, callback: ((a: any, b: number) => any) | null = null) {
  let mountedNode: Comment | any[] | null  = null;
  if (item.value.length === 0) {
    const comment = document.createComment(` refA - ${parent.keyNode} `);
    root?.appendChild(comment);
    mountedNode = comment;
  } else {
    const prepaire = callback !== null ? item.value.map(callback) : item.value;
    const allNode = parseChildren(prepaire, null);
    const mm = mounterChildren(null, allNode as InsertType[]);

    let mounted: any = [];

    while(mm.length > 0) {
      const item = mm.shift();

      if (Array.isArray(item)) {
        mm.unshift(...item);
      } else {
        mounted.push(item);
      }
    }

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

    if (mounted.length === 0) {
      const comment = document.createComment(` refA - ${parent.keyNode} `);
      root?.appendChild(comment);
      mountedNode = comment;
    }
  }

  item.$sub.subscribe((next: Record<string, any>) => {
    if (next.type === "insert") {
      let m = 0;
      if (Array.isArray(mountedNode)) {
        m = next.dir === "right" ? mountedNode.length : 0;
      }

      const prepaire = callback !== null ? next.value.map((e: any, i: number) => callback(e, m + i)) : next.value;
      const newNode = parseChildren(prepaire, null);
      const mm = mounterChildren(null, newNode as InsertType[]);

      let newMounted: any = [];

      while(mm.length > 0) {
        const item = mm.shift();

        if (Array.isArray(item)) {
          mm.unshift(...item);
        } else {
          newMounted.push(item);
        }
      }

      const dir = next.dir;

      if (!Array.isArray(mountedNode)) {
        const startNode = newMounted.shift();
        mountedNode?.replaceWith(startNode.node);

        mountedNode = [ startNode ];
      }
      
      let nodeStart = dir === "right" ? mountedNode[mountedNode.length - 1].node : mountedNode[0].node; 
      for(let i = 0; i !== newMounted.length; i++) {
        nodeStart[dir === "right" ? "after" : "before"](newMounted[i].node);
        nodeStart = newMounted[i].node
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

      if (Array.isArray(mountedNode)) {
        const prepaire = callback !== null ? item.value.map(callback) : item.value;
        const allNode = parseChildren(prepaire, null);
        const mm = mounterChildren(null, allNode as InsertType[]);

        let mounted: any = [];

        while(mm.length > 0) {
          const item = mm.shift();

          if (Array.isArray(item)) {
            mm.unshift(...item);
          } else {
            mounted.push(item);
          }
        }

        for (let i = 0; i !== mountedNode.length; i++) {
          if (!fastEqual(mountedNode[i], mounted[i])) {
            mountedNode[i].node.replaceWith(mounted[i].node) 
            mountedNode[i] = mounted[i]
          }
        }
      }
      return;
    }

    if (next.type === "insertByIndex") {
      let start = 0;
      if(Array.isArray(mountedNode)) {
        start = next.start <= mountedNode.length - 1 ? next.start : mountedNode.length - 1;
      }
      
      const prepaire = callback !== null ? next.value.map((e: any, i: number) => callback(e, start + i)) : next.value;

      const newNode = parseChildren(prepaire, null);
      const mm = mounterChildren(null, newNode as InsertType[]);

      let newMounted: any = [];

      while(mm.length > 0) {
        const item = mm.shift();

        if (Array.isArray(item)) {
          mm.unshift(...item);
        } else {
          newMounted.push(item);
        }
      }

      if (Array.isArray(mountedNode)) {
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

      if (Array.isArray(mountedNode)) {
        const prepaire = callback !== null ? item.value.map(callback) : item.value;
        const allNode = parseChildren(prepaire, null);
        const mm = mounterChildren(null, allNode as InsertType[]);

        let mounted: any = [];

        while(mm.length > 0) {
          const item = mm.shift();

          if (Array.isArray(item)) {
            mm.unshift(...item);
          } else {
            mounted.push(item);
          }
        }

        for (let i = 0; i !== mountedNode.length; i++) {
          if (!fastEqual(mountedNode[i], mounted[i])) {
            mountedNode[i].node.replaceWith(mounted[i].node) 
            mountedNode[i] = mounted[i]
          }
        }
      }
    }

    if (next.type === "edit") {
      const prepaire = callback !== null ? callback(next.value, Number(next.key)) : next.value;
      const newNode = parseSingleChildren(null)(prepaire);
      const mm = mounterNode(null, newNode as any);

      if (mountedNode !== null && Array.isArray(mountedNode)) {
        if (!fastEqual(mountedNode[next.key], mm)) {
          mountedNode[next.key].node.replaceWith(mm.node);
          mountedNode[next.key] = mm;
        }
      }
    }
  });
}


export { textNodeCreator, htmlNodeCreate, RefChildCreator, RefFormateChildCreator, RefArray }

