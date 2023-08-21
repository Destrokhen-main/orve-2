import { ReactiveType } from "../reactive/type";

/**
 * Проверяет элемент на компонент
 * @param item - Элемент
 * @returns - true если это правда
 */
function isComponent(item: object): boolean {
  const obj: Record<string, any> = item;
  if (obj.tag !== undefined) {
    return true;
  }
  return false;
}

/**
 * Проверяет html ли это
 * @param item - строка
 * @returns true - если правда
 */
function isHtmlNode(item: string): boolean {
  const REQEX = /<\/?[a-z][\s\S]*>/i;
  if (REQEX.test(item)) {
    return true;
  }

  return false;
}

/**
 * Проверяет является ли это реактивным объектом
 * @param item - обхект
 * @returns true если это правда
 */
function isReactiveObject(item: unknown): boolean {
  if (typeof item !== "object") {
    return false;
  }

  if (item === null) {
    return false;
  }

  const workObject = item as Record<string, any>;

  if (
    workObject.type !== undefined &&
    Object.keys(ReactiveType).includes(workObject.type)
  ) {
    return true;
  }

  return false;
}

/**
 * Проверяет является ли объект функцией форматирования
 * @param item - объект
 * @returns - true если это правда
 */
function isFormater(item: unknown): boolean {
  if (typeof item !== "object") {
    return false;
  }

  if (item === null) {
    return false;
  }

  const workObject = item as Record<string, any>;

  if (
    workObject.type !== undefined &&
    workObject.type === ReactiveType.RefFormater
  ) {
    return true;
  }

  return false;
}

export { isComponent, isHtmlNode, isReactiveObject, isFormater };
