import { Dir, EtypeRefRequest } from "../reactive/refHelper";

export enum EtypeComment {
  append = "append",
  replace = "replace",
}

export interface SettingNode {
  prepaire: Record<string, any> | null;
  mount: Record<string, any> | null;
}

export interface refaSubscribe {
  type: EtypeRefRequest;
}

export interface RefAInsert extends refaSubscribe {
  dir: Dir;
  value: any;
}

export interface RefAEdit extends refaSubscribe {
  key: string | number;
  value: any;
}

export interface RefADelete extends refaSubscribe {
  dir?: Dir;
  start?: number;
  count?: number;
  needCheck?: boolean;
}

export interface RefAInsertByIndex extends refaSubscribe {
  start: number;
  value: any[];
}
