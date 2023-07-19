export enum ReactiveType {
  Ref = "Ref",
  RefFormater = "RefFormater",

  RefA = "RefA",
  RefArrFor = "RefArrFor",

  RefO = "RefO"
}

export interface Reactive {
  type: ReactiveType
}