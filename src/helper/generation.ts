import { randInt } from "./random";

const ALL_CHAR = "qwertyuiopasdfghjklzxcvbnm1234567890";

/**
 * Функция генерирует случайную строку длинной len
 * @param len - Length of the string
 * @returns string - сгенерированную строку.
 */
function genUID(len: number = 8): string {
  let key = "";

  while (key.length < len) {
    key += ALL_CHAR[randInt(0, ALL_CHAR.length - 1)];
  }

  return key;
}

export { genUID };
