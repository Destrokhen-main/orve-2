import { objectToCss } from "../../../parser/props";

export function patchStyle(el: any, nextValue: any) {
  if (typeof nextValue === "string") {
    el.setAttribute("style", nextValue);
  }

  if (typeof nextValue === "object") {
    el.setAttribute("style", objectToCss(nextValue));
  }
}

export function patchSingleStyle(el: any, key: string, nextValue: any) {
  if (nextValue === null) {
    el.style.removeProperty(key);
  }

  el.style[key] = nextValue;
}
