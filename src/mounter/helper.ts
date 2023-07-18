import { parseSingleChildren } from "../parser/children";
import { NodeChild, NodeHtml } from "../parser/type";
import { Ref, RefA, RefFormater } from "../reactive/ref";
import { pairwise, startWith } from "rxjs";
import { InsertType, singelMounterChildren } from "./children";
import { Dir, EtypeRefRequest } from "../reactive/refHelper"

const compareObjects = (a: any, b: any) => {
  if (a === b) return true;

  if (typeof a != 'object' || typeof b != 'object' || a == null || b == null) return false;

  let keysA = Object.keys(a), keysB = Object.keys(b);

  if (keysA.length != keysB.length) { return false; }

  for (let key of keysA) {
    if (!keysB.includes(key)) { return false; }

    if (typeof a[key] === 'function' || typeof b[key] === 'function') {
      if (a[key].toString() != b[key].toString()) { return false; }
    } else {
      if (!compareObjects(a[key], b[key])) { return false; }
    }
  }

  return true;
}

function textNodeCreator(item: NodeChild) {
  const textNode = document.createTextNode(String(item.value));
  item.node = textNode;
  return item;
}

function htmlNodeCreate(item: NodeHtml) {
  const element = new DOMParser()
    .parseFromString(item.value, "text/html")
    .getElementsByTagName("body")[0];

  item.node = element.firstChild as HTMLElement;
  return item;
}

function RefChildCreator(root: Element | null, item: Ref) {
  const textNode = document.createTextNode(String(item.value));

  const sub = item.$sub;
  sub.pipe(startWith(item.value), pairwise()).subscribe({
    next([before, after]: [string | number, string | number]) {
      if (after !== undefined && before !== after) {
        textNode.textContent = String(after);
      }
    }
  } as any)

  if (root !== null) {
    root.appendChild(textNode);
  }
}

function RefFormateChildCreator(root: Element | null, item: RefFormater) {
  const formItem = item.value(item.parent.value);

  const textNode = document.createTextNode(String(formItem));

  item.parent.$sub.subscribe({
    next(after: string | number) {
        const formatedItem = item.value(after);
        textNode.textContent = String(formatedItem);
      }
    }
  )

  if (root !== null) {
    root.appendChild(textNode);
  }
}

