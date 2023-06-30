import { Subject, pairwise, startWith } from "rxjs";

interface Dep {
  [T: string] : any,
  $sub: Subject<any>
}

function watch(func: (n: any, o: any) => void, dep: Dep) {
  if (typeof dep !== "object" || dep === null) {
    console.warn("Dep is bad")
    return false;
  }

  if (dep.$sub !== undefined) {
    const cur: any = dep
      .$sub
      .pipe(startWith(undefined),pairwise())
      .subscribe(
        ([b, c] : any) => func(c, b)
      );
    return () => cur.complete();
  } else {
    console.warn("Dep is bad")
    return false;
  }
}

export { watch };