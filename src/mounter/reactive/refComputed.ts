import { distinct } from "rxjs";

/* TODO
[ ] - работа с массивами
[ ] - работа с объектами
*/
export function RefComputedWorker(
  root: Element | null,
  item: Record<string, any>,
) {
  const textNode = document.createTextNode(item.value);
  root?.append(textNode);

  if (item.dep.length > 0) {
    item.dep.forEach((el: any) => {
      el.$sub.pipe(distinct()).subscribe(() => {
        const recal = item.func();
        item.value = recal;
        textNode.textContent = String(recal);
      });
    });
  }
}
