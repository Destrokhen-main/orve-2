import { fromEvent } from "rxjs";
import { Props } from "../jsx";
import { PropsItem } from "../parser/props";
import { TypeProps } from "../parser/type";

function propsWorker(root: HTMLElement, item: Props) {
  Object.keys(item).forEach((key: string) => {
    const obj: PropsItem = item[key];

    if (obj.type === TypeProps.Static) {
      root.setAttribute(key, obj.value);
    }

    if (obj.type === TypeProps.Event) {
      fromEvent(root, key).subscribe(obj.value)
    }
  })
}

export { propsWorker }