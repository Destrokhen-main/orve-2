import { mounterComponent } from "..";
// import { parseSingleChildren } from "../../parser/children";
import { parserNodeF } from "../../parser/parser";
// import { ReactiveType } from "../../reactive/type";
import { returnType } from "../../utils";
import { DiffType, DifferentItems } from "../../utils/DiffArray";
// import { singleMounterChildren } from "../children_old";
import { createComment, insert, remove, replaceElement } from "../dom";

// function callerWorker(
//   value: any[],
//   callback: ((a: any, b: number) => any) | null,
//   object: any,
// ) {
//   if (object !== null) {
//     return value.map((key: any) => callback?.apply(this, [object![key], key]));
//   } else {
//     return value.map((...args: any) => callback?.apply(this, args));
//   }
// }

/* TODO 
[] - fragment - там больно, надо доработать
[X] - По условию может приходить null и надо не отрисовывать ничего - [ ]
[ ] - При огромном количестве перерисовок ( использовал 1000000 ) - начинает жестко тротлить
      Надо подумать, может получиться сделать так, чтоб алгос понимал что его дрочат и не проверял пока его дрочат 
      наверно поможет debounce ток хз как его сюда пока вставить
[  ] - ref внутри ref неправильно ловит обновления
[ ] - хочу взять и сделать так, чтобы можно было вставить цифру условно и от неё массив делать
*/
// function RefArray(
//   root: Element | Comment | null,
//   item: any,
//   parent: any = null,
//   callback: ((a: any, b: number) => any) | null = null,
// ) {
//   let allInstruction: any = [];
//   let arrayBefore: any[] = [];
//   const mainComment = document.createComment("ref-a");
//   const parserInstance = parseSingleChildren.call(this, parent);
//   const mounterInsance = singleMounterChildren(null);
//   let value = item.value;
//   if (item.type === ReactiveType.RefO) {
//     const i = item as any;
//     const val = i.parent[i.key];
//     if (
//       typeof val === "object" &&
//       !Array.isArray(val) &&
//       val.type === ReactiveType.Ref
//     ) {
//       value = val.value;
//     } else {
//       value = val;
//     }
//   }
//   if (typeof value === "number" && value > 0) {
//     value = new Array(value).fill(0).map((_, i) => i + 1);
//   }

//   let object: Record<string, unknown> | null = null;
//   if (returnType(value) === "object") {
//     object = value;
//     value = Object.keys(value);
//   }
//   // first render
//   /*
//     array
//     object
//     number

//     Если нужно просто отрисовать что-то, и не париться с реактивностью
//   */
//   if (value === undefined) {
//     const type = returnType(item);

//     if (type === "object") {
//       object = item;
//       value = Object.keys(item);
//     }

//     if (type === "array") {
//       value = item;
//     }

//     if (typeof item === "number") {
//       value = new Array(item).fill(0).map((_, i) => i + 1);
//     }
//   }

//   if (Array.isArray(value) && value.length > 0) {
//     const parsedStartArray = callerWorker(value, callback, object);

//     arrayBefore = parsedStartArray;

//     allInstruction = parsedStartArray.map((item: any) => {
//       const mounted = mounterInsance(parserInstance(item) as any);
//       return mounted.node;
//     });

//     let n = root;
//     allInstruction.forEach((item: any, index: number) => {
//       if (index === 0) {
//         n?.appendChild(item);
//       } else {
//         n?.after(item);
//       }
//       n = item;
//     });
//   } else {
//     root?.appendChild(mainComment);
//   }

//   if (item.$sub !== undefined) {
//     const func = (_value: any) => {
//       let value = _value;
//       if (item.type === ReactiveType.RefO) {
//         const i = item as any;
//         const val = i.parent[i.key];
//         if (
//           typeof val === "object" &&
//           !Array.isArray(val) &&
//           val.type === ReactiveType.Ref
//         ) {
//           value = val.value;
//         } else {
//           value = val;
//         }
//       }

//       if (typeof value === "number" && value > 0) {
//         value = new Array(value).fill(0).map((_, i) => i + 1);
//       }

//       let object = null;
//       if (returnType(value) === "object") {
//         object = value;
//         value = Object.keys(value);
//       }

//       if (!Array.isArray(value)) {
//         if (allInstruction.length > 0) {
//           while (allInstruction.length > 0) {
//             const i = allInstruction.shift();
//             if (allInstruction.length === 1 || allInstruction.length === 0) {
//               i.replaceWith(mainComment);
//             } else {
//               i.remove();
//             }
//           }
//         }
//         arrayBefore = [];
//         return;
//       }

//       const pars = callerWorker(value, callback, object);

//       const arr = DifferentItems(arrayBefore, pars);
//       if (arr.length > 0) {
//         arr.forEach((item: any) => {
//           if (item.type === DiffType.New) {
//             const block = pars[item.index];
//             const mounted = mounterInsance(parserInstance(block) as any);

//             if (item.index !== 0) {
//               allInstruction[item.index - 1].after(mounted.node);
//             }

