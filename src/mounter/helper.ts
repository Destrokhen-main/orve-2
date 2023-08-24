import { parseSingleChildren } from "../parser/children";
import { NodeChild, NodeHtml, TypeNode } from "../parser/type";
import { Ref, RefA, RefFormater } from "../reactive/ref";
import { pairwise } from "rxjs";
import { InsertType, singelMounterChildren } from "./children";
import { Dir, EtypeRefRequest } from "../reactive/refHelper";
import {
  EtypeComment,
  SettingNode,
  refaSubscribe,
  RefAInsert,
  RefAEdit,
  RefADelete,
  RefAInsertByIndex,
} from "./helperType";
import { ReactiveType } from "../reactive/type";
import { NodeOP, parserNodeF } from "../parser/parser";

// TODO
// [ ] - раскидать код отсюда на разные файлы.

const compareObjects = (a: any, b: any) => {
  if (a === b) return true;

  if (typeof a != "object" || typeof b != "object" || a == null || b == null)
    return false;

  const keysA = Object.keys(a),
    keysB = Object.keys(b);

  if (keysA.length != keysB.length) {
    return false;
  }

  for (const key of keysA) {
    if (!keysB.includes(key)) {
      return false;
    }

    if (typeof a[key] === "function" || typeof b[key] === "function") {
      if (a[key].toString() != b[key].toString()) {
        return false;
      }
    } else {
      if (!compareObjects(a[key], b[key])) {
        return false;
      }
    }
  }

  return true;
};

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
  sub.pipe(pairwise()).subscribe({
    next([before, after]: [string | number, string | number]) {
      if (after !== undefined && before !== after) {
        textNode.textContent = String(after);
      }
    },
  } as any);

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
    },
  });

  if (root !== null) {
    root.appendChild(textNode);
  }
}

// function fragmentWorker(mountedNode: any[]): any[] {
//   const newMounted: any = [];

//   while(mountedNode.length > 0) {
//     const item = mountedNode.shift();

//     if (Array.isArray(item)) {
//       mountedNode.unshift(...item);
//     } else {
//       newMounted.push(item);
//     }
//   }

//   return newMounted;
// }

function createCommentAndInsert(
  root: Element,
  text: string,
  type: EtypeComment = EtypeComment.append,
) {
  const comment = document.createComment(` refA - ${text} `);

  switch (type) {
    case EtypeComment.append:
      root?.appendChild(comment);
      break;
    case EtypeComment.replace:
      root.replaceWith(comment);
      break;
  }

  return comment;
}

