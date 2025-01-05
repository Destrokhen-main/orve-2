// import { KEY_NEED_REWRITE_WITH_O } from "../keys";
import { Props } from "../jsx-type";
// import { SLOT } from "../keys";
import { ReactiveType } from "../reactive/type";
import { camelToSnakeCase } from "../utils/transformFunctions";
import { TypeProps } from "./type";

export interface PropsItem {
  type: TypeProps | ReactiveType;
  value: any;
}

export interface ParsedProps {
  [key: string]: PropsItem;
}

export const SPECIFIC_KEYS = ["style", "src", "class"];

/**
 * Функция помогающая работать с событиями
 * @param obj - props
 * @param key - ключ
 * @returns обновлённый объект props
 */
function workWithEvent(obj: Props, key: string): Props {
  const func = obj[key];
  const pKey = key.replace("on", "").toLowerCase().trim();

  delete obj[key];

  obj[pKey] = {
    type: TypeProps.Event,
    value: func,
  };

  return obj;
}

/**
 * Функция для преобразования обхектов с css строки.
 * @param obj - Объект стилей.
 * @returns - строку
 */
export function objectToCss(obj: Props): string {
  let o = "";

  Object.keys(obj).forEach((k) => {
    const nk = camelToSnakeCase(k);
    o += `${nk}:${obj[k]};`;
  });

  return o;
}

function hasReactive(obj: Record<string, any> | Array<any>): boolean {
  if (Array.isArray(obj)) {
    return obj.some((e: any) => {
      if (typeof e === "object") {
        if (e.type === ReactiveType.Ref) {
          return true;
        } else {
          return hasReactive(e);
        }
      }
      return false;
    });
  }

  const keys = Object.keys(obj);
  return keys.some((key: string) => {
    if (typeof obj[key] === "object" && obj[key].type === ReactiveType.Ref) {
      return true;
    }

    return false;
  });
}

/**
 * Существует специальные атрибуты в тегах, с которыми нужно производить специальные операции.
 * @param obj - props
 * @param key - аттрибут
 * @returns объект props и ключ изменений. true - что-то сделали
 */
function specificProps(obj: Props, key: string): boolean {
  const value = obj[key];

  if (key === "style") {
    if (typeof value === "object" && value.type === undefined) {
      obj[key] = {
        type: hasReactive(value) ? TypeProps.Reactive : TypeProps.Static,
        value: value,
      };

      return true;
    } else if (typeof value === "string") {
      obj[key] = {
        type: TypeProps.Static,
        value: value,
      };
      return true;
    } else if (
      (typeof value === "object" && value.type === ReactiveType.Ref) ||
      value.type === ReactiveType.RefO
    ) {
      obj[key] = {
        type: TypeProps.Reactive,
        value: value,
      };
      return true;
    }
    // else if (typeof value === "object") {
    //   console.log(value);
    // }
  }

  if (key === "src") {
    if (typeof value === "object" && value.type === ReactiveType.Ref) {
      obj[key] = {
        type: TypeProps.Reactive,
        value: value,
      };
    } else if (typeof value === "object" && value.default !== undefined) {
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
    return true;
  }

  if (key === "class") {
    if (typeof value === "string") {
      obj[key] = {
        type: TypeProps.Static,
        value: value,
      };
      return true;
    }

    if (typeof value === "object" && value.type === ReactiveType.Ref) {
      obj[key] = {
        type: TypeProps.Reactive,
        value: value,
      };
      return true;
    }

    obj[key] = {
      type: hasReactive(value) ? TypeProps.Reactive : TypeProps.Static,
      value: value,
    };

    return true;
  }

  return false;
}

const dopCheck = ["checked", "disabled", "selected"];

/**
 * Работа с props которые не являютя event. Необходимо чтобы правильно работать с реактивными переменными и так далее.
 * @param obj
 * @param key
 * @returns
 */
function workWithStaticProps(obj: ParsedProps, key: string): boolean {
  const value = obj[key];

  if (SPECIFIC_KEYS.includes(key)) {
    return specificProps(obj, key);
  }

  if (
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean"
  ) {
    if (dopCheck.includes(key)) {
      if (obj[key]) {
        obj[key] = {
          type: TypeProps.Static,
          value: obj[key],
        };
      }
      return true;
    }

    obj[key] = {
      type: TypeProps.Static,
      value: obj[key],
    };

    return true;
  }

  if (
    (typeof value === "object" &&
      value.type !== undefined &&
      value.type === ReactiveType.Ref) ||
    value.type === ReactiveType.RefO
  ) {
    obj[key] = {
      type: TypeProps.Reactive,
      value: value,
    };

    return true;
  }

  // if (
  //   typeof value === "object" &&
  //   value.type !== undefined &&
  //   value.type === ReactiveType.RefComputed
  // ) {
  //   obj[key] = {
  //     type: TypeProps.ReactiveComputed,
  //     value: value,
  //   };

  //   return true;
  // }

  // if (typeof value === "object" && key === `$${SLOT}`) {
  //   obj[key] = value;
  //   return true;
  // }

  if (typeof value === "object" || typeof value === "function") {
    obj[key] = {
      type: TypeProps.Static,
      value: value,
    };
    return true;
  }

  return false;
}

/**
 * Функция помогающая правильно обработать props
 * @param insertoObj - Объект props
 * @returns обновленный объект props
 */
function propsWorker(insertoObj: Props): ParsedProps {
  const obj: ParsedProps = { ...insertoObj };

  Object.keys(obj).forEach((key: string) => {
    if (key.startsWith("_") || key.startsWith("__")) {
      return;
    }

    if (key.startsWith("on")) {
      workWithEvent(obj, key);
      return;
    }

    const stat = workWithStaticProps(obj, key);

    if (stat) {
      return;
    }
    console.warn(`"${key}" this key is not supported`);
    delete obj[key];
  });
  return obj;
}

export { propsWorker };
