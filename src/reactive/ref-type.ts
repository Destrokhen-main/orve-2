import { BehaviorSubject } from "rxjs";
import { Reactive, ReactiveType } from "./type";

export type refInput = string | number | (() => any);

export interface Ref extends Reactive {
  value: refInput;
  $sub: any;
  formate: (func: (e: any) => any) => any;
  node?: any;
}

export interface RefA extends Reactive {
  value: unknown[] | null;
  $sub: any;
  for: (func: (item: unknown, index: number) => unknown) => RefAFormater;
}

export interface RefO extends Reactive {
  $sub: BehaviorSubject<unknown>;
  value: Record<string, unknown> | null;
}

export interface RefOF extends Reactive {
  key: string;
  value: RefO;
}

export interface RefFormater {
  type: ReactiveType;
  value: (e: any) => any;
  parent: any;
}

export interface RefAFormater {
  type: ReactiveType;
  value: (item: unknown, index: number) => unknown;
  parent: any;
}

export type RefOGet = {
  type: ReactiveType;
  isDefined: boolean;
  proxy: RefO;
  key: string | symbol;
};

export type RefOSet = {
  type: ReactiveType;
  key: string | symbol;
  value: unknown;
};
