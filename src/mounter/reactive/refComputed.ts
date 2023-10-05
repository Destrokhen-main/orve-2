/* TODO
[ ] - работа с массивами
[ ] - работа с объектами
*/
export function RefComputedWorker(root: Element | null, item: Record<string, any>) {
  const textNode = document.createTextNode(item.value);
  root?.append(textNode);

  if (item.dep.length > 0) {
    item.dep.forEach((el: any) => {
      el.$sub.subscribe(() => {
        const recal = item.func();

        if (recal !== item.lastCall) {
          item.lastCall = recal;
          item.value = recal;
          textNode.textContent = recal;
        }
      });
    });
  }
}