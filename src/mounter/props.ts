import { fromEvent, startWith, pairwise } from "rxjs";
import { Props } from "../jsx";
import { PropsItem } from "../parser/props";
import { TypeProps } from "../parser/type";

function prepaireStaticRectF(item: any, key: string, val: any = null) {
  let value = null

  try {
    value = item.value(val === null ? item.parent.value : val);
  } catch (err) {
    console.error(` "${key}" - ${err}`);
  }

  return value
}


function propsWorker(root: HTMLElement, item: Props) {
  Object.keys(item).forEach((key: string) => {
    const obj: PropsItem = item[key];

    if (obj.type === TypeProps.Static) {
      root.setAttribute(key, obj.value);
    }

    if (obj.type === TypeProps.Event) {
      fromEvent(root, key).subscribe(obj.value)
    }

    if (obj.type === TypeProps.EventReactive) {
      let event = fromEvent(root, key).subscribe(obj.value.value);

      obj.value.$sub.pipe(startWith(obj.value.value), pairwise()).subscribe(([before, after]: [() => any, () => any]) => {
        if (String(before || "") !== String(after || "")) {
          event.unsubscribe();
          event = fromEvent(root, key).subscribe(after)
        }
      })
    }
    if (obj.type === TypeProps.EventReactiveF) {
      const item = obj.value;
      const value = prepaireStaticRectF(item, key);
      
      if (value !== null && typeof value === "function") {
        let event = fromEvent(root, key).subscribe(value);

        item.parent.$sub.pipe(startWith(value), pairwise()).subscribe(([before, after]: [any, any]) => {
          const newKey = prepaireStaticRectF(item, key, after);

          if (newKey !== null && before !== newKey) {
            event.unsubscribe();
            event = fromEvent(root, key).subscribe(newKey);
          }
        });
      } else {
        if (typeof value !== "function") {
          console.error("value return not a function");
        }
      }
    }

    if (obj.type === TypeProps.StaticReactive) {
      root.setAttribute(key, String(obj.value.value));

      obj.value.$sub.pipe(startWith(obj.value.value), pairwise()).subscribe(([before, after]: [string | number, string | number]) => {
        if (before !== after) {
          root.setAttribute(key, String(after));
        }
      })
    }

    if (obj.type === TypeProps.StaticReactiveF) {
      const item = obj.value;
      const value = prepaireStaticRectF(item, key);

      if (value !== null) {
        root.setAttribute(key, String(value));

        item.parent.$sub.pipe(startWith(value), pairwise()).subscribe(([before, after ]: [any, any]) => {
          const newKey = prepaireStaticRectF(item, key, after);

          if (newKey !== null && before !== newKey) {
            root.setAttribute(key, String(newKey));
          }
        })
      }
    }
  })
}

export { propsWorker }