import { Subject, fromEvent, map, pairwise, share, startWith } from "rxjs";
import { ref } from "./test"

const root = document.querySelector("#app");


function watch(func: any, dep: any) {
  const watch = dep.sub$.pipe(pairwise()).subscribe(([a,b]: any[]) => func(a, b));

  return () => { watch.complete() };
}


function helper() {
  const v = ref("1");

  const un = watch((n: any, o: any) => { console.log(n, o)}, v);


  const div = document.createElement('div');

  const textNode = document.createTextNode(v.value);

  v.sub$.subscribe(( newValue : any) => {
    textNode.textContent = newValue
  })

  fromEvent(div, "click").subscribe(() => { 
    v.value += v.value.length + 1;
    un();
  })

  div.appendChild(textNode);
  root?.appendChild(div);
}


const r = (obj: any) => {
  const o = {
    ...obj,
    sub$: new Subject().pipe(startWith(obj), share())
  }

  return new Proxy(o, {});
}

function obj() {
  const ob = r({});

  const div = document.createElement("div");
  let textNode;

  ob.sub$.pipe(pairwise(), map(([p, c]) => {
    console.log(p, c);
    const C = { ...c };

    Object.keys(p).forEach((el: any) => {
      delete C[el];
    });

    return C;
  })).subscribe((x: any) => console.log(x));

  if (ob.key) {
    textNode = document.createTextNode(ob.key)
  } else {
    textNode = document.createComment(` key `);
  }

  div.appendChild(textNode);

  const but = document.createElement('button');
  but.innerText = "TEST";

  div.appendChild(but);
  fromEvent(but, "click").subscribe((n) => {
    ob.key = "asd";
    ob.sub$.next(ob);
  })
  root?.appendChild(div);
}

export { helper, obj };