import { isEqual } from "../../utils/isEqual";

export function DifferentItems(a: any[], b: any[]): number[] {
  const items: any[] = [];

  a.forEach((item, index) => {
    if (b[index] !== undefined) {
      if (!isEqual(item, b[index])) {
        items.push({
          type: "modify",
          index
        });
      }
    } else {
      items.push({
        type: "Delete",
        index
      });
    }
  });

  if (a.length < b.length) {
    const ar = b.slice(a.length, b.length);
    ar.forEach((_, index) => {
      items.push({
        type: "new",
        index: a.length + index
      });
    });
  }

  return items;
}