import { parserNodeF } from "../../parser/parser";
import { NodeOP } from "../../parser/parser-type";
import { singelMounterChildren } from "../children";

/* TODO
{RefC} - вставка в код

[ ] - Дать возможность передавать () => import("...") и обычные компоненты <Component />
[ ] - Комент если value undefined
[ ] - Компоненты могут быть fragment
*/
function RefCWorker(root: Element | null, item: Record<string, any>) {
  const component = parserNodeF.call({}, item.value);
  const mounterInsance = singelMounterChildren(null, null);

  let mountedNode: NodeOP | null = null;

  if (component === null) {
    return;
  }

  const mount = mounterInsance(component);

  if (mount.node !== undefined) {
    mountedNode = mount;
    root?.appendChild(mount.node);
  }

  item.$sub.subscribe(async (next: any) => {
    console.log(next);
  });
}

/* TODO
Эта конструкция даёт возможность сделать вот такую штуку
<RefC ....>
  ....
</RefC>

[ ] - Дать возможность передавать () => import("...") и обычные компоненты <Component />
[ ] - Комент если value undefined
[ ] - Компоненты могут быть с в родителе fragment
[X] - <template></template>
*/
function RefCComponentWorker(root: Element | null, item: Record<string, any>) {
  const component = parserNodeF.call({}, item.proxy.value, item.props);
  const mounterInsance = singelMounterChildren(null);

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

export { RefCWorker, RefCComponentWorker };