//             if (allInstruction.length === 0) {
//               mainComment.replaceWith(mounted.node);
//             }
//             allInstruction.push(mounted.node);
//           }
//           if (item.type === DiffType.Modify) {
//             const block = pars[item.index];
//             const mounted = mounterInsance(parserInstance(block) as any);
//             allInstruction[item.index].replaceWith(mounted.node);
//             allInstruction[item.index] = mounted.node;
//           }
//           if (item.type === DiffType.Delete) {
//             if (
//               allInstruction.filter((item: any) => item !== null).length === 1
//             ) {
//               allInstruction[item.index].replaceWith(mainComment);
//               allInstruction[item.index] = null;
//             } else {
//               allInstruction[item.index].remove();
//               allInstruction[item.index] = null;
//             }
//           }
//         });
//       }

//       arrayBefore = pars;
//       allInstruction = allInstruction.filter((item: any) => item !== null);
//     };
//     item.$sub.subscribe({
//       type: 1,
//       f: func,
//     });
//   }
// }

/**
 * Преобразует массив или объект в новый массив с помощью предоставленной функции обратного вызова.
 * @param item The array or object to map
 * @param callback The function to apply to each element of the array or value of the object
 * @returns {T[]} A new array with the mapped elements
 */
function callbackHelper<T>(
  item: Array<T> | Record<string, T>,
  callback: (value: T, key: string | number) => T,
): T[] {
  if (Array.isArray(item)) {
    return item.map(callback);
  } else {
    if (returnType(item) === "number") {
      const end = item as unknown as number;
      const ar = [];
      for (let i = 0; i !== end; i++) {
        ar.push(callback(i as any, i));
      }
      return ar;
    }

    const keys = Object.keys(item) as Array<string | number>;
    return keys.map((e) => {
      return callback(item[e], e);
    });
  }
}

function insertArray(ar: Element[][], root: Element | null) {
  ar.forEach((e: Array<Element>) => {
    e.forEach((i) => {
      insert(i, root);
    });
  });
}

function returnMounterNode(e: any) {
  const item = mounterComponent(null, parserNodeF(e) as any);
  return Array.isArray(item) ? item : [item];
}

function replaceArray(ar: any, el: any, root: any, isComment: boolean = false) {
  if (isComment) {
    ar.reduceRight((prev: any, curr: any) => {
      if (prev === undefined) {
        replaceElement(el, curr);
      } else {
        insert(curr, root, prev);
      }
      return curr;
    }, undefined);
  }
}

function getLastItemInArray(ar: any) {
  const last = ar[ar.length - 1];
  if (Array.isArray(last)) {
    return last[last.length - 1];
  }
  return last;
}

/*
[X] - заменя на коммент и обратно
[ ] - был массив станет объект и обратно
[ ] - удалился реактивный элемент и не нужно теперь слушать
[ ] - Может быть ещё for в for
*/
function mountedFor(root: Element | null, item: any) {
  const each = item.each;
  const callback = item.callback;

  const COMMENT = createComment("For");
  let isExistNode: boolean = false; // отвечает за то, коммент это сейчас на экране или нет

  let eachArray: any;
  let isReactive = false;

  let beforeArray: any = [];

  if (returnType(each) === "ref") {
    eachArray = each.value;
    isReactive = true;
  } else {
    eachArray = each;
  }

  const arrayEntry = callbackHelper(eachArray, callback);

  beforeArray = arrayEntry;

  const renderArray = arrayEntry.map((e) => returnMounterNode(e));
  if (renderArray.length > 0) {
    insertArray(renderArray as any, root);
    isExistNode = true;
  } else {
    insert(COMMENT, root);
    isExistNode = false;
  }

  if (isReactive) {
    each.$sub.subscribe({
      type: 1,
      f: (value: any) => {
        const newEachArray = callbackHelper(value, callback);
        const diffArray = DifferentItems(beforeArray, newEachArray);
        if (diffArray.length > 0) {
          diffArray.forEach((e: any) => {
            if ([DiffType.New, DiffType.Modify].includes(e.type)) {
              const newItem = newEachArray[e.index];
              const item = returnMounterNode(newItem);

              if (e.type === DiffType.New) {
                if (!isExistNode) {
                  isExistNode = true;
                  replaceArray(item, COMMENT, root, true);
                } else {
                  const last = getLastItemInArray(renderArray);
                  [...item].reverse().forEach((e: any) => {
                    insert(e, root, last.nextSibling);
                  });
                }
                renderArray.push(item);
              }
              if (e.type === DiffType.Modify) {
                const array = [...renderArray[e.index]];
                const el = array.shift();

                array.forEach((e) => {
                  remove(e);
                });

                item.reduceRight((acc, e) => {
                  if (acc === null) {
                    replaceElement(el, e);
                  } else {
                    insert(e, root, acc);
                  }
                  return e;
                }, null);
                renderArray[e.index] = item;
              }
            }
            if (e.type === DiffType.Delete) {
              if (renderArray.length === 1) {
                isExistNode = false;
                const ar = renderArray[e.index];

                ar.forEach((e, i) => {
                  if (i === 0) {
                    replaceElement(e, COMMENT);
                  } else {
                    remove(e);
                  }
                });
              } else {
                const ar = renderArray[e.index];
                ar.forEach((e) => remove(e));
              }
              renderArray.splice(e.index, 1);
            }
          });
        }
        beforeArray = newEachArray;
      },
    });
  }
}

export { mountedFor };
