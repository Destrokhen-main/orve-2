import { parserNodeF, NodeOP } from "../../parser/parser";
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
  const component = parserNodeF.call({}, item.proxy.value, item.props);
  const mounterInsance = singleMounterChildren(null);

  let mountedNode: NodeOP | null = null;

  if (component === null) {
    return;
  }
  const mount = mounterInsance(component);
  if (mount.node !== undefined) {
    mountedNode = mount;
    root?.appendChild(mount.node);
  }

  item.proxy.$sub.subscribe((next: any) => {
    // TODO поправить код, тут нет проверок, это плохо и надо проверять чтоб повторений не было
    const component = parserNodeF.call({}, next, item.props);
    if (component === null) {
      return;
    }

    const mount = mounterInsance(component);
    if (mount.node !== undefined) {
      mountedNode?.node?.replaceWith(mount.node);
      mountedNode = mount;
    }
  });

  return mountedNode !== null ? mountedNode.node : null;
}

export { RefCComponentWorker };
