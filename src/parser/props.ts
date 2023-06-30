import { Props } from "../jsx";
import { ReactiveType } from "../reactive/type";
import { TypeProps } from "./type"; 

export interface PropsItem {
  type: TypeProps,
  value: any
}

function workWithEvent(obj: any, key: string) {
  const func = obj[key];
  const pKey = key.replace("on", "").toLowerCase().trim();

  delete obj[key];
  if (typeof func === "object" && func.type !== undefined && (func.type === TypeProps.EventReactiveF || func.type === TypeProps.EventReactive )) {
    obj[pKey] = {
      type: func.type === ReactiveType.RefFormater ? TypeProps.EventReactiveF : TypeProps.EventReactive,
      value: func 
    }
    return obj;
  }

  obj[pKey] = {
    type: TypeProps.Event,
    value: func.bind(this)
  }

  return obj;
}


function workWithStaticProps(obj: any, key: string) {
  const value = obj[key];
  
  if (typeof value === "string" || typeof value === "number") {
    obj[key] = {
      type: TypeProps.Static,
      value: obj[key]
    }

    return [obj, true];
  }

  if (typeof value === "object" && value.type !== undefined && value.type === ReactiveType.Ref) {
    obj[key] = {
      type: TypeProps.StaticReactive,
      value: value
    }

    return [ obj, true ];
  }

  if (typeof value === "object" && value.type !== undefined && value.type === ReactiveType.RefFormater) {
    obj[key] = {
      type: TypeProps.StaticReactiveF,
      value: value
    }

    return [ obj, true ];
  }

  return [obj, false];
}


function propsWorker(obj: Props): Props {
  Object.keys(obj).forEach((key: string) => {
    if (key.startsWith('on')) {
      obj = workWithEvent(obj, key);
      return;
    }

    const [object, stat] = workWithStaticProps(obj, key);

    if (stat) {
      obj = object
      return;
    }

    console.warn(`"${key}" this key is not supported`);
    delete obj[key];
  });
  return obj;
}

export { propsWorker }