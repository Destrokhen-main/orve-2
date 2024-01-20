import { distinctUntilChanged, fromEvent, pairwise } from "rxjs";
import { Props } from "../jsx-type";
import { PropsItem, SPECIFIC_KEYS, objectToCss } from "../parser/props";
import { TypeProps } from "../parser/type";
import { changerAttributes } from "./propHelper";
import { ReactiveType } from "../reactive/type";

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
    const obj: PropsItem = item[key] as any;

    if (obj.type === TypeProps.Static) {
      changerAttributes(root, key, obj.value);
    }

    if (obj.type === TypeProps.Event) {
      fromEvent(root, key).subscribe(obj.value);
    }

    if (obj.type === TypeProps.EventReactive) {
      let event = fromEvent(root, key).subscribe(obj.value.value);

      obj.value.$sub
        .pipe(pairwise())
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
          .pipe(pairwise())
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
      const reactiveItem = obj.value;

      let value = reactiveItem.value;
      if (reactiveItem.type === ReactiveType.RefO) {
        const i = reactiveItem as any;
        value = i.parent[i.key];
      }
      if (typeof value === "object" && key === "style") {
        const cssInline = objectToCss(value);
        changerAttributes(root, key, cssInline);
      } else {
        changerAttributes(root, key, value);
      }

      obj.value.$sub
        .pipe(pairwise())
        .subscribe(([before, _after]: [string | number, string | number]) => {
          let after = _after;
          if (reactiveItem.type === ReactiveType.RefO) {
            const i = reactiveItem as any;
            after = i.parent[i.key];
          }

          if (before !== after) {
            if (typeof after === "object" && key === "style") {
              const cssInline = objectToCss(after);
              changerAttributes(root, key, cssInline);
            } else {
              changerAttributes(root, key, after);
            }
          }
        });
    }

    // TODO сейчас только для статики работает, нужно логику и для style и для остального
    if (obj.type === TypeProps.ReactiveComputed) {
      const item = obj.value;
      if (item.value !== null && item.value !== "") {
        root.setAttribute(key, item.value);

        item.$sub
          .pipe(
            distinctUntilChanged((prevHigh: any, temp: any) => {
              return temp === prevHigh;
            }),
          )
          .subscribe(() => {
            root.setAttribute(key, item.value);
          });
      }
    }
  });
}

export { propsWorker };
