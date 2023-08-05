export enum ReactiveType {
  Ref = "Ref",
  RefFormater = "RefFormater",

  RefA = "RefA",
  RefArrFor = "RefArrFor",

  RefO = "RefO",

  Oif = "Oif",

  RefC = "RefC",
  RefCComponent = "RefCComponent",
}

export interface Reactive {
  type: ReactiveType;
}
