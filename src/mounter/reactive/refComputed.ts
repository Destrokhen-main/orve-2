/* TODO
[ ] - работа с массивами
[ ] - работа с объектами
*/
export function RefComputedWorker(
  root: Element | null,
  item: Record<string, any>,
) {
  const textNode = document.createTextNode(item.value);

  if (root !== null)
    root.append(textNode);

  item.$sub.subscribe((v: any) => {
    textNode.textContent = String(v);
  });

  if (root === null)
    return textNode;
}