/*

// TODO Работать с prepaire только с ним
  let prepaireNode: any = null
  let mountedNode: Comment | any[] | null  = null;
  if (item.value.length === 0) {
    const comment = document.createComment(` refA - ${parent.keyNode} `);
    root?.appendChild(comment);
    mountedNode = comment;
  } else {
    prepaireNode = parseChildren(callback !== null ? item.value.map(callback) : item.value, null);
    const mm = mounterChildren(null, prepaireNode as InsertType[]);

    let mounted: any = [];

    while(mm.length > 0) {
      const item = mm.shift();

      if (Array.isArray(item)) {
        mm.unshift(...item);
      } else {
        mounted.push(item);
      }
    }

    if (root === null) return mounted;

    mountedNode = mounted;

    let startNode = root;

    for(let i = 0; i !== mounted.length; i++) {
      if (i === 0) {
        startNode.appendChild(mounted[i].node)
      } else {
        startNode?.after(mounted[i].node);
      }
      startNode = mounted[i].node;
    }

    if (mounted.length === 0) {
      const comment = document.createComment(` refA - ${parent.keyNode} `);
      root?.appendChild(comment);
      mountedNode = comment;
    }
  }

  item.$sub.subscribe((next: Record<string, any>) => {
    if (next.type === "insert") {
      let m = 0;
      if (Array.isArray(mountedNode)) {
        m = next.dir === "right" ? mountedNode.length : 0;
      }

      const prepaire = callback !== null ? next.value.map((e: any, i: number) => callback(e, m + i)) : next.value;
      const newNode = parseChildren(prepaire, null);
      const mm = mounterChildren(null, newNode as InsertType[]);

      let newMounted: any = [];

      while(mm.length > 0) {
        const item = mm.shift();

        if (Array.isArray(item)) {
          mm.unshift(...item);
        } else {
          newMounted.push(item);
        }
      }

      const dir = next.dir;

      if (!Array.isArray(mountedNode)) {
        const startNode = newMounted.shift();
        const prep = newNode.shift();
        mountedNode?.replaceWith(startNode.node);

        mountedNode = [ startNode ];
        prepaireNode = [ prep ]
      }
      
      let nodeStart = dir === "right" ? mountedNode[mountedNode.length - 1].node : mountedNode[0].node; 
      for(let i = 0; i !== newMounted.length; i++) {
        nodeStart[dir === "right" ? "after" : "before"](newMounted[i].node);
        nodeStart = newMounted[i].node
      }
      mountedNode[dir === "right" ? "push" : "unshift"](...newMounted);
      prepaireNode[dir === "right" ? "push" : "unshift"](...newNode);
      return;
    }

    if (next.type === "delete") {
      if (next.dir !== undefined) {
        const dir = next.dir === "left" ? "shift" : "pop";
        if (Array.isArray(mountedNode) && mountedNode.length >= 2) {
          const nd = mountedNode[dir]();
          prepaireNode[dir]();
          nd.node.remove();
        } else if (Array.isArray(mountedNode) && mountedNode.length === 1) {
          const nd = mountedNode[dir]();
          const comment = document.createComment(` refA - ${parent.keyNode} `)

          nd.node.replaceWith(comment);
          mountedNode = comment;
          prepaireNode = null;
        }
      } else if (next.start !== undefined && next.count !== undefined) {
        if (Array.isArray(mountedNode) && next.start >= 0) {      
          const end = next.start !== mountedNode.length - 1 && next.start + next.count > mountedNode.length ? mountedNode.length : next.start + next.count;
          if (next.start !== mountedNode.length - 1 && end === mountedNode.length) {
            for(let i = 0; i !== end - 1; i++) {
              mountedNode[i].node.remove()
            }
            mountedNode.splice(0, end-1);
            const nd = mountedNode[0];

            const comment = document.createComment(` refA - ${parent.keyNode} `);

            nd.node.replaceWith(comment);
            mountedNode = comment;
            prepaireNode = null;
          } else {
            for(let i = next.start;i < end; i++) {
              mountedNode[i].node.remove();
            }

            mountedNode.splice(next.start, next.count);
            prepaireNode.splice(next.start, next.count);
          }
        }
      }


      if ((next.dir === undefined || next.dir !== "right") && Array.isArray(mountedNode)) {
        const prepaire = parseChildren(callback !== null ? item.value.map(callback) : item.value, null);

        for (let i = 0; i !== prepaire.length; i++) {
          if (!fastEqual(prepaire[i], prepaireNode[i])) {
            console.log("THIS", prepaire[i], prepaireNode[i])
          }
        }



        // const allNode = parseChildren(prepaire, null);
        // const mm = mounterChildren(null, allNode as InsertType[]);
        // let mounted: any = [];

        // while(mm.length > 0) {
        //   const item = mm.shift();

        //   if (Array.isArray(item)) {
        //     mm.unshift(...item);
        //   } else {
        //     mounted.push(item);
        //   }
        // }
        // let m = 0;
        // for (let i = 0; i !== mountedNode.length; i++) {
        //   if (!fastEqual(mountedNode[i], mounted[i])) {
        //     m++
        //     mountedNode[i].node.replaceWith(mounted[i].node) 
        //     mountedNode[i] = mounted[i]
        //   }
        // }
      }
      return;
    }

    if (next.type === "insertByIndex") {
      let start = 0;
      if(Array.isArray(mountedNode)) {
        start = next.start <= mountedNode.length - 1 ? next.start : mountedNode.length - 1;
      }
      
      const prepaire = callback !== null ? next.value.map((e: any, i: number) => callback(e, start + i)) : next.value;

      const newNode = parseChildren(prepaire, null);
      const mm = mounterChildren(null, newNode as InsertType[]);

      let newMounted: any = [];

      while(mm.length > 0) {
        const item = mm.shift();

        if (Array.isArray(item)) {
          mm.unshift(...item);
        } else {
          newMounted.push(item);
        }
      }

      if (Array.isArray(mountedNode)) {
        let nd = mountedNode[start].node;

        for (let i = 0; i !== newMounted.length; i++) {
          if (i === 0 && start !== mountedNode.length - 1) {
            nd.before(newMounted[i].node)
          } else {
            nd.after(newMounted[i].node);
          }
          nd = newMounted[i].node;
        }
        mountedNode.splice(start, 0, ...newMounted);
      }

      // if (Array.isArray(mountedNode)) {
      //   const prepaire = callback !== null ? item.value.map(callback) : item.value;
      //   const allNode = parseChildren(prepaire, null);
      //   const mm = mounterChildren(null, allNode as InsertType[]);

      //   let mounted: any = [];

      //   while(mm.length > 0) {
      //     const item = mm.shift();

      //     if (Array.isArray(item)) {
      //       mm.unshift(...item);
      //     } else {
      //       mounted.push(item);
      //     }
      //   }

      //   for (let i = 0; i !== mountedNode.length; i++) {
      //     if (!fastEqual(mountedNode[i], mounted[i])) {
      //       mountedNode[i].node.replaceWith(mounted[i].node) 
      //       mountedNode[i] = mounted[i]
      //     }
      //   }
      // }
    }

    if (next.type === "edit") {
      const prepaire = callback !== null ? callback(next.value, Number(next.key)) : next.value;
      const newNode = parseSingleChildren(null)(prepaire);
      const mm = mounterNode(null, newNode as any);

      if (mountedNode !== null && Array.isArray(mountedNode)) {
        if (!fastEqual(mountedNode[next.key], mm)) {
          mountedNode[next.key].node.replaceWith(mm.node);
          mountedNode[next.key] = mm;
        }
      }
    }
  });

*/

