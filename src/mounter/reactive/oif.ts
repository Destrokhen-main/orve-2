import { TypeNode } from "../../parser/type";
import { ReactiveType } from "../../reactive/type";
import { singelMounterChildren } from "../children";
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

  const mounterInsance = singelMounterChildren(null);

  const currentRules = item.rules();
  lastAnswer = currentRules;
  if (item.answer[currentRules] !== undefined) {
    const node = mounterInsance(item.answer[currentRules]);

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
    const node = mounterInsance(item.answer["else"]);
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
      e.$sub.subscribe((next: unknown) => {
        // не хочу дублировать функционал, поэтому всё проверку поставлю тут.
        // эти условия работают только для refO
        if (
          (e.type === ReactiveType.RefO && typeof next !== "object") ||
          (next !== undefined &&
            next !== null &&
            (next as Record<string, any>).key !== undefined &&
            (next as Record<string, any>).key !== e.key)
        ) {
          return;
        }

        const currentRules = item.rules();
        if (lastAnswer !== currentRules) {
          if (item.answer[currentRules] !== undefined) {
            const node = mounterInsance(item.answer[currentRules]);
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
            const node = mounterInsance(item.answer["else"]);
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