/* TODO 
[] - fragment - там больно, надо доработать
[ ] - По условию может приходить null и надо не отрисовывать ничего - [ ]
[ ] - При огромном количестве перерисовок ( использовал 1000000 ) - начинает жестко тротлить
      Надо подумать, может получиться сделать так, чтоб алгос понимал что его дрочат и не проверял пока его дрочат 
      наверно поможет debounce ток хз как его сюда пока вставить
*/
function RefArray(
  root: Element | null,
  item: RefA,
  parent: any = null,
  callback: ((a: any, b: number) => any) | null = null,
) {
  let allInstruction: Comment | SettingNode[] | null = null;

  // Есть что отрисовывать
  if (item.value.length > 0) {
    const prepaireNodes: any[] =
      callback !== null ? item.value.map(callback) : item.value;

    const parserInstance = parseSingleChildren.call(null, null);
    const mounterInsance = singelMounterChildren(null);

    let startNode = root;

    allInstruction = prepaireNodes.map(
      (e: Record<string, any>, index: number): SettingNode => {
        const m = {
          prepaire: e,
          mount: mounterInsance(parserInstance(e) as InsertType),
        };

        const insertNode = m.mount.node;

        if (startNode !== null) {
          startNode[index === 0 ? "appendChild" : "after"](insertNode);
          startNode = insertNode;
        }
        return m;
      },
    );

    if (allInstruction === null) return;
  } else if (item.value.length === 0) {
    const comment = document.createComment(` - refA - ${parent.keyNode} - `);

    if (root !== null) {
      root.appendChild(comment);
      allInstruction = comment;
    }
  }

  item.$sub.subscribe((next: refaSubscribe) => {
    if (Array.isArray(next)) return;

    // NOTE
    // Если было уже что-то отрисовано - [x]
    // Если до этого не было ничего отрисовано - [x]
    if (next.type === EtypeRefRequest.insert) {
      const workObject = next as RefAInsert;
      // индекс которые будет отправлен в индекс.
      let startIndex = 0;
      // Если на экране сейчас есть какие-то инструкции.
      if (Array.isArray(allInstruction)) {
        startIndex = workObject.dir === Dir.right ? allInstruction.length : 0;

        const prepaire =
          callback !== null
            ? workObject.value.map((item: any, i: number) =>
                callback(item, startIndex + i),
              )
            : workObject.value;

        const parserInstance = parseSingleChildren.call(null, null);
        const mounterInsance = singelMounterChildren(null);

        const instractionPrepaire: SettingNode[] = prepaire.map(
          (item: Record<string, any>): SettingNode => {
            return {
              prepaire: item,
              mount: mounterInsance(parserInstance(item) as InsertType),
            };
          },
        );

        // добавим все ноды которые получили сначала в DOM потом в массив всех инструкций.
        // Получим для начала ноду с которой изначально будем работать

        const startInstraction =
          workObject.dir === Dir.right
            ? allInstruction[allInstruction.length - 1]
            : allInstruction[0];

        if (startInstraction.mount !== null) {
          let startNode = startInstraction.mount.node;
          instractionPrepaire.forEach((newNode: SettingNode) => {
            if (newNode.mount !== null) {
              startNode[workObject.dir === Dir.right ? "after" : "before"](
                newNode.mount.node,
              );
              startNode = newNode.mount.node;
            }
          });
        }

        // Заполнили DOM новыми нодами, теперь нужно проверить остальные ноды, на изменения.
        // Я буду проверять ноды по порядку, если пойму что нода отличается тогда поменяю местами новую ноду со старой

        // На этот момент item.value ещё не заполнился данными а значит я смогу просто определить, есть что-то или нет.
        // смотрю на элементы и проверяю схожи ли они с предыдущими элементами.

        // Если элементы были добавлены в начало, значит, надо индексы поменять в остальных элементах.
        const admixture =
          workObject.dir === Dir.left ? workObject.value.length : 0;

        const rebuildAllNode =
          callback !== null
            ? item.value.map((e: any, i: number) => callback(e, admixture + i))
            : item.value;

        rebuildAllNode.forEach((item: Record<string, any>, index: number) => {
          if (
            !compareObjects(
              item,
              (allInstruction as SettingNode[])[index].prepaire,
            )
          ) {
            const newItem = {
              prepaire: item,
              mount: mounterInsance(parserInstance(item) as InsertType),
            };

            if (allInstruction !== null && Array.isArray(allInstruction)) {
              allInstruction[index].mount!.node.replaceWith(newItem.mount.node);
              allInstruction[index] = newItem;
            }
          }
        });

        // Необходимо после перерисовок, дополнить массив новыми данными.
        allInstruction[workObject.dir === Dir.right ? "push" : "unshift"](
          ...instractionPrepaire,
        );
      } else if (allInstruction !== null) {
        // Значит до этого ничего не было отображено.
        const prepaire =
          callback !== null ? workObject.value.map(callback) : workObject.value;

        const parserInstance = parseSingleChildren.call(null, null);
        const mounterInsance = singelMounterChildren(null);

        let startNode = allInstruction;

        allInstruction = prepaire.map((item: any, index: number) => {
          const m = {
            prepaire: item,
            mount: mounterInsance(parserInstance(item) as InsertType),
          };

          startNode[index === 0 ? "replaceWith" : "after"](m.mount.node);
          startNode = m.mount.node;
          return m;
        });
      }
    }

    // NOTE
    // *Хз мб придётся обнолять весь список, при изменение.
    if (next.type === EtypeRefRequest.edit) {
      if (allInstruction !== null && Array.isArray(allInstruction)) {
        const workObject = next as RefAEdit;

        const key = parseInt(String(workObject.key), 10);

        const beforeInstriction = allInstruction[key];

        // подготовим будущую Node чтобы с ней работать.
        const prepaire =
          callback !== null
            ? callback(workObject.value, key)
            : workObject.value;

        if (!compareObjects(prepaire, beforeInstriction.prepaire)) {
          const parserInstance = parseSingleChildren.call(null, null);
          const mounterInsance = singelMounterChildren(null);

          const m = {
            prepaire: prepaire,
            mount: mounterInsance(parserInstance(prepaire) as InsertType),
          };

          allInstruction[key].mount!.node.replaceWith(m.mount.node);
          allInstruction[key] = m;
        }

        /* NOTE
          Если честно хз, нужно ли делать так, чтобы даже при таком раскладе проверять все остальные ноды.
          Тип вдруг какой-то чел решит взять и поставить зависимость от одного элемента в другом.
          Это пиздец, но такое может быть.
        */
      }
    }

    if (next.type === EtypeRefRequest.delete) {
      const workObject = next as RefADelete;

      if (workObject.needCheck === undefined) {
        workObject.needCheck = true;
      }

      // Это значит тут или shift или pop был.
      if (workObject.dir !== undefined) {
        // в таком случаи мы должны удалить первый или последйни элемент.
        if (allInstruction !== null && Array.isArray(allInstruction)) {
          // Если список инструкций на момент работы больше чем 1 элемент, значит
          // нам не надо менять инструмент на комент.
          const countArrayBefore = allInstruction.length;
          const item =
            allInstruction[workObject.dir === Dir.right ? "pop" : "shift"]();
          if (countArrayBefore > 1) {
            item?.mount?.node.remove();
          } else {
            const comment = createCommentAndInsert(
              item?.mount?.node,
              parent.keyNode,
              EtypeComment.replace,
            );
            allInstruction = comment;
          }
        }
      }

      // Если нет dir, значит там есть start и count
      if (workObject.start !== undefined && workObject.count !== undefined) {
        // если мы сюда попали, значит в count точно нет 0.
        if (
          Array.isArray(allInstruction) &&
          (workObject.start > allInstruction?.length ||
            workObject.count > allInstruction?.length)
        ) {
          return;
        }

        let removeAll = false;

        if (
          workObject.start === 0 &&
          Array.isArray(allInstruction) &&
          workObject.count >= allInstruction.length
        ) {
          removeAll = true;
        }

        if (!removeAll) {
          // Тут удаляют не всё.
          // для начала удалю все node
          if (Array.isArray(allInstruction)) {
            for (
              let i = workObject.start;
              i !== workObject.start + workObject.count;
              i++
            ) {
              allInstruction[i].mount?.node.remove();
            }
            // Теперь почистим сам массив
            allInstruction.splice(workObject.start, workObject.count);
          }
        } else {
          // тут значит, что выписали слишком много элементов, и надо удалить все и оставить комент.
          // удалим все элементы.
          if (Array.isArray(allInstruction)) {
            const replacedIntruction = allInstruction.shift();

            allInstruction.forEach((item) => {
              item.mount?.node.remove();
            });

            const comment = createCommentAndInsert(
              replacedIntruction?.mount!.node,
              parent.keyNode,
              EtypeComment.replace,
            );
            allInstruction = comment;
          }
        }
      }

      // Теперь нужно проверить есть ли что-то для перерисовок.
      // Если там комент или null то смысла в этом нет)
      if (workObject.needCheck && Array.isArray(allInstruction)) {
        const prepaire =
          callback !== null ? item.value.map(callback) : item.value;

        const parserInstance = parseSingleChildren.call(null, null);
        const mounterInsance = singelMounterChildren(null);

        prepaire.forEach((e: Record<string, any>, index: number) => {
          if (
            !compareObjects(
              e,
              (allInstruction as SettingNode[])[index].prepaire,
            )
          ) {
            const newItem = {
              prepaire: e,
              mount: mounterInsance(parserInstance(e) as InsertType),
            };

            if (allInstruction !== null && Array.isArray(allInstruction)) {
              allInstruction[index].mount!.node.replaceWith(newItem.mount.node);
              allInstruction[index] = newItem;
            }
          }
        });
      }
    }

    // TODO нужна проверка на то, если там комент, или если там ввел кто-то
    // что-то тип [1,2,3] а user вводит start 0, 123 или 12312, 1231
    if (next.type === EtypeRefRequest.insertByIndex) {
      const workObject = next as RefAInsertByIndex;

      // Тут если элементы есть, значит ищем элемент
      // и дополняем его нодами новыми.
      if (Array.isArray(allInstruction)) {
        const prepaire =
          callback !== null
            ? workObject.value.map((e, i) => callback(e, workObject.start + i))
            : workObject.value;

        const parserInstance = parseSingleChildren.call(null, null);
        const mounterInsance = singelMounterChildren(null);

        let startInstruction = allInstruction[workObject.start];
        let isThisLastItem = false;

        // Если инструкция возвращается undefined, значит будем работать с последним элементом
        if (startInstruction === undefined) {
          startInstruction = allInstruction[allInstruction.length - 1];
          isThisLastItem = true;
        }

        let startNode = startInstruction.mount!.node;
        const newInstruction = prepaire.map((e, index) => {
          const m = {
            prepaire: e,
            mount: mounterInsance(parserInstance(e) as InsertType),
          };

          if (index === 0 && isThisLastItem) {
            startNode.after(m.mount.node);
          } else {
            startNode[index === 0 ? "before" : "after"](m.mount.node);
          }
          startNode = m.mount.node;

          return m;
        });

        allInstruction.splice(workObject.start, 0, ...newInstruction);

        if (Array.isArray(allInstruction)) {
          const prepaire =
            callback !== null ? item.value.map(callback) : item.value;

          const parserInstance = parseSingleChildren.call(null, null);
          const mounterInsance = singelMounterChildren(null);

          prepaire.forEach((e: Record<string, any>, index: number) => {
            if (
              !compareObjects(
                e,
                (allInstruction as SettingNode[])[index].prepaire,
              )
            ) {
              const newItem = {
                prepaire: e,
                mount: mounterInsance(parserInstance(e) as InsertType),
              };

              if (allInstruction !== null && Array.isArray(allInstruction)) {
                allInstruction[index].mount!.node.replaceWith(
                  newItem.mount.node,
                );
                allInstruction[index] = newItem;
              }
            }
          });
        }
      }
    }
  });
}

