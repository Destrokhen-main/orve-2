import { Props } from "../jsx-type";
import { PropsItem, objectToCss } from "../parser/props";
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
      const value = obj.value;
      // COMPUTED
      if (typeof value === "object" && value.type === ReactiveType.Ref) {
        changerAttributes(root, key, value.value);

        value.$sub.subscribe((next: any) => {
          changerAttributes(root, key, next);
        });
      } else {
        changerAttributes(root, key, value);
      }
    }

    if (obj.type === TypeProps.Event) {
      root.addEventListener(key, obj.value);
    }

    if (obj.type === TypeProps.EventReactive) {
      root.addEventListener(key, obj.value.value);

      obj.value.$sub.subscribe((val: any) => {
        root.addEventListener(key, val);
      });
    }
    if (obj.type === TypeProps.EventReactiveF) {
      const item = obj.value;
      const value = prepaireStaticRectF(item, key);

      if (value !== null && typeof value === "function") {
        document.addEventListener(key, value);

        item.parent.$sub.subscribe((value: any) => {
          const newKey = prepaireStaticRectF(item, key, value);

          if (newKey !== null) {
            document.addEventListener(key, newKey);
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

      obj.value.$sub.subscribe((_after: any) => {
        let after = _after;
        if (reactiveItem.type === ReactiveType.RefO) {
          const i = reactiveItem as any;
          after = i.parent[i.key];
        }

        if (typeof after === "object" && key === "style") {
          const cssInline = objectToCss(after);
          changerAttributes(root, key, cssInline);
        } else {
          changerAttributes(root, key, after);
        }
      });
    }

    // TODO сейчас только для статики работает, нужно логику и для style и для остального
    if (obj.type === TypeProps.ReactiveComputed) {
      const item = obj.value;
      if (item.value !== null && item.value !== "") {
        root.setAttribute(key, item.value);

        item.$sub.subscribe(() => {
          root.setAttribute(key, item.value);
        });
      }
    }
  });
}

export { propsWorker, prepaireClass };
