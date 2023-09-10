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
[X] - стили по типу .class-1, .class-2 должны правильно отрабатывать.
[X] - помимо string в стилях можно отправить и object ("display: 'flex'" === { display: "flex"}). В таком случаи это тоже надо обработать. 
[X] - Можно использовать функции для вызова повторного кода из объекта выше
*/

/**
 * Создать scoped стили.
 * @param styles - Объект стилей
 * @param options - Объект настроек для функции. { scoped: boolean, single: boolean }
 * @returns
 */
function scopedStyle(
  styles: Record<
    string,
    string | Record<string, string> | (() => string | Record<string, string>)
  >,
  options?: IOptions,
): Record<string, string> {
  if (typeof styles !== "object") {
    console.warn(`Ошибка в создание scoped style ${styles}`);
    return {};
  }

  let finalStyle = "";
  const obj: Record<string, string> = {};

  const styledKeys = Object.keys(styles);

  styledKeys.forEach((key: string) => {
    let partString;
    if (key.indexOf(",") !== -1) {
      const parseClass = key.split(",").map((e) => e.trim());

      const afterWorkClass = parseClass.map((parsedKey: string) => {
        const prKey =
          options?.scoped === false
            ? parsedKey.replace(/[#.]/gm, "")
            : `${parsedKey.replace(/[#.]/gm, "")}__${genUID(8)}`;
        obj[parsedKey.replace(".", "")] = prKey;

        const partString = `${parsedKey.startsWith("#") ? "#" : "."}${prKey}`;
        return partString;
      });

      partString = afterWorkClass.join(", ");
    } else {
      const prKey =
        options?.scoped === false
          ? key.replace(/[#.]/gm, "")
          : `${key.replace(/[#.]/gm, "")}__${genUID(8)}`;
      obj[key] = prKey;

      partString = `${key.startsWith("#") ? "#" : "."}${prKey}`;
    }

    let fn;

    if (typeof styles[key] === "function") {
      fn = (styles[key] as () => string | Record<string, string>)();
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
  // Проверим есть ли тег

  const tag = document.querySelector("head")?.querySelector("style[orve='']");
  if (tag === null) {
    StyleTag = null;
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
