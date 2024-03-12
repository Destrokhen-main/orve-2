import { TypeNode } from "../../parser/type";
import { ReactiveType } from "../../reactive/type";
import { getDeps } from "../../utils/getDepsOfFunction";
import { isEqual } from "lodash-es";
import { returnNewClone } from "../../utils/returnClone";
import { singleMounterChildren } from "../children";
import { RefCComponentWorker } from "./refC";
import { unique } from "../../utils/line/uniquaTransform";
import { parseSingleChildren } from "../../parser/children";
import { parserNodeF } from "../../parser/parser";

// ПЕРЕПИСЫВАЕМ, НЕ РАБОТАЕТ КАК ХОЧУУУ

// function drawingFunction(
//   append: any,
//   workedNode: any,
//   _root: any,
//   replace: boolean = false,
// ) {
//   let root;
//   if (replace) {
//     if (Array.isArray(workedNode)) {
//       root = workedNode[0];
//       for (let i = 1; i !== workedNode.length; i++) {
//         workedNode[i].remove();
//       }
//     } else {
//       root = workedNode;
//     }
//   } else {
//     root = _root;
//   }

//   if (Array.isArray(append)) {
//     const nodes = [append[0].node];
//     root[!replace ? "appendChild" : "replaceWith"](append[0].node);

//     let l = append[0].node;
//     for (let i = 1; i !== append.length; i++) {
//       l.after(append[i].node);
//       l = append[i].node;
//       nodes.push(append[0].node);
//     }
//     return nodes;
//   } else {
//     root[!replace ? "appendChild" : "replaceWith"](append.node);
//     return append;
//   }
// }

// function renderFunction(
//   workedNode: any,
//   answers: any,
//   rules: any,
//   mounterInstance: any,
//   root: any,
//   replace: boolean = false,
// ) {
//   if (answers[rules] !== undefined) {
//     const node = mounterInstance(answers[rules]);

//     if (!Array.isArray(node)) {
//       if (node.type === TypeNode.Reactive) {
//         if (node.value.type === ReactiveType.Oif) {
//           const htmlNode: any = OifWorker(root, node.value, true);
//           return htmlNode;
//         } else if (node.value.type === ReactiveType.RefCComponent) {
//           const htmlNode: any = RefCComponentWorker(root, node.value);
//           if (htmlNode !== null) {
//             return htmlNode;
//           }
//         }
//       } else if (node.node !== undefined) {
//         return drawingFunction(node.node, workedNode, root, replace);
//       }
//     } else {
//       return drawingFunction(node, workedNode, root, replace);
//     }

//     if (node.type === TypeNode.Reactive) {
//       if (node.value.type === ReactiveType.Oif) {
//         const htmlNode: any = OifWorker(root, node.value, true);
//         workedNode = htmlNode;
//       } else if (node.value.type === ReactiveType.RefCComponent) {
//         const htmlNode: any = RefCComponentWorker(root, node.value);
//         if (htmlNode !== null) workedNode = htmlNode;
//       }
//     } else if (node.node !== undefined) {
//       root?.appendChild(node.node);
//       return node.node;
//     }
//   } else if (answers["else"] !== undefined) {
//     const node = mounterInstance(answers["else"]);
//     if (node.node !== undefined) {
//       return drawingFunction(node, workedNode, root, replace);
//     }
//   } else {
//     const workedNode = document.createComment(" o-if ");
//     root[!replace ? "appendChild" : "replaceWith"](workedNode);
//     return workedNode;
//   }
// }

// // TODO
// // [ ] - o-fragment attribute
// // [x] - o-if in o-if
// // [ ] - Написать тесты для refO и o-if.
// function OifWorker(
//   root: Element | null,
//   item: Record<string, any>,
//   needReturnRoot: boolean = false,
// ) {
//   let workedNode: any = null;
//   let lastAnswer: any = null;

//   const mounterInstance = singleMounterChildren(null);

//   let deps = item.deps;

//   let currentRules;
//   if (item.deps === undefined || item.deps.length === 0) {
//     [deps, currentRules] = getDeps(item.rule);
//   } else {
//     currentRules = item.rule();
//   }
//   lastAnswer = currentRules;
//   workedNode = renderFunction(
//     workedNode,
//     item.answer,
//     currentRules,
//     mounterInstance,
//     root,
//   );
//   if (deps !== undefined) {
//     deps.forEach((e: any) => {
//       let lastValue: any;
//       e.$sub.subscribe(
//         unique(() => {
//           if (e.type === ReactiveType.RefO) {
//             const i = e as any;
//             const value = i.parent[i.key];

//             if (isEqual(value, lastValue)) {
//               return;
//             }
//             lastValue = returnNewClone(value);
//           }

