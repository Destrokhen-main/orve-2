import { parseSingleChildren } from "../../parser/children";
import { ReactiveType } from "../../reactive/type";
import { DiffType, DifferentItems } from "../../utils/DiffArray";
import { singleMounterChildren } from "../children";

/* TODO 
[] - fragment - там больно, надо доработать
[X] - По условию может приходить null и надо не отрисовывать ничего - [ ]
[ ] - При огромном количестве перерисовок ( использовал 1000000 ) - начинает жестко тротлить
      Надо подумать, может получиться сделать так, чтоб алгос понимал что его дрочат и не проверял пока его дрочат 
      наверно поможет debounce ток хз как его сюда пока вставить
[  ] - ref внутри ref неправильно ловит обновления
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
      console.log(i);

      value = val.value;
    } else {
      value = val;
    }
  }
  // first render
  if (Array.isArray(value) && value.length > 0) {
    const parsedStartArray = value.map((...args: any) =>
      callback?.apply(this, args),
    );
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

  // игнорирую первый next
  let f = true;
  item.$sub.subscribe({
    next(_value: any) {
      if (f) {
        f = false;
        return;
      }
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

      if (!Array.isArray(value)) {
        if (allInstruction.length > 0) {
          while (allInstruction.length > 0) {
            const i = allInstruction.shift();
            if (allInstruction.length === 1) {
              i.replaceWith(mainComment);
            } else {
              i.remove();
            }
          }
        }
        arrayBefore = [];
        return;
      }

      const pars = value.map((...args: any) => callback?.apply(this, args));
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
    },
  });
}

export { RefArray };
