import type { ReactElement, JSX as ReactJSX } from "react";

/* eslint-disable @typescript-eslint/no-namespace */
type Props = {
  $slots?: Record<string, any>;
  globalComponents?: Record<string, any>;
  [key: string]: any;
};

export type FCO<T extends Props = object> = (props: T) => ReactElement<T, any>;

declare global {
  namespace JSX {
    // Оставляем элемент как в React
    type Element = ReactJSX.Element;

    // Глобальные атрибуты для всех компонентов/элементов
    interface IntrinsicAttributes extends ReactJSX.IntrinsicAttributes {}

    interface ElementChildrenAttribute {
      // eslint-disable-next-line @typescript-eslint/ban-types
      children: {}; // не ограничиваем глобально тип детей
    }

    // Расширяем карту встроенных элементов из React
    interface IntrinsicElements extends ReactJSX.IntrinsicElements {
      "o-for": {
        items: readonly any[] | Iterable<any>;
        children: (item: any, index: number) => ReactJSX.Element;
      };
    }
  }
}
