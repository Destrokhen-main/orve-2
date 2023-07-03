import { Subject, startWith, share } from "rxjs";
import { Reactive, ReactiveType } from "./type";
import { refArrayBuilder } from "./refHelper";

type refInput = string | number | Function;

interface Ref extends Reactive {
  value: refInput,
  $sub: any,
  formate: (func: (e: any) => any) => any 
}

export interface RefA extends Reactive {
  value: any,
  $sub: any,
  for: (item: any, index: number) => any 
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

  if (Array.isArray(value)) {
    const subject: Subject<any> = new Subject();

    const obj: RefA = {
      type: ReactiveType.RefA,
      value: null,
      $sub: subject.pipe(startWith(value), share()),
      for: function(func) {
        return {
          type: ReactiveType.RefArrFor,
          value: func,
          parent: this
        }
      }
    }

    const arr = refArrayBuilder(value, obj);

    obj['value'] = arr;

    const refProxy = new Proxy(obj, {
      set(t: RefA, p: string, v: any) {
        if (p === "value") {
          const newAr = refArrayBuilder(v, obj);
          obj.$sub.next({
            type: "delete",
            start: 0,
            count: t.value.length
          })

          obj.$sub.next({
            type: "insert",
            dir: "right",
            value: v
          })

          t.value = newAr;
        }
        return true;
      },
      deleteProperty() {
        return false;
      }
    })

    return refProxy;
  }

  if (typeValue === "object") {
    console.log("Object");
    return;
  }
}

export { ref, Ref };