function fragmentWorker(mountedNode: any[]): any[] {
  let newMounted: any = [];

  while(mountedNode.length > 0) {
    const item = mountedNode.shift();

    if (Array.isArray(item)) {
      mountedNode.unshift(...item);
    } else {
      newMounted.push(item);
    }
  }

  return newMounted
}


function insertNodeInHtml(root: Element, nodes: any[]) {
  let startNode = root;

  for(let i = 0; i !== nodes.length; i++) {
    if (i === 0) {
      startNode.appendChild(nodes[i].node)
    } else {
      startNode?.after(nodes[i].node);
    }
    startNode = nodes[i].node;
  }
}

enum EtypeComment {
  append = "append",
  replace = "replace"
}

function createCommentAndInsert(root: Element, text: string, type: EtypeComment = EtypeComment.append) {
  const comment = document.createComment(` refA - ${text} `);

  switch (type) {
    case EtypeComment.append:
      root?.appendChild(comment);
      break;
    case EtypeComment.replace:
      root.replaceWith(comment);
      break;
  }

  return comment;
}

interface SettingNode {
  prepaire: Record<string, any> | null,
  mount: Record<string, any> | null
}

interface refaSubscribe {
  type: EtypeRefRequest,
}

interface RefAInsert extends refaSubscribe {
  dir: Dir,
  value: any,
}

interface RefAEdit extends refaSubscribe {
  key: string | number,
  value: any
}

interface RefADelete extends refaSubscribe {
  dir?: Dir,
  start?: number,
  count?: number,
  needCheck?: boolean
}

interface RefAInsertByIndex extends refaSubscribe {
  start: number,
  value: any[]
}

