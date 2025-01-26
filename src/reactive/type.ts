export enum ReactiveType {
  Ref = "Ref",
  RefFormater = "RefFormater",

  RefA = "RefA",
  RefArrFor = "RefArrFor",

  RefO = "RefO",

  Oif = "Oif",
  Component = "Component",

  RefC = "RefC",
  RefCComponent = "RefCComponent",

  RefComputed = "RefComputed",
}

export interface Reactive {
  type: ReactiveType;
}
