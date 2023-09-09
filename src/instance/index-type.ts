import { JSX } from "../jsx-type";
import { OptionsInstance, CreateApp } from "../parser/index-type";
import { NodeOP } from "../parser/parser-type";

export interface OrveInstance {
  tree: NodeOP | null;
  context: {
    globalComponents?: Record<string, () => unknown>;
    [T: string]: any;
  };
  use: (obj?: unknown) => boolean | OrveInstance;
  component: (nameComponent: string, component: () => unknown) => void;
  createApp: (
    entry: unknown,
    options: OptionsInstance | null,
  ) => CreateApp | null;
}

declare global {
  interface Window {
    Orve: Record<string, OrveInstance>;
    orve: JSX;
  }
}
