import { mounterComponent } from "..";
import { parseSingleChildren } from "../../parser/children";
import { parserNodeF } from "../../parser/parser";
import { returnType } from "../../reactive/ref";
import { ReactiveType } from "../../reactive/type";
import { DiffType, DifferentItems } from "../../utils/DiffArray";
import { singleMounterChildren } from "../children_old";
import { insert, remove, replaceElement } from "../dom";

function callerWorker(
  value: any[],
  callback: ((a: any, b: number) => any) | null,
  object: any,
) {
  if (object !== null) {
    return value.map((key: any) => callback?.apply(this, [object![key], key]));
  } else {
    return value.map((...args: any) => callback?.apply(this, args));
  }
}

/* TODO 
[] - fragment - там больно, надо доработать
[X] - По условию может приходить null и надо не отрисовывать ничего - [ ]
[ ] - При огромном количестве перерисовок ( использовал 1000000 ) - начинает жестко тротлить
      Надо подумать, может получиться сделать так, чтоб алгос понимал что его дрочат и не проверял пока его дрочат 
      наверно поможет debounce ток хз как его сюда пока вставить
[  ] - ref внутри ref неправильно ловит обновления
[ ] - хочу взять и сделать так, чтобы можно было вставить цифру условно и от неё массив делать
*/
function RefArray(
  root: Element | Comment | null,
  item: any,
  parent: any = null,
  callback: ((a: any, b: number) => any) | null = null,
) {
  let allInstruction: any = [];
  let arrayBefore: any[] = [];
  const mainComment = document.createComment("ref-a");
  const parserInstance = parseSingleChildren.call(this, parent);
  const mounterInsance = singleMounterChildren(null);
  let value = item.value;
  if (item.type === ReactiveType.RefO) {
    const i = item as any;
    const val = i.parent[i.key];
    if (
      typeof val === "object" &&
      !Array.isArray(val) &&
      val.type === ReactiveType.Ref
    ) {
      value = val.value;
    } else {
      value = val;
    }
  }
  if (typeof value === "number" && value > 0) {
    value = new Array(value).fill(0).map((_, i) => i + 1);
  }

  let object: Record<string, unknown> | null = null;
  if (returnType(value) === "object") {
    object = value;
    value = Object.keys(value);
  }
  // first render
  /*
    array
    object
    number

    Если нужно просто отрисовать что-то, и не париться с реактивностью
  */
  if (value === undefined) {
    const type = returnType(item);

    if (type === "object") {
      object = item;
      value = Object.keys(item);
    }

    if (type === "array") {
      value = item;
    }

    if (typeof item === "number") {
      value = new Array(item).fill(0).map((_, i) => i + 1);
    }
  }

  if (Array.isArray(value) && value.length > 0) {
    const parsedStartArray = callerWorker(value, callback, object);

    arrayBefore = parsedStartArray;

    allInstruction = parsedStartArray.map((item: any) => {
      const mounted = mounterInsance(parserInstance(item) as any);
      return mounted.node;
    });

    let n = root;
    allInstruction.forEach((item: any, index: number) => {
      if (index === 0) {
        n?.appendChild(item);
      } else {
        n?.after(item);
      }
      n = item;
    });
  } else {
    root?.appendChild(mainComment);
  }

  if (item.$sub !== undefined) {
    const func = (_value: any) => {
      let value = _value;
      if (item.type === ReactiveType.RefO) {
        const i = item as any;
        const val = i.parent[i.key];
        if (
          typeof val === "object" &&
          !Array.isArray(val) &&
          val.type === ReactiveType.Ref
        ) {
          value = val.value;
        } else {
          value = val;
        }
      }

      if (typeof value === "number" && value > 0) {
        value = new Array(value).fill(0).map((_, i) => i + 1);
      }

      let object = null;
      if (returnType(value) === "object") {
        object = value;
        value = Object.keys(value);
      }

      if (!Array.isArray(value)) {
        if (allInstruction.length > 0) {
          while (allInstruction.length > 0) {
            const i = allInstruction.shift();
            if (allInstruction.length === 1 || allInstruction.length === 0) {
              i.replaceWith(mainComment);
            } else {
              i.remove();
            }
          }
        }
        arrayBefore = [];
        return;
      }

      const pars = callerWorker(value, callback, object);

      const arr = DifferentItems(arrayBefore, pars);
      if (arr.length > 0) {
        arr.forEach((item: any) => {
          if (item.type === DiffType.New) {
            const block = pars[item.index];
            const mounted = mounterInsance(parserInstance(block) as any);

            if (item.index !== 0) {
              allInstruction[item.index - 1].after(mounted.node);
            }

            if (allInstruction.length === 0) {
              mainComment.replaceWith(mounted.node);
            }
            allInstruction.push(mounted.node);
          }
          if (item.type === DiffType.Modify) {
            const block = pars[item.index];
            const mounted = mounterInsance(parserInstance(block) as any);
            allInstruction[item.index].replaceWith(mounted.node);
            allInstruction[item.index] = mounted.node;
          }
          if (item.type === DiffType.Delete) {
            if (
              allInstruction.filter((item: any) => item !== null).length === 1
            ) {
              allInstruction[item.index].replaceWith(mainComment);
              allInstruction[item.index] = null;
            } else {
              allInstruction[item.index].remove();
              allInstruction[item.index] = null;
            }
          }
        });
      }

      arrayBefore = pars;
      allInstruction = allInstruction.filter((item: any) => item !== null);
    };
    item.$sub.subscribe(func);
  }
}

