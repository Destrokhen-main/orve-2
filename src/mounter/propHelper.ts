/**
 * Функция помогает правильно менять атрибуты у HTMLElement
 * @param root - HTMLElement
 * @param key - аттрибут
 * @param value - значение
 */
const changerAttributes = (root: HTMLElement, key: string, value: any) => {
  if (key === "value") {
    (root as HTMLInputElement).value = String(value);
  } else {
    root.setAttribute(key, String(value));
  }
};

export { changerAttributes };
