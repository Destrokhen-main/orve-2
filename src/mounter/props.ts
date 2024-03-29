import { Props } from "../jsx-type";
import { PropsItem, objectToCss } from "../parser/props";
import { TypeProps } from "../parser/type";
import { changerAttributes } from "./propHelper";
import { ReactiveType } from "../reactive/type";
import { unique } from "../utils/line/uniquaTransform";

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

const classWorker = (key: string, value: unknown) => {
  if (["class"].includes(key)) {
    return Array.isArray(value) ? value.join(" ") : value;
  } else {
    return value;
  }
};

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
        changerAttributes(root, key, classWorker(key, value.value));

        value.$sub.subscribe(
          unique((next: any) => {
            changerAttributes(root, key, classWorker(key, next));
          }, value.value),
        );
      } else {
        changerAttributes(root, key, classWorker(key, value));
      }
    }

    if (obj.type === TypeProps.Event) {
      const val = obj.value;

      if (typeof val === "object" && val.type === ReactiveType.Ref) {
        const _v = val.value;

        root.addEventListener(key, _v);

        let pref = _v;

        val.$sub.subscribe(
          unique((next: any) => {
            root.removeEventListener(key, pref);
            root.addEventListener(key, next);
            pref = next;
          }, _v),
        );
      } else {
        root.addEventListener(key, obj.value);
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
        const _v = Array.isArray(value) ? value.join(" ") : value;
        changerAttributes(root, key, _v);
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
          const _v = Array.isArray(after) ? after.join(" ") : after;
          changerAttributes(root, key, _v);
        }
      });
    }

    // TODO сейчас только для статики работает, нужно логику и для style и для остального
    if (obj.type === TypeProps.ReactiveComputed) {
      const item = obj.value;
      if (item.value !== null && item.value !== "") {
        root.setAttribute(key, item.value);

        item.$sub.subscribe(
          unique(() => {
            root.setAttribute(key, item.value);
          }, item.value),
        );
      }
    }
  });
}

export { propsWorker, prepaireClass };
