// import { TypeNode } from "../../parser/type";
// import { ReactiveType } from "../../reactive/type";
// import { getDeps } from "../../utils/getDepsOfFunction";
// import { isEqual } from "lodash-es";
// import { returnNewClone } from "../../utils/returnClone";
// import { mounterChildren, singleMounterChildren } from "../children_old";
// import { RefCComponentWorker } from "./refC";
// import { unique } from "../../utils/line/uniquaTransform";
// import { parseSingleChildren } from "../../parser/children";
// import { parserNodeF } from "../../parser/parser";
// import { TypeNode } from "../../parser/type";
// import { ReactiveType } from "../../reactive/type";
import { mounterComponent } from "..";
import { insert, insertAfter, remove, replaceElement } from "../dom";
import { computed } from "../../reactive";

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
// function removeAllNodes(nodes: any[] | any) {
//   if (Array.isArray(nodes)) {
//     const first = nodes[0];

//     for (let i = 1; i < nodes.length; i++) {
//       nodes[i].remove();
//     }
//     return first;
//   } else {
//     return nodes;
//   }
// }

// /*
// [ ] - Нужны проверки на то, если тут придёт массив или же ещё условие какое-то
// [ ] - если ничего не пришло, значит ничего и не вставляем, или вставляем комммент
// */
// function insertNodes(nodes: any[] | any, replacer: any) {
//   if (Array.isArray(nodes)) {
//     // Только первый уровень чекает
//     nodes = nodes.map((e) => {
//       if (e.node !== undefined) return e;

//       if (e.type === TypeNode.Reactive) {
//         const val = e.value;

//         if (val.type === ReactiveType.Oif) {
//           return { node: OifWorker(null, val) };
//         }
//       }
//     });

//     const returnedNodes = [nodes[0].node];
//     replacer.replaceWith(nodes[0].node);
//     let l = nodes[0].node;
//     for (let i = 1; i < nodes.length; i++) {
//       l.after(nodes[i].node);
//       returnedNodes.push(nodes[i].node);
//       l = nodes[i].node;
//     }
//     return returnedNodes;
//   } else {
//     replacer.replaceWith(nodes.node);
//     return nodes.node;
//   }
// }

// function isNotBuildComponent(comp: unknown): boolean {
//   if (typeof comp !== "object" || !comp) {
//     return false;
//   }
//   const w = comp as Record<string, unknown>;
//   if (w.node !== undefined) {
//     return false;
//   }

//   if (w.tag === undefined) {
//     return false;
//   }

//   return true;
// }

// // TODO теряю контекст, а не должен
// function componentBuilder(existNodes: any, answer: any, rule: any) {
//   const replaceNode = removeAllNodes(existNodes);
//   const mounterInstance = singleMounterChildren(null);
//   if (answer[rule] !== undefined) {
//     let ans = answer[rule];
//     if (typeof ans === "function" || isNotBuildComponent(ans)) {
//       ans = parserNodeF.call(this.context ?? {}, answer[rule]);
//     }

//     const wNodes = mounterInstance(ans);
//     return insertNodes(wNodes, replaceNode);
//   } else if (answer.else !== undefined) {
//     let ans = answer.else;
//     if (typeof ans === "function" || isNotBuildComponent(ans)) {
//       ans = parserNodeF.call(this.context ?? {}, answer.else);
//     }
//     const wNodes = mounterInstance(ans);
//     return insertNodes(wNodes, replaceNode);
//   } else {
//     replaceNode.replaceWith(this.COMMENT);
//     return this.COMMENT;
//   }
// }

// [x] - o-fragment attribute
// [ ] - o-if in o-if
// [ ] - Написать тесты для refO и o-if.
// [ ] - c комента на блок, выходит плохо
// [x] - почему не могу вставить просто компонент вместо функции в {}
// [ ] - правильное общение o-if с o-for и другими структурами, попробовать обойтись без род ноды
// [ ] - при фрагменте надо придумать какой root отдавать
// function OifWorker(
//   root: Element | null,
//   item: Record<string, any>,
//   // eslint-disable-next-line @typescript-eslint/no-unused-vars
//   needReturnRoot: boolean = false,
// ) {
//   const COMMENT = document.createComment(" o-if ");
//   if (root) root.appendChild(COMMENT);
//   let nodes: any = COMMENT;
//   let currentAnswer: any = null;
//   const { answer, rule } = item;

//   let deps = [];
//   if (item.dep) {
//     deps = item.dep;
//     currentAnswer = rule();
//   } else {
//     [deps, currentAnswer] = getDeps(rule);
//   }
//   nodes = componentBuilder.call(
//     { context: item.context, COMMENT },
//     nodes,
//     answer,
//     currentAnswer,
//   );

//   if (deps.length > 0) {
//     deps.forEach((dep: any) => {
//       dep.$sub.subscribe(
//         unique(() => {
//           const answerNow = rule();
//           if (answerNow !== currentAnswer) {
//             currentAnswer = answerNow;
//             nodes = componentBuilder.call(
//               { context: item.context, COMMENT },
//               nodes,
//               answer,
//               answerNow,
//             );
//           }
//         }, dep.value),
//       );
//     });
//   }

//   if (!root) return nodes;
// }

// export { OifWorker };

function insertNode(root: Element | null, nodes: any) {
  if (Array.isArray(nodes)) {
    nodes.reduceRight((acc, e) => {
      insert(e, root, acc);
      return e;
    }, null);
  } else {
    insert(nodes, root);
  }
}

function replaceNode(root: Element | null, nodes: any) {
  // prework
  let start: any = null;
  if (Array.isArray(root)) {
    start = root[0];
    for (let i = 1; i !== root.length; i++) {
      remove(root[i]);
    }
  } else {
    start = root;
  }

  if (Array.isArray(nodes)) {
    nodes.reduce((acc, e, i) => {
      if (i === 0) {
        replaceElement(start, e);
      } else {
        insertAfter(e, acc);
      }
      return e;
    }, null);
  } else {
    replaceElement(start, nodes);
  }
}

/**
 * Mounts a reactive "o-if" component based on provided rules and dependencies.
 *
 * This function handles the conditional rendering logic for the "o-if" component,
 * evaluating a rule to determine which portion of the component's answer to mount.
 * If no initial answer is valid, an "else" block or a comment node is appended to
 * the root element.
 *
 * @param root - The parent element where the component is mounted.
 * @param tree - The "o-if" component configuration, containing rule and answer properties.
 */
export function mounterOif(root: Element | null, tree: any) {
  const COMMENT: Comment | any = document.createComment(" o-if ");
  let currentNode: any = null;
  const { rule, answer } = tree;

  const reactiveDep = computed<any>(rule);
  const initAnswer = reactiveDep.value;

  let currentMounter = answer[initAnswer];

  if (!currentMounter && answer.else) {
    currentMounter = answer.else;
  }

  if (!currentMounter) {
    root?.appendChild(COMMENT);
    currentNode = COMMENT;
  }

  if (currentMounter) {
    currentNode = mounterComponent(null, currentMounter);
    insertNode(root, currentNode);
  }

  reactiveDep.$sub.subscribe({
    type: 1,
    f: (n: any) => {
      let component = answer[n];
      let _nodes = null;

      if (!component && answer.else) {
        component = answer.else;
      }

      if (!component) {
        _nodes = COMMENT;
      }

      if (component) {
        _nodes = mounterComponent(null, component);
      }

      replaceNode(currentNode, _nodes);
      currentNode = _nodes;
    },
  });

  return currentNode;
}
