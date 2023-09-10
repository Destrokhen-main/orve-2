import { BehaviorSubject, share } from "rxjs";

interface refL {
  value: Element | undefined;
  $sub: BehaviorSubject<any>;
}

/**
 * Создает реактивную переменную под ссылку на тег
 * @returns реактивную переменную
 */
function refL(): refL {
  const subject: BehaviorSubject<any> = new BehaviorSubject(undefined);

  const obj: refL = {
    value: undefined,
    $sub: subject.pipe(share()) as any,
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
