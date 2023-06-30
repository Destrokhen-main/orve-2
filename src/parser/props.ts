import { Props } from "../jsx";
import { TypeProps } from "./type"; 

export interface PropsItem {
  type: TypeProps,
  value: any
}

function propsWorker(obj: Props): Props {
  Object.keys(obj).forEach((key: string) => {

    if (key.startsWith('on') && typeof obj[key] === "function") {
      const func = obj[key];
      delete obj[key];
      obj[key.replace("on", "").toLowerCase().trim()] = {
        type: TypeProps.Event,
        value: func.bind(this)
      }
      return;
    }

    if (typeof obj[key] === "string" || typeof obj[key] === "number") {
      obj[key] = {
        type: TypeProps.Static,
        value: obj[key]
      }
      return;
    }

    console.warn(`"${key}" this key is not supported`);
    delete obj[key];
  });
  return obj;
}

export { propsWorker }