import { TypeNode } from "../../parser/type";
import { ReactiveType } from "../../reactive/type";
import { singleMounterChildren } from "../children";
import { RefCComponentWorker } from "./refC";
import { insertHTMLNode, removeAllAndInsertComment } from '../../utils/insertHTML';

// TODO
// [ ] - o-fragment attribute
// [x] - o-if in o-if
// [ ] - Написать тесты для refO и o-if.
function OifWorker(
  root: Element | null,
  item: Record<string, any>,
  needReturnRoot: boolean = false,
) {
  let workedNode: Comment | HTMLElement | null | Element | any[] = null;
  let lastAnswer: any = null;

  const mounterInstance = singleMounterChildren(null);

  const currentRules = item.rule();
  lastAnswer = currentRules;
  if (item.answer[currentRules] !== undefined) {
    const node = mounterInstance(item.answer[currentRules]);
    workedNode = insertHTMLNode(workedNode === null ? root : workedNode, node);
    // if (node.type === TypeNode.Reactive) {
    //   if (node.value.type === ReactiveType.Oif) {
    //     const htmlNode: any = OifWorker(root, node.value, true);
    //     workedNode = htmlNode;
    //   } else if (node.value.type === ReactiveType.RefCComponent) {
    //     const htmlNode: any = RefCComponentWorker(root, node.value);
    //     if (htmlNode !== null) workedNode = htmlNode;
    //   }
    // } else if (node.node !== undefined) {
    //   workedNode = node.node;
    //   root?.appendChild(node.node);
    // }
  } else if (item.answer["else"] !== undefined) {
    const node = mounterInstance(item.answer["else"]);
    workedNode = insertHTMLNode(workedNode === null ? root : workedNode, node);
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

        const currentRules = item.rule();
        if (lastAnswer !== currentRules) {
          if (item.answer[currentRules] !== undefined) {
            const node = mounterInstance(item.answer[currentRules]);
            workedNode = insertHTMLNode(workedNode, node, true);
            // if (node.type === TypeNode.Reactive) {
            //   if (node.value.type === ReactiveType.Oif) {
            //     const htmlNode: any = OifWorker(root, node.value, true);
            //     workedNode?.replaceWith(htmlNode);
            //     workedNode = htmlNode;
            //   } else if (node.value.type === ReactiveType.RefCComponent) {
            //     const htmlNode: any = RefCComponentWorker(root, node.value);
            //     if (htmlNode !== null) {
            //       workedNode?.replaceWith(htmlNode);
            //       workedNode = htmlNode;
            //     }
            //   }
            // } else if (node.node !== undefined) {
            //   workedNode?.replaceWith(node.node);
            //   workedNode = node.node;
            // }
          } else if (item.answer.else !== undefined) {
            const node = mounterInstance(item.answer["else"]);
            workedNode = insertHTMLNode(workedNode === null ? root : workedNode, node, true);
          } else {
            const comment = document.createComment(" oif ");
            workedNode = removeAllAndInsertComment(workedNode, comment);
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
