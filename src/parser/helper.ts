import { NodeB } from "../jsx-type";
import { HOOKS_STRING_NAME, ACCESS_KEY } from "../jsx-type";

/**
 * Валидация компонента
 * @param node - Компонент
 * @returns true если всё хорошо
 */
function isValidNode(node: unknown, nameComponent = "-"): boolean {
  if (typeof node !== "object") {
    return false;
  }
  if (node === null) {
    return false;
  }

  const keys = Object.keys(node);

  for (let i = 0; i !== keys.length; i++) {
    if (!ACCESS_KEY.includes(keys[i])) {
      console.warn(
        `[${nameComponent}()] "${keys[i]}" - Этот ключ не является частью nodeObject`,
      );
      return false;
    }
  }

  const knowNode = node as NodeB;

  if (knowNode.hooks !== undefined) {
    if (typeof knowNode.hooks !== "object") {
      console.error(`[${nameComponent}()] o-hook not a object`);
      return false;
    }

    const hooks = knowNode.hooks;
    const keys = Object.keys(hooks);

    for (let i = 0; i !== keys.length; i++) {
      if (!HOOKS_STRING_NAME.includes(keys[i])) {
        console.error(
          `[${nameComponent}()] o-hook - "${keys[i]}" - not supported`,
        );
        return false;
      }
    }
  }

  return true;
}

export { isValidNode };
