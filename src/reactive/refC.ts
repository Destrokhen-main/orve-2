import { Line } from "../utils/line";
import { Reactive, ReactiveType } from "./type";

interface IRefC extends Reactive {
  $sub: any;
  value: any;
}

/**
 * Создаёт реактивный компонент
 * @param startComponent - Изначальный компонент.
 * @returns - Реактивный компонент
 */
function refC(startComponent: any) {
  const subject = new Line();
  const component: IRefC = {
    type: ReactiveType.RefC,
    $sub: subject,
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
