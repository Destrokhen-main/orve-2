import { Subject, share, startWith } from "rxjs";
import { Reactive, ReactiveType } from "./type";

interface IRefC extends Reactive {
  $sub: any;
  value: any;
}

function refC(startComponent: any) {
  const subject: Subject<any> = new Subject();
  const component: IRefC = {
    type: ReactiveType.RefC,
    $sub: subject.pipe(startWith(startComponent), share()),
    value: startComponent,
  };

  return new Proxy(component, {
    set(t: IRefC, p: keyof IRefC | string, v) {
      const s = Reflect.set(t, p, v);
      if (p === "value") {
        t.$sub.next(v);
      }
      return s;
    },
  });
}

export { refC };
