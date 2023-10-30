import { KEY_NEED_REWRITE_WITH_O } from "../keys";
import { Props } from "../jsx";
import { SLOT } from "../keys";
import { ReactiveType } from "../reactive/type";
import { camelToSnakeCase } from "../utils/transformFunctions";
import { TypeProps } from "./type";

export interface PropsItem {
  type: TypeProps;
  value: any;
}

/**
 * Функция помогающая работать с событиями
 * @param obj - props
 * @param key - ключ
 * @returns обновлённый объект props
 */
function workWithEvent(obj: any, key: string) {
  const func = obj[key];
  const pKey = key.replace("on", "").toLowerCase().trim();

  delete obj[key];
  if (
    typeof func === "object" &&
    func.type !== undefined &&
    (func.type === TypeProps.EventReactiveF ||
      func.type === TypeProps.EventReactive)
  ) {
    obj[pKey] = {
      type:
        func.type === ReactiveType.RefFormater
          ? TypeProps.EventReactiveF
          : TypeProps.EventReactive,
      value: func,
    };
    return obj;
  }

  obj[pKey] = {
    type: TypeProps.Event,
    value: func.bind(this),
  };

  return obj;
}

/**
 * Функция для преобразования обхектов с css строки.
 * @param obj - Объект стилей.
 * @returns - строку
 */
export function objectToCss(obj: Record<string, any>): string {
  let o = "";

  Object.keys(obj).forEach((k) => {
    const nk = camelToSnakeCase(k);
    o += `${nk}:${obj[k]};`;
  });

  return o;
}

/**
 * Существует специальные атрибуты в тегах, с которыми нужно производить специальные операции.
 * @param obj - props
 * @param key - аттрибут
 * @returns объект props и ключ изменений. true - что-то сделали
 */
function specificProps(obj: any, key: string): [Record<string, any>, boolean] {
  const value = obj[key];

  if (key === "style") {
    if (typeof value === "object" && value.type === undefined) {
      obj[key] = {
        type: TypeProps.Static,
        value: objectToCss(value),
      };

      return [obj, true];
    } else if (typeof value === "string") {
      obj[key] = {
        type: TypeProps.Static,
        value: value,
      };
      return [obj, true];
    } else if (
      typeof value === "object" &&
      value.type === ReactiveType.RefFormater
    ) {
      obj[key] = {
        type: TypeProps.StaticReactiveF,
        value: value,
      };
      return [obj, true];
    } else if (
      typeof value === "object"
    ) {
      console.log(value);
    }
  }

  if (key === "src") {
    if (typeof value === "object" && value.default !== undefined) {
      obj[key] = {
        type: TypeProps.Static,
        value: value.default,
      };
    } else if (typeof value === "string") {
      obj[key] = {
        type: TypeProps.Static,
        value: value,
      };
    }
    return [obj, true];
  }

  return [obj, false];
}

export const SPECIFIC_KEYS = ["style"];

/**
 * Работа с props которые не являютя event. Необходимо чтобы правильно работать с реактивными переменными и так далее.
 * @param obj
 * @param key
 * @returns
 */
function workWithStaticProps(obj: any, key: string) {
  const value = obj[key];

  if (KEY_NEED_REWRITE_WITH_O.includes(key)) {
    const fKey = key.slice(1, key.length);
    obj[fKey] = {
      type: TypeProps.Static,
      value: value,
    };
    return [obj, true];
  }

  if (SPECIFIC_KEYS.includes(key)) {
    return specificProps(obj, key);
  }

  if (
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean"
  ) {
    obj[key] = {
      type: TypeProps.Static,
      value: obj[key],
    };

    return [obj, true];
  }

  if (
    typeof value === "object" &&
    value.type !== undefined &&
    value.type === ReactiveType.Ref
  ) {
    obj[key] = {
      type: TypeProps.StaticReactive,
      value: value,
    };

    return [obj, true];
  }

  if (
    typeof value === "object" &&
    value.type !== undefined &&
    value.type === ReactiveType.RefFormater
  ) {
    obj[key] = {
      type: TypeProps.StaticReactiveF,
      value: value,
    };

    return [obj, true];
  }

  if (
    typeof value === "object" &&
    value.type !== undefined &&
    value.type === ReactiveType.RefComputed
  ) {
    obj[key] = {
      type: TypeProps.ReactiveComputed,
      value: value,
    };

    return [obj, true];
  }

  if (typeof value === "object" && key === SLOT) {
    obj[key] = value;
    return [obj, true];
  }

  if (typeof value === "object" || typeof value === "function") {
    obj[key] = {
      type: TypeProps.Static,
      value: value,
    };
    return [obj, true];
  }

  return [obj, false];
}

/**
 * Функция помогающая правильно обработать props
 * @param insertoObj - Объект props
 * @returns обновленный объект props
 */
function propsWorker(insertoObj: Props): Props {
  let obj: any = { ...insertoObj };

  Object.keys(obj).forEach((key: string) => {
    if (key.startsWith("on")) {
      obj = workWithEvent(obj, key);
      return;
    }

    const [object, stat] = workWithStaticProps(obj, key);

    if (stat) {
      obj = object;
      return;
    }
    console.warn(`"${key}" this key is not supported`);
    delete obj[key];
  });
  return obj;
}

export { propsWorker };