function RefArray(
    root: Element | null,
    item: RefA,
    parent: any = null,
    callback: ((a: any, b: number) => any) | null = null
  ) {
  let allInstruction: Comment | SettingNode[] | null = null;

  // Есть что отрисовывать
  if (item.value.length > 0) {
    const prepaireNodes: any[] = callback !== null ? item.value.map(callback) : item.value;

    const parserInstance = parseSingleChildren.call(null, null);
    const mounterInsance = singelMounterChildren(null);

    let startNode = root;

    allInstruction = prepaireNodes.map((e: Record<string, any>, index: number): SettingNode => {
      const m = {
        prepaire: e,
        mount: mounterInsance(parserInstance(e) as InsertType)
      }

      const insertNode = m.mount.node;

      if (startNode !== null) {
        startNode[ index === 0 ? "appendChild" : "after" ](insertNode);
        startNode = insertNode;
      } 
      return m;
    });

    if (allInstruction === null) return;

  } else if (item.value.length === 0) {
    const comment = document.createComment(` - refA - ${parent.keyNode} - `);

    if (root !== null) {
      root.appendChild(comment);
      allInstruction = comment;
    }
  }

  item.$sub.subscribe((next: refaSubscribe) => {
    if (Array.isArray(next)) return;

    // NOTE
    // Если было уже что-то отрисовано - [x]
    // Если до этого не было ничего отрисовано - [x] 
    if (next.type === EtypeRefRequest.insert) {
      const workObject = next as RefAInsert;
      // индекс которые будет отправлен в индекс.
      let startIndex = 0;
      // Если на экране сейчас есть какие-то инструкции.
      if (Array.isArray(allInstruction)) {
        startIndex = workObject.dir === Dir.right ? allInstruction.length : 0;

        const prepaire = callback !== null 
          ? workObject.value.map((item: any, i: number) => callback(item, startIndex + i)) 
          : workObject.value;

        const parserInstance = parseSingleChildren.call(null, null);
        const mounterInsance = singelMounterChildren(null);

        const instractionPrepaire: SettingNode[] = prepaire.map((item: Record<string, any>): SettingNode => {
          return {
            prepaire: item,
            mount: mounterInsance(parserInstance(item) as InsertType)
          }
        });

        // добавим все ноды которые получили сначала в DOM потом в массив всех инструкций.
        // Получим для начала ноду с которой изначально будем работать

        const startInstraction = workObject.dir === Dir.right ? allInstruction[allInstruction.length - 1] : allInstruction[0];

        if (startInstraction.mount !== null) {
          let startNode = startInstraction.mount.node;
          instractionPrepaire.forEach((newNode: SettingNode) => {
            if (newNode.mount !== null) {
              startNode[workObject.dir === Dir.right ? "after" : "before"](newNode.mount.node)
              startNode = newNode.mount.node;
            }
          })
        }

        // Заполнили DOM новыми нодами, теперь нужно проверить остальные ноды, на изменения.
        // Я буду проверять ноды по порядку, если пойму что нода отличается тогда поменяю местами новую ноду со старой

        // На этот момент item.value ещё не заполнился данными а значит я смогу просто определить, есть что-то или нет.
        // смотрю на элементы и проверяю схожи ли они с предыдущими элементами.

        // Если элементы были добавлены в начало, значит, надо индексы поменять в остальных элементах.
        const admixture = workObject.dir === Dir.left ? workObject.value.length : 0;

        const rebuildAllNode = callback !== null 
          ? item.value.map((e: any, i: number) => callback(e, admixture + i)) 
          : item.value;
        
        
        rebuildAllNode.forEach((item: Record<string, any>, index: number) => {
          if (!compareObjects(item, (allInstruction as SettingNode[])[index].prepaire)){
            const newItem = {
              prepaire: item,
              mount: mounterInsance(parserInstance(item) as InsertType)
            };

            if (allInstruction !== null && Array.isArray(allInstruction)) {
              allInstruction[index].mount!.node.replaceWith(newItem.mount.node);
              allInstruction[index] = newItem;
            }            
          }
        })

        // Необходимо после перерисовок, дополнить массив новыми данными.
        allInstruction[workObject.dir === Dir.right ? "push" : "unshift"](...instractionPrepaire);
      } else if (allInstruction !== null) {
        // Значит до этого ничего не было отображено.
        const prepaire = callback !== null ? workObject.value.map(callback) : workObject.value;
        
        const parserInstance = parseSingleChildren.call(null, null);
        const mounterInsance = singelMounterChildren(null);

        let startNode = allInstruction;

        allInstruction = prepaire.map((item: any, index: number) => {
          const m = {
            prepaire: item,
            mount: mounterInsance(parserInstance(item) as InsertType)
          }

          startNode[index === 0 ? "replaceWith": "after"](m.mount.node);
          startNode = m.mount.node;
          return m;
        })
      }
    }

    // NOTE
    // *Хз мб придётся обнолять весь список, при изменение.
    if (next.type === EtypeRefRequest.edit) {
      if (allInstruction !== null && Array.isArray(allInstruction)) {
        const workObject = next as RefAEdit;

        const key = parseInt(String(workObject.key), 10);

        const beforeInstriction = allInstruction[key];

        // подготовим будущую Node чтобы с ней работать.
        const prepaire = callback !== null ? callback(workObject.value, key) : workObject.value;

        if (!compareObjects(prepaire, beforeInstriction.prepaire)) {
          const parserInstance = parseSingleChildren.call(null, null);
          const mounterInsance = singelMounterChildren(null);

          const m = {
            prepaire: prepaire, 
            mount: mounterInsance(parserInstance(prepaire) as InsertType) 
          }

          allInstruction[key].mount!.node.replaceWith(m.mount.node);
          allInstruction[key] = m;
        }

        /* NOTE
          Если честно хз, нужно ли делать так, чтобы даже при таком раскладе проверять все остальные ноды.
          Тип вдруг какой-то чел решит взять и поставить зависимость от одного элемента в другом.
          Это пиздец, но такое может быть.
        */
      }
    }

    if (next.type === EtypeRefRequest.delete) {
      const workObject = next as RefADelete;

      if (workObject.needCheck === undefined) { workObject.needCheck = true; }

      // Это значит тут или shift или pop был.
      if (workObject.dir !== undefined) {
        // в таком случаи мы должны удалить первый или последйни элемент.
        if (allInstruction !== null && Array.isArray(allInstruction)) {

          // Если список инструкций на момент работы больше чем 1 элемент, значит
          // нам не надо менять инструмент на комент.
          const countArrayBefore = allInstruction.length;
          const item = allInstruction[workObject.dir === Dir.right ? "pop" : "shift"]();
          if (countArrayBefore > 1) {
            item?.mount?.node.remove();
          } else {
            const comment = createCommentAndInsert(item?.mount?.node, parent.keyNode, EtypeComment.replace);
            allInstruction = comment;
          }
        }
      }

      // Если нет dir, значит там есть start и count
      if (workObject.start !== undefined && workObject.count !== undefined) {
        // если мы сюда попали, значит в count точно нет 0.

        let removeAll = false;

        if (workObject.start === 0 && Array.isArray(allInstruction) && workObject.count >= allInstruction.length) {
          removeAll = true;
        }

        if (!removeAll) {
          // Тут удаляют не всё.
          // для начала удалю все node
          if (Array.isArray(allInstruction)) {
            for(let i = workObject.start; i !== workObject.start + workObject.count; i++) {
              allInstruction[i].mount?.node.remove();
            }

            // Теперь почистим сам массив
            allInstruction.splice(workObject.start, workObject.count);
          }
        } else {
          // тут значит, что выписали слишком много элементов, и надо удалить все и оставить комент.
          // удалим все элементы.
          if (Array.isArray(allInstruction)) {
            const replacedIntruction = allInstruction.shift();

            allInstruction.forEach((item) => {
              item.mount?.node.remove();
            });

            const comment = createCommentAndInsert(replacedIntruction?.mount!.node, parent.keyNode, EtypeComment.replace);
            allInstruction = comment;
          }
        }
      }

      // Теперь нужно проверить есть ли что-то для перерисовок.
      // Если там комент или null то смысла в этом нет)
      if (workObject.needCheck && Array.isArray(allInstruction)) {
        const prepaire = callback !== null 
        ? item.value.map(callback) 
        : item.value;

        const parserInstance = parseSingleChildren.call(null, null);
        const mounterInsance = singelMounterChildren(null);

        prepaire.forEach((e:Record<string, any>, index: number) => {
          if (!compareObjects(e, (allInstruction as SettingNode[])[index].prepaire)) {
            const newItem = {
              prepaire: e,
              mount: mounterInsance(parserInstance(e) as InsertType)
            };

            if (allInstruction !== null && Array.isArray(allInstruction)) {
              allInstruction[index].mount!.node.replaceWith(newItem.mount.node);
              allInstruction[index] = newItem;
            }
          }
        })
      }
    }

    // TODO нужна проверка на то, если там комент, или если там ввел кто-то
    // что-то тип [1,2,3] а user вводит start 0, 123 или 12312, 1231
    if (next.type === EtypeRefRequest.insertByIndex) {
      const workObject = next as RefAInsertByIndex;

      // Тут если элементы есть, значит ищем элемент
      // и дополняем его нодами новыми.
      if (Array.isArray(allInstruction)) {
        const prepaire = callback !== null 
          ? workObject.value.map((e, i) => callback(e, workObject.start + i)) 
          : workObject.value;

        const parserInstance = parseSingleChildren.call(null, null);
        const mounterInsance = singelMounterChildren(null);

        let startInstruction = allInstruction[workObject.start];
        let isThisLastItem = false;

        // Если инструкция возвращается undefined, значит будем работать с последним элементом
        if (startInstruction === undefined) {
          startInstruction = allInstruction[allInstruction.length - 1];
          isThisLastItem = true;
        }

        let startNode = startInstruction.mount!.node;
        const newInstruction = prepaire.map((e, index) => {
          const m = {
            prepaire: e,
            mount: mounterInsance(parserInstance(e) as InsertType)
          }

          if (index === 0 && isThisLastItem) {
            startNode.after(m.mount.node);
          } else {
            startNode[index === 0 ? "before" : "after"](m.mount.node);
          }
          startNode = m.mount.node

          return m;
        });

        allInstruction.splice(workObject.start, 0, ...newInstruction)
        

        if (Array.isArray(allInstruction)) {
          const prepaire = callback !== null 
          ? item.value.map(callback) 
          : item.value;
  
          const parserInstance = parseSingleChildren.call(null, null);
          const mounterInsance = singelMounterChildren(null);
  
          prepaire.forEach((e:Record<string, any>, index: number) => {
            if (!compareObjects(e, (allInstruction as SettingNode[])[index].prepaire)) {
              const newItem = {
                prepaire: e,
                mount: mounterInsance(parserInstance(e) as InsertType)
              };
  
              if (allInstruction !== null && Array.isArray(allInstruction)) {
                allInstruction[index].mount!.node.replaceWith(newItem.mount.node);
                allInstruction[index] = newItem;
              }
            }
          })
        }
      }
    }
  })
}


export { textNodeCreator, htmlNodeCreate, RefChildCreator, RefFormateChildCreator, RefArray }

