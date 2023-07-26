/**
 * Поможет вам создать scoped стили.
 */

import { genUID } from "../helper/generation";

let StyleTag: HTMLElement | null = null;

interface IOptions {
  scoped?: boolean;
  single?: boolean;
}

/* TODO 
[ ] - стили по типу .class-1, .class-2 должны правильно отрабатывать.
[ ] - помимо string в стилях можно отправить и object ("display: 'flex'" === { display: "flex"}). В таком случаи это тоже надо обработать. 
*/
function scopedStyle(styles: Record<string, string>, options: IOptions) {
  if (typeof styles !== "object") {
    console.warn(`Ошибка в создание scoped style ${styles}`);
    return {};
  }

  let finalStyle = "";
  const obj: Record<string, string> = {};

  Object.keys(styles).forEach((key: string) => {
    const prKey =
      options?.scoped === false
        ? key.replace("#", "")
        : `${key.replace("#", "")}__${genUID(8)}`;
    obj[key] = prKey;
    finalStyle += `${key.startsWith("#") ? "#" : "."}${prKey} {${
      styles[key]
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
