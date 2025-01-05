// import { toString } from "./helper_old";

// /**
//  * Функция помогает правильно менять атрибуты у HTMLElement
//  * @param root - HTMLElement
//  * @param key - аттрибут
//  * @param value - значение
//  */
// const changerAttributes = (root: HTMLElement, key: string, value: any) => {
//   if (key === "value") {
//     (root as HTMLInputElement).value = toString(value);
//   } else {
//     if (value !== undefined) {
//       root.setAttribute(key, String(value));
//     }
//   }
// };

// export { changerAttributes };
