import { ReactiveType } from "../reactive/type";

function isComponent(item: object): boolean {
  const obj: Record<string, any> = item;
  if (obj.tag !== undefined) {
    return true;
  }
  return false;
}

function isHtmlNode(item: string): boolean {
  const REQEX = /<\/?[a-z][\s\S]*>/i
  if (REQEX.test(item)) {
    return true;
  }

  return false
}

function isReactiveObject(item: unknown): boolean {
  if (typeof item !== "object") {
    return false;
  }

  if (item === null) {
    return false
  }

  const workObject = item as Record<string, any>;

  if (workObject.type !== undefined && (Object as any).values(ReactiveType).includes(workObject.type)) {
    return true;
  }

  return false;
}

function isFormater(item: unknown): boolean {
  if (typeof item !== "object") {
    return false;
  }

  if (item === null) {
    return false
  }

  const workObject = item as Record<string, any>;

  if (workObject.type !== undefined && workObject.type === ReactiveType.RefFormater) {
    return true
  }

  return false;
}

export { isComponent, isHtmlNode, isReactiveObject, isFormater }