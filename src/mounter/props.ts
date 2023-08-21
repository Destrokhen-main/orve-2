import { fromEvent, startWith, pairwise } from "rxjs";
import { Props } from "../jsx";
import { PropsItem, SPECIFIC_KEYS, objectToCss } from "../parser/props";
import { TypeProps } from "../parser/type";
import { changerAttributes } from "./propHelper";

/**
 * Функция для работы с реактивными props
 * @param item - ref object
 * @param key - аттрибут
 * @param val - значение которое необходимо прокинуть в реактивный обхект
 * @returns Реззультат выполнения
 */
function prepaireStaticRectF(item: any, key: string, val: any = null) {
  let value = null;

  try {
    value = item.value(val === null ? item.parent.value : val);
  } catch (err) {
    console.error(` "${key}" - ${err}`);
  }

  return value;
}

/**
 * Функция для работы со стрилямо
 * @param insertValue - значение
 * @returns строка стилей
 */
function prepaireClass(insertValue: any) {
  let insertV: string = insertValue;
  if (typeof insertValue === "object") {
    insertV = objectToCss(insertValue);
  }

  return insertV;
}

/**
 * Функция, которая устанавливает атрибуты внутрь HTMLElement
 * @param root - HTMLElement в который будет указаны атрибуты
 * @param item - Объект props
 */
function propsWorker(root: HTMLElement, item: Props) {
  Object.keys(item).forEach((key: string) => {
    const obj: PropsItem = item[key];

    if (obj.type === TypeProps.Static) {
      changerAttributes(root, key, obj.value);
    }

    if (obj.type === TypeProps.Event) {
      fromEvent(root, key).subscribe(obj.value);
    }

    if (obj.type === TypeProps.EventReactive) {
      let event = fromEvent(root, key).subscribe(obj.value.value);

      obj.value.$sub
        .pipe(startWith(obj.value.value), pairwise())
        .subscribe(([before, after]: [() => any, () => any]) => {
          if (String(before || "") !== String(after || "")) {
            event.unsubscribe();
            event = fromEvent(root, key).subscribe(after);
          }
        });
    }
    if (obj.type === TypeProps.EventReactiveF) {
      const item = obj.value;
      const value = prepaireStaticRectF(item, key);

      if (value !== null && typeof value === "function") {
        let event = fromEvent(root, key).subscribe(value);

        item.parent.$sub
          .pipe(startWith(value), pairwise())
          .subscribe(([before, after]: [any, any]) => {
            const newKey = prepaireStaticRectF(item, key, after);

            if (newKey !== null && before !== newKey) {
              event.unsubscribe();
              event = fromEvent(root, key).subscribe(newKey);
            }
          });
      } else {
        if (typeof value !== "function") {
          console.error("value return not a function");
        }
      }
    }

    if (obj.type === TypeProps.StaticReactive) {
      changerAttributes(root, key, obj.value.value);

      obj.value.$sub
        .pipe(startWith(obj.value.value), pairwise())
        .subscribe(([before, after]: [string | number, string | number]) => {
          if (before !== after) {
            changerAttributes(root, key, after);
          }
        });
    }

    if (obj.type === TypeProps.StaticReactiveF) {
      const item = obj.value;
      const value = prepaireStaticRectF(item, key);

      if (value !== null && value !== "") {
        const insertValue = value;

        if (SPECIFIC_KEYS.includes(key)) {
          if (key === "style") {
            let insertV: string = String(insertValue);
            if (typeof insertValue === "object") {
              insertV = objectToCss(insertValue);
            }

            root.setAttribute(key, insertV);

            item.parent.$sub
              .pipe(startWith(insertV), pairwise())
              .subscribe(([before, after]: [any, any]) => {
                const newKey = prepaireStaticRectF(item, key, after);
                const st = prepaireClass(newKey);

                if (st !== null && before !== st) {
                  root.setAttribute(key, st);
                }
              });
          }
        } else {
          root.setAttribute(key, insertValue);

          item.parent.$sub
            .pipe(startWith(insertValue), pairwise())
            .subscribe(([before, after]: [any, any]) => {
              const newKey = prepaireStaticRectF(item, key, after);

              if (newKey !== null && before !== newKey) {
                root.setAttribute(key, String(newKey));
              }
            });
        }
      }
    }
  });
}

export { propsWorker };
