import { TypeNode } from "../../parser/type";
import { ReactiveType } from "../../reactive/type";
import { isEqual } from "../../utils/isEqual";
import { returnNewClone } from "../../utils/returnClone";
import { singleMounterChildren } from "../children";
import { RefCComponentWorker } from "./refC";

// TODO
// [ ] - o-fragment attribute
// [x] - o-if in o-if
// [ ] - Написать тесты для refO и o-if.
function OifWorker(
  root: Element | null,
  item: Record<string, any>,
  needReturnRoot: boolean = false,
) {
  let workedNode: Comment | HTMLElement | null | Element = null;
  let lastAnswer: any = null;

  const mounterInstance = singleMounterChildren(null);

  const currentRules = item.rule();
  lastAnswer = currentRules;
  if (item.answer[currentRules] !== undefined) {
    const node = mounterInstance(item.answer[currentRules]);
    if (node.type === TypeNode.Reactive) {
      if (node.value.type === ReactiveType.Oif) {
        const htmlNode: any = OifWorker(root, node.value, true);
        workedNode = htmlNode;
      } else if (node.value.type === ReactiveType.RefCComponent) {
        const htmlNode: any = RefCComponentWorker(root, node.value);
        if (htmlNode !== null) workedNode = htmlNode;
      }
    } else if (node.node !== undefined) {
      workedNode = node.node;
      root?.appendChild(node.node);
    }
  } else if (item.answer["else"] !== undefined) {
    const node = mounterInstance(item.answer["else"]);
    if (node.node !== undefined) {
      workedNode = node.node;
      root?.appendChild(node.node);
    }
  } else {
    workedNode = document.createComment(" o-if ");
    root?.appendChild(workedNode);
  }

  if (item.dep !== undefined) {
    item.dep.forEach((e: any) => {
      let lastValue: any;
      e.$sub.subscribe(() => {
        if (e.type === ReactiveType.RefO) {
          const i = e as any;
          const value = i.parent[i.key];

          if (isEqual(value, lastValue)) {
            return;
          }
          lastValue = returnNewClone(value);
        }

        const currentRules = item.rule();
        if (lastAnswer !== currentRules) {
          if (item.answer[currentRules] !== undefined) {
            const node = mounterInstance(item.answer[currentRules]);
            if (node.type === TypeNode.Reactive) {
              if (node.value.type === ReactiveType.Oif) {
                const htmlNode: any = OifWorker(root, node.value, true);
                workedNode?.replaceWith(htmlNode);
                workedNode = htmlNode;
              } else if (node.value.type === ReactiveType.RefCComponent) {
                const htmlNode: any = RefCComponentWorker(root, node.value);
                if (htmlNode !== null) {
                  workedNode?.replaceWith(htmlNode);
                  workedNode = htmlNode;
                }
              }
            } else if (node.node !== undefined) {
              workedNode?.replaceWith(node.node);
              workedNode = node.node;
            }
          } else if (item.answer.else !== undefined) {
            const node = mounterInstance(item.answer["else"]);
            if (node.node !== undefined) {
              workedNode?.replaceWith(node.node);
              workedNode = node.node;
            }
          } else {
            const comment = document.createComment(" oif ");
            workedNode?.replaceWith(comment);
            workedNode = comment;
          }
          lastAnswer = currentRules;
        }
      });
    });
  }

  if (needReturnRoot) {
    return workedNode;
  }
}

export { OifWorker };
