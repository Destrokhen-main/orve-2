import { Subject, share, startWith } from "rxjs";

interface refL {
  value: any,
  $sub: any
}

function refL(startValue: unknown = null) {
  const subject: Subject<Element> = new Subject();

  const obj = {
    value: startValue !== null ? startValue : "",
    $sub: subject.pipe(startWith(undefined), share())
  }

  const proxy = new Proxy(obj, {
    set(t: refL, p: string | keyof refL, v: any) {
      if (p === "value") {
        t.value = v;
        (obj.$sub as any).next(v);
        return true;
      }
      return false;
    }
  })

  return proxy;
}

export { refL }