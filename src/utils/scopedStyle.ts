/**
 * Поможет вам создать scoped стили.
 */

import { genUID } from "../helper/generation";
import { objectToCss } from "../parser/props";

let StyleTag: HTMLElement | null = null;

interface IOptions {
  scoped?: boolean;
  single?: boolean;
}

/* TODO 
[ ] - стили по типу .class-1, .class-2 должны правильно отрабатывать.
[X] - помимо string в стилях можно отправить и object ("display: 'flex'" === { display: "flex"}). В таком случаи это тоже надо обработать. 
[X] - Можно использовать функции для вызова повторного кода из объекта выше
*/
function scopedStyle(styles: Record<string, any>, options: IOptions) {
  if (typeof styles !== "object") {
    console.warn(`Ошибка в создание scoped style ${styles}`);
    return {};
  }

  let finalStyle = "";
  const obj: Record<string, string> = {};

  const styledKeys = Object.keys(styles);

  styledKeys.forEach((key: string) => {
    const prKey =
      options?.scoped === false
        ? key.replace("#", "")
        : `${key.replace("#", "")}__${genUID(8)}`;
    obj[key] = prKey;

    let partString = `${key.startsWith("#") ? "#" : "."}${prKey}`;

    let fn;

    if (typeof styles[key] === "function") {
      fn = styles[key]();
    } else {
      fn = styles[key];
    }

    finalStyle += `${partString} {${
      typeof fn === "object" ? objectToCss(fn) : fn
    }}\n`;
  });

  if (options?.single === true) {
    const style = document.createElement("style");
    style.setAttribute("orve", "");
    style.innerHTML = finalStyle;
    if (document.querySelector("head")?.appendChild(style) === undefined) {
      console.warn("scopedStyle - Ошибка в построение scoped styles");
    }
    return obj;
  }

  if (StyleTag === null) {
    StyleTag = document.createElement("style");
    // Пометим тег
    StyleTag.setAttribute("orve", "");
    if (document.querySelector("head")?.appendChild(StyleTag) === undefined) {
      console.warn("scopedStyle - Ошибка в построение scoped styles");
    }
  }
  StyleTag.innerHTML += finalStyle;
  return obj;
}

export { scopedStyle };
