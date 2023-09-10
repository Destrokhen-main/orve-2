import { BehaviorSubject, share } from "rxjs";
import { Reactive, ReactiveType } from "./type";

export interface IRefC extends Reactive {
  $sub: any;
  value: any;
}

/**
 * Создаёт реактивный компонент
 * @param startComponent - Изначальный компонент.
 * @returns - Реактивный компонент
 */
function refC(startComponent: any): IRefC {
  const subject: BehaviorSubject<() => unknown> = new BehaviorSubject(
    startComponent,
  );
  const component: IRefC = {
    type: ReactiveType.RefC,
    $sub: subject.pipe(share()),
    value: startComponent,
  };

  return new Proxy(component, {
    set(t: IRefC, p: keyof IRefC | string, v: unknown) {
      const s = Reflect.set(t, p, v);
      if (p === "value") {
        t.$sub.next(v);
      }
      return s;
    },
  });
}

export { refC };
