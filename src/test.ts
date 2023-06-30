import { BehaviorSubject, Subject, pairwise, share, startWith } from "rxjs";


interface Ref {
  value: string
  sub$: any
}

function ref(val: unknown) {
  const obj: Ref = {
    value: val as string,
    sub$: new Subject().pipe(startWith(val)).pipe(share())
  };

  return new Proxy(obj, {
    get(t: Ref, p: (keyof Ref | string)) {
      if (p in t) {
        return t[p as keyof Ref];
      } else {
        return undefined
      }
    },
    set(t: Ref, p: keyof Ref, v: unknown) {
      if (p === "value") {
        t.sub$.next(v);
        t.value = v as any;
      }
      return true;
    }
  })
}


function refA(val: any) {
  const sub$ = new Subject().pipe(startWith(val));

  const obj = {
    value: val,
    sub$,
  }

  sub$.pipe(pairwise()).subscribe({
    next(x) {
      console.log(x);
    },
    complete() {
      console.log("DONE");
    } 
  });

  return new Proxy(obj, {
    get(t : any, p) {
      return t[p];
    },
    set(t: any, p: any, v: any) {
      if (p === "value") {
        t.sub$.next(v);
      }
      t[p] = v;
      return true
    }
  })
}

export { ref, refA }

function distinctUntilChanged(): any {
  throw new Error("Function not implemented.");
}
