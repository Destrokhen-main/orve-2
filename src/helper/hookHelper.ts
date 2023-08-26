import { NodeHooks } from "../jsx";
import { NodeOP } from "../parser/parser";

/* TODO
[ ] - Передавать что-то в хуки
*/

/**
 * Функция вызывает хук внутри обхекта.
 * @param obj - NodeOP объект, который содержит свойство - [hooks]
 * @param nameHook - Название хука. Тип NodeHooks
 * @returns boolean - true если все прошло успешно.
 */
export function InvokeHook(
  obj: NodeOP,
  nameHook: string | keyof NodeHooks,
): boolean {
  if (obj.hooks === undefined) {
    return false;
  }

  const h = obj.hooks;
  if (Object.keys(h).includes(nameHook)) {
    try {
      h[nameHook as keyof NodeHooks]({});
      return true;
    } catch (er) {
      console.error("[hooks] - catch error:", er);
      return false;
    }
  } else {
    return true;
  }
}

/**
 * Запускает вызов хука для всех NodeOP переданных внутрь функции
 * @param obj - NodeOP объект
 * @param hook - Название хука. Тип NodeHooks
 */
export function InvokeAllNodeHook(obj: NodeOP, hook: keyof NodeHooks): void {
  let quee = [obj];

  while (quee.length > 0) {
    const item = quee.shift();

    if (
      item !== undefined &&
      item.hooks !== undefined &&
      item.hooks[hook] !== undefined
    ) {
      item.hooks[hook]({});

      if (item.children !== undefined && item.children.length > 0) {
        quee = [...quee, ...item.children];
      }
    }
  }
}