//           const currentRules = item.rule();
//           if (lastAnswer !== currentRules) {
//             workedNode = renderFunction(
//               workedNode,
//               item.answer,
//               currentRules,
//               mounterInstance,
//               root,
//               true,
//             );
//             // if (item.answer[currentRules] !== undefined) {
//             //   const node = mounterInstance(item.answer[currentRules]);
//             //   if (node.type === TypeNode.Reactive) {
//             //     if (node.value.type === ReactiveType.Oif) {
//             //       const htmlNode: any = OifWorker(root, node.value, true);
//             //       workedNode?.replaceWith(htmlNode);
//             //       workedNode = htmlNode;
//             //     } else if (node.value.type === ReactiveType.RefCComponent) {
//             //       const htmlNode: any = RefCComponentWorker(root, node.value);
//             //       if (htmlNode !== null) {
//             //         workedNode?.replaceWith(htmlNode);
//             //         workedNode = htmlNode;
//             //       }
//             //     }
//             //   } else if (node.node !== undefined) {
//             //     workedNode?.replaceWith(node.node);
//             //     workedNode = node.node;
//             //   }
//             // } else if (item.answer.else !== undefined) {
//             //   const node = mounterInstance(item.answer["else"]);
//             //   if (node.node !== undefined) {
//             //     workedNode?.replaceWith(node.node);
//             //     workedNode = node.node;
//             //   }
//             // } else {
//             //   const comment = document.createComment(" oif ");
//             //   workedNode?.replaceWith(comment);
//             //   workedNode = comment;
//             // }
//             lastAnswer = currentRules;
//           }
//         }, e.value),
//       );
//     });
//   }

//   if (needReturnRoot) {
//     return workedNode;
//   }
// }
function removeAllNodes(nodes: any[] | any) {
  if (Array.isArray(nodes)) {
    const first = nodes[0];

    for (let i = 1; i < nodes.length; i++) {
      nodes[i].remove();
    }
    return first;
  } else {
    return nodes;
  }
}

function insertNodes(nodes: any[] | any, replacer: any) {
  if (Array.isArray(nodes)) {
    const returnedNodes = [nodes[0].node];
    replacer.replaceWith(nodes[0].node);
    let l = nodes[0].node;
    for (let i = 1; i < nodes.length; i++) {
      l.after(nodes[i].node);
      returnedNodes.push(nodes[i].node);
      l = nodes[i].node;
    }
    return returnedNodes;
  } else {
    replacer.replaceWith(nodes.node);
    return nodes.node;
  }
}
// TODO теряю контекст, а не должен
function componentBuilder(existNodes: any, answer: any, rule: any) {
  const replaceNode = removeAllNodes(existNodes);
  const mounterInstance = singleMounterChildren(null);
  if (answer[rule] !== undefined) {
    let ans = answer[rule];
    if (typeof ans === "function") {
      ans = parserNodeF.call(this.context ?? {}, answer[rule]);
    }

    const wNodes = mounterInstance(ans);
    return insertNodes(wNodes, replaceNode);
  } else if (answer.else !== undefined) {
    let ans = answer.else;
    if (typeof ans === "function") {
      ans = parserNodeF.call(this.context ?? {}, answer.else);
    }
    const wNodes = mounterInstance(ans);
    return insertNodes(wNodes, replaceNode);
  } else {
    replaceNode.replaceWith(this.COMMENT);
    return this.COMMENT;
  }
}

// [x] - o-fragment attribute
// [ ] - o-if in o-if
// [ ] - Написать тесты для refO и o-if.
// [ ] - c комента на блок, выходит плохо
function OifWorker(
  root: Element | null,
  item: Record<string, any>,
  needReturnRoot: boolean = false,
) {
  const COMMENT = document.createComment(" o-if ");
  root?.appendChild(COMMENT);
  let nodes: any = COMMENT;
  let currentAnswer: any = null;
  const { answer, rule } = item;

  let deps = [];
  if (item.dep) {
    deps = item.dep;
    currentAnswer = rule();
  } else {
    [deps, currentAnswer] = getDeps(rule);
  }
  nodes = componentBuilder.call(
    { context: item.context, COMMENT },
    nodes,
    answer,
    currentAnswer,
  );

  if (deps.length > 0) {
    deps.forEach((dep: any) => {
      dep.$sub.subscribe(
        unique(() => {
          const answerNow = rule();
          if (answerNow !== currentAnswer) {
            currentAnswer = answerNow;
            nodes = componentBuilder.call(
              { context: item.context, COMMENT },
              nodes,
              answer,
              answerNow,
            );
          }
        }, dep.value),
      );
    });
  }
}

export { OifWorker };
