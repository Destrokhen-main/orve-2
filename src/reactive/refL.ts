import { Subject, share, startWith } from "rxjs";

interface refL {
  value: any;
  $sub: any;
}

/**
 * Создает реактивную переменную под ссылку на тег
 * @returns реактивную переменную
 */
function refL() {
  const subject: Subject<Element> = new Subject();

  const obj = {
    value: undefined,
    $sub: subject.pipe(startWith(undefined), share()),
  };

  const proxy = new Proxy(obj, {
    set(t: refL, p: string | keyof refL, v: any) {
      if (p === "value") {
        t.value = v;
        (obj.$sub as any).next(v);
        return true;
      }
      return false;
    },
  });

  return proxy;
}

export { refL };
