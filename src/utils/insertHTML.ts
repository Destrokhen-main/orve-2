import { NodeOP } from "../parser/parser";

function deleteAllNodeButNotFirst(placedItems: any[]): any {
  const startItem = placedItems[0];

  for (let i = 1; i !== placedItems.length; i++) {
    placedItems[i]?.node !== undefined && placedItems[i].node?.remove();
  }

  return startItem;
}

function isOrveNode(node: unknown): boolean {
  return typeof node === 'object' && node !== null && (node as any)['node'] !== undefined;
}

type PlacedItems = Comment | Element | NodeOP | any[] | null;
export function insertHTMLNode(placedItems: PlacedItems, newItems: NodeOP | any[], replace: boolean = false, comment?: string): NodeOP | any[] {
  // let newNode: any = null;
  // Если это один элемент

  if (placedItems === null) return newItems;

  if (Array.isArray(placedItems)) {
    // значит что сейчас на экране массив а не один элемент

    let startItem = null;
    // Тут надо понять, нужен ли replace

    if (replace) {
      if (Array.isArray(placedItems)) {
        startItem = deleteAllNodeButNotFirst(placedItems);
      } else {
        startItem = placedItems;
      }
    }
    // Почистил перед собой все
    // тут или компонент или коммент
    if (Array.isArray(newItems)) {
      if (isOrveNode(startItem)) {
        // это не коммент
      }
    } else {
      // значит нужно добавить в конец один элемент
    }
  }

  return [];

  // if (Array.isArray(item)) {
  //   if (workItem === null) {
  //     return item;
  //   }
  //   if (replace) {
  //     let currentItem: any | null = null;
  //     if (Array.isArray(workItem)) {
  //       currentItem = workItem[0].node;

  //       for (let i = 1; i !== workItem.length; i++) {
  //         workItem[i].node.remove();
  //       }
  //     } else {
  //       // TODO поломал обычное отображение но теперь работают template (
  //       currentItem = (workItem?.nodeType ?? 0) === 8 ? workItem : workItem.node;
  //     }
  //     item.forEach((e, i) => {
  //       currentItem[i === 0 ? 'replaceWith' : 'appendChild'](e.node);
  //       currentItem = e.node;
  //     });

  //   } else {
  //     let curItem = Array.isArray(workItem) ? workItem[workItem.length - 1] : workItem;
  //     item.forEach((e) => {
  //       curItem.appendChild(e.node);
  //       curItem = e.node;
  //     });
  //   }

  //   return item;
  // } else if (Array.isArray(workItem)) {
  //   const currentItem = workItem[0].node;

  //   for (let i = 1; i !== workItem.length; i++) {
  //     workItem[i].node.remove();
  //   }

  //   currentItem[replace ? 'replaceWith' : 'appendChild'](item.node);
  // } else {
  //   if (workItem !== null) {
  //     workItem.node[replace ? 'replaceWith' : 'appendChild'](item.node);
  //   }

  //   return item;
  // }
}

export function removeAllAndInsertComment(workItem: any | any[], comment: Comment) {
  if (Array.isArray(workItem)) {
    const item = workItem[0];

    for (let i = 1; i !== workItem.length; i++) {
      workItem[i].node.remove();
    }

    item.node.replaceWith(comment);
    return comment;
  } else {
    workItem.node.replaceWith(comment);
    return comment;
  }
}