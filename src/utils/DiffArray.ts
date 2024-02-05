import { isEqual } from "lodash-es";

export enum DiffType {
  Modify = "Modify",
  Delete = "Delete",
  New = "New",
}

export function DifferentItems(a: any[], b: any[]): number[] {
  const items: any[] = [];

  a.forEach((item, index) => {
    if (b[index] !== undefined) {
      if (!isEqual(item, b[index])) {
        items.push({
          type: DiffType.Modify,
          index,
        });
      }
    } else {
      items.push({
        type: DiffType.Delete,
        index,
      });
    }
  });

  if (a.length < b.length) {
    const ar = b.slice(a.length, b.length);
    ar.forEach((_, index) => {
      items.push({
        type: DiffType.New,
        index: a.length + index,
      });
    });
  }

  return items;
}
