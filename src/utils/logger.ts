type TypeLogger = "log" | "warn" | "error";

export function logger(type: TypeLogger, ...text: any[]) {
  let needFormat = false;

  if (text.some((x) => /%c/gm.test(x))) {
    needFormat = true;
  }

  if (needFormat) {
    console[type](text, `font-weight: bold`, `font-weight: normal`);
  } else {
    console[type](text);
  }
}
