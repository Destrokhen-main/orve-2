import { isEqual, isEqualWith, omit, functions } from "lodash-es";

export enum DiffType {
  Modify = "Modify",
  Delete = "Delete",
  New = "New",
}

// isEqual(_.omit(o1, _.functions(o1)), _.omit(o2, _.functions(o2)))

export function DifferentItems(a: any[], b: any[]): number[] {
  const items: any[] = [];

  a.forEach((item, index) => {
    if (b[index] !== undefined) {
      // TODO фиг знает норм или нет
      if (
        !isEqualWith(item, b[index], (n, o) => {
          if (typeof n === 'function' && typeof o === 'function') {
            return isEqual(functions(n), functions(o));
          }

          return undefined;
        })
      ) {
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
