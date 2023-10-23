export function insertHTMLNode(workItem: any | any[] | null, item: any | any[], replace: boolean = false): any | any[] {
  // let newNode: any = null;
  // Если это один элемент

  if (Array.isArray(item)) {
    if (workItem === null) {
      return item;
    }
    if (replace) {
      let currentItem: any | null = null;
      if (Array.isArray(workItem)) {
        currentItem = workItem[0].node;

        for (let i = 1; i !== workItem.length; i++) {
          workItem[i].node.remove();
        }
      } else {
        currentItem = workItem.nodeType === 8 ? workItem : workItem.node;
      }
      item.forEach((e, i) => {
        currentItem[i === 0 ? 'replaceWith' : 'appendChild'](e.node);
        currentItem = e.node;
      });

    } else {
      let curItem = Array.isArray(workItem) ? workItem[workItem.length - 1] : workItem;
      item.forEach((e) => {
        curItem.appendChild(e.node);
        curItem = e.node;
      });
    }

    return item;
  } else {
    if (workItem !== null) {
      workItem[replace ? 'replaceWith' : 'appendChild'](item.node);
    }

    return item;
  }
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