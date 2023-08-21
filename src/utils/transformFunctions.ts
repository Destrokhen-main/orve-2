/**
 * Из строки делает camelCase
 * @param str - строка
 * @returns - переработанная строка
 */
function cameCase(str: string) {
  return str
    .replace(/(?:^\w|[A-Z]|\b\w)/g, function (word, index) {
      return index === 0 ? word.toLowerCase() : word.toUpperCase();
    })
    .replace(/\s+/g, "");
}

/**
 * из строки делает snakeCase
 * @param str - строка
 * @returns переработанная строка
 */
function snakeToCamel(str: string) {
  return str
    .toLowerCase()
    .replace(/([-_][a-z])/g, (group) =>
      group.toUpperCase().replace("-", "").replace("_", ""),
    );
}

const camelToSnakeCase = (str: string) =>
  str.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`);

export { cameCase, snakeToCamel, camelToSnakeCase };