function callbackHelper(item: any, callback: any) {
  if (Array.isArray(item)) {
    return item.map(callback);
  } else {
    const keys = Object.keys(item);
    return keys.map((e) => {
      return callback(item[e], e);
    });
  }
}

/*
[ ] - заменя на коммент и обратно
[ ] - был массив станет объект и обратно
[ ] - удалился реактивный элемент и не нужно теперь слушать

*/
function mountedFor(root: Element | null, item: any) {
  const each = item.each;
  const callback = item.callback;

  let eachArray: any;
  let isReactive = false;

  let beforeArray: any = [];

  if (returnType(each) === "object" && each.type === ReactiveType.Ref) {
    eachArray = each.value;
    isReactive = true;
  } else {
    eachArray = each;
  }

  const arrayEntry = callbackHelper(eachArray, callback);

  beforeArray = arrayEntry;

  const renderArray = arrayEntry.map((e) => {
    // хз может тут фрагмент упадёт, и надо посмотреть на него как на список
    const item = mounterComponent(null, parserNodeF(e) as any);
    return item.instance.el;
  });

  renderArray.length > 0 &&
    renderArray.forEach((e) => {
      insert(e, root);
    });

  if (isReactive) {
    each.$sub.subscribe((value: any) => {
      const newEachArray = callbackHelper(value, callback);
      const diffArray = DifferentItems(beforeArray, newEachArray);

      diffArray.length > 0 &&
        diffArray.forEach((e: any) => {
          if ([DiffType.New, DiffType.Modify].includes(e.type)) {
            const newItem = newEachArray[e.index];
            const item = mounterComponent(null, parserNodeF(newItem) as any);
            const element = item.instance.el;

            if (e.type === DiffType.New) {
              insert(
                element,
                root,
                renderArray[renderArray.length - 1].nextSibling,
              );
              renderArray.push(element);
            }
            if (e.type === DiffType.Modify) {
              replaceElement(renderArray[e.index], element);
              renderArray[e.index] = element;
            }
          }
          if (e.type === DiffType.Delete) {
            remove(renderArray[e.index]);
            renderArray.splice(e.index, 1);
          }
        });

      beforeArray = newEachArray;
    });
  }
}

export { RefArray, mountedFor };
