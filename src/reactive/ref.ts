import { Subject, startWith, share } from "rxjs";
import { Reactive, ReactiveType } from "./type";

type refInput = string | number | Function;

interface Ref extends Reactive {
  value: refInput,
  $sub: any,
  formate: (func: (e: any) => any) => any 
}

export interface RefFormater {
  type: ReactiveType,
  value: (e: any) => any,
  parent: any
}

function ref(value: unknown) {
  const typeValue = typeof value;

  if (["string", "number", "function"].includes(typeValue)) {
    const val = value as refInput;

    const subject: Subject<refInput> = new Subject();

    const obj: Ref = {
      type: ReactiveType.Ref,
      value: val,
      $sub: subject.pipe(startWith(val), share()),
      formate: function(func): RefFormater {
        return {
          type: ReactiveType.RefFormater,
          value: func,
          parent: this
        }
      }
    }

    return new Proxy(obj, {
      set(t: Ref, p:string, v: unknown) {
        if (p === "value") {
          if (typeof v === "string" || typeof v === "number" || typeof v === "function") {
            t.$sub.next(v)
          }   
        }
        return Reflect.set(t,p,v);
      },
      deleteProperty(t: Ref, p: string) {
        if (["value", "$sub"].includes(p)) {
          return false
        }
        return true;
      }
    })
  }
}

export { ref, Ref };