function RefOWorker(root: Element | null, item: Record<string, any>) {
  console.log(root, item);
}

// TODO
// [ ] - o-fragment attribute
// [x] - o-if in o-if
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
      e.$sub.subscribe(() => {
        const currentRules = item.rules();
        if (lastAnswer !== currentRules) {
          if (item.answer[currentRules] !== undefined) {
            const node = mounterInsance(item.answer[currentRules]);
            if (node.type === TypeNode.Reactive) {
              if (node.value.type === ReactiveType.Oif) {
                const htmlNode: any = OifWorker(root, node.value, true);
                workedNode?.replaceWith(htmlNode);
                workedNode = htmlNode;
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

/* TODO
{RefC} - вставка в код

[ ] - Дать возможность передавать () => import("...") и обычные компоненты <Component />
[ ] - Комент если value undefined
[ ] - Компоненты могут быть fragment
*/
function RefCWorker(root: Element | null, item: Record<string, any>) {
  const component = parserNodeF.call(null, item.value);
  const mounterInsance = singelMounterChildren(null);

  let mountedNode: NodeOP | null = null;

  if (component === null) {
    return;
  }

  const mount = mounterInsance(component);

  if (mount.node !== undefined) {
    mountedNode = mount;
    root?.appendChild(mount.node);
  }

  item.$sub.subscribe(async (next: any) => {
    console.log(next);
  });
}

/* TODO
Эта конструкция даёт возможность сделать вот такую штуку
<RefC ....>
  ....
</RefC>

[ ] - Дать возможность передавать () => import("...") и обычные компоненты <Component />
[ ] - Комент если value undefined
[ ] - Компоненты могут быть fragment
*/
function RefCComponentWorker(root: Element | null, item: Record<string, any>) {
  const component = parserNodeF.call(null, item.proxy.value, item.props);
  const mounterInsance = singelMounterChildren(null);

  let mountedNode: NodeOP | null = null;

  if (component === null) {
    return;
  }

  const mount = mounterInsance(component);
  if (mount.node !== undefined) {
    mountedNode = mount;
    root?.appendChild(mount.node);
  }

  item.proxy.$sub.subscribe((next: any) => {
    console.log(next);
  });
}

export {
  textNodeCreator,
  htmlNodeCreate,
  RefChildCreator,
  RefFormateChildCreator,
  RefArray,
  RefOWorker,
  OifWorker,
  RefCWorker,
  RefCComponentWorker,
};
