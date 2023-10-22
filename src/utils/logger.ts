type TypeLogger = 'log' | 'warn' | 'error';

export function logger(type: TypeLogger, text: string) {
  let needFormat = false;

  if (/%c/gm.test(text)) {
    needFormat = true;
  }

  if (needFormat) {
    console[type](text, `font-weight: bold`, `font-weight: normal`,);
  } else {
    console[type](text);
  }
}