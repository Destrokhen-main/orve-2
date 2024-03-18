import { parserNodeF, NodeOP } from "../../parser/parser";
import { unique } from "../../utils/line/uniquaTransform";
import { singleMounterChildren } from "../children";

/* TODO
Эта конструкция даёт возможность сделать вот такую штуку
<RefC ....>
  ....
</RefC>

[ ] - Дать возможность передавать () => import("...") и обычные компоненты <Component />
[ ] - Комент если value undefined
[ ] - Компоненты могут быть с в родителе fragment
[X] - <slot></slot>
*/
function RefCComponentWorker(root: Element | null, item: Record<string, any>) {
  const COMMENT = document.createComment("refC");
  let mountedNode: NodeOP | Comment | null = null;
  const mounterInsance = singleMounterChildren(null);

  if (item.proxy.value && typeof item.proxy.value === "function") {
    const component = parserNodeF.call({}, item.proxy.value, item.props);

    if (component === null) {
      return;
    }
    const mount = mounterInsance(component);
    if (mount.node !== undefined) {
      mountedNode = mount;
      root?.appendChild(mount.node);
    }
  } else {
    root?.appendChild(COMMENT);
    mountedNode = COMMENT;
  }

  item.proxy.$sub.subscribe(
    unique(
      (next: any) => {
        let _next = next;
        if (next === "update") {
          _next = item.proxy.value;
        }

        if (!_next) {
          return;
        }

        // TODO поправить код, тут нет проверок, это плохо и надо проверять чтоб повторений не было
        const component = parserNodeF.call({}, _next, item.props);
        if (component === null) {
          return;
        }

        const mount = mounterInsance(component);
        if (mount.node !== undefined) {
          if (mountedNode) {
            (mountedNode as Comment).replaceWith(mount.node);
          }
          mountedNode = mount.node;
        }
      },
      item.proxy.value,
      ["update"],
    ),
  );

  return mountedNode !== null ? mountedNode : null;
}

export { RefCComponentWorker };
