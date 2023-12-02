import { Node } from '../../jsx'
import { recursiveNode } from '../parser';

describe('recursiveNode', () => {
  test('первый уровень погружения', () => {
    const Component1 = function () {
      return Node('div', null, 'HELLO WORLD');
    };

    const Component = {
      tag: Component1,
    };

    const result = recursiveNode(Component);

    expect(result).toStrictEqual({ tag: 'div', children: ['HELLO WORLD'] });
  });
  test('второй уровень погружения', () => {
    const Component2 = function () {
      return Node('div', null, 'HELLO WORLD');
    };

    const Component1 = function () {
      return Node(Component2);
    };

    const Component = {
      tag: Component1,
    };

    const result = recursiveNode(Component);

    expect(result).toStrictEqual({ tag: 'div', children: ['HELLO WORLD'] });
  });

  test('10000 погружения', () => {
    const Component1 = function ({ i }: any) {
      if (i === 10000) {
        return Node('div', null, 'HELLO WORLD');
      }

      return Node(Component1, { i: i + 1 });
    };

    const Component = {
      tag: Component1,
      props: { i: 0 },
    };

    const result = recursiveNode(Component);

    expect(result).toStrictEqual({ tag: 'div', children: ['HELLO WORLD'] });
  });

  test('Пере прокидование строки', () => {
    const TEST_STRING = "HELLO WORLD";

    const Component1 = function ({ str }: { str: string }) {
      if (str.length === TEST_STRING.length) {
        return Node('div', null, str);
      }

      return Node(Component1, { str: str + TEST_STRING[str.length] });
    };

    const Component = {
      tag: Component1,
      props: { str: "" },
    };

    const result = recursiveNode(Component as any);

    expect(result).toStrictEqual({ tag: 'div', children: ['HELLO WORLD'] });
  });
});
