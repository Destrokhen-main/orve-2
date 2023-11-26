import { prepareComponent } from "../parser";
import { Node } from "../../jsx";

describe("prepaireComponent", () => {
  test("Обычный компонент", () => {
    function Component() {
      return Node("div", { id: "1" }, "Hello world");
    }

    const result = prepareComponent(Component);

    expect(result).toStrictEqual({
      tag: "div",
      props: { id: "1" },
      children: ["Hello world"],
    });
  });

  test("Обычный компонент с пропсами", () => {
    function Component({ num }: { num: any }) {
      return Node("div", { id: num }, "Hello world");
    }

    const result = prepareComponent(Component as any, { num: 1 });

    expect(result).toStrictEqual({
      tag: "div",
      props: { id: 1 },
      children: ["Hello world"],
    });
  });

  test("Вернуть null", () => {
    function Component() {
      return null;
    }

    const result = prepareComponent(Component);
    expect(result).toBeNull();
  });

  test("Вернуть строку", () => {
    function Component() {
      return "HELLO";
    }

    const result = prepareComponent(Component);
    expect(result).toBeNull();
  });

  test("Вернуть undefined", () => {
    function Component() {
      return undefined;
    }

    const result = prepareComponent(Component);
    expect(result).toBeNull();
  });

  test("Вернуть ошибку", () => {
    jest.spyOn(console, "error").mockImplementation(() => {});

    function Component() {
      throw new Error("asd");
    }

    const result = prepareComponent(Component);
    expect(result).toBeNull();
  });

  test("Использую props", () => {
    function Component() {
      return Node("div", { id: 1 }, "HELLO WORLD");
    }

    Component.props = {
      id: {
        type: Number,
        default: 2,
        require: true,
      },
    };

    const result = prepareComponent(Component);
    expect(result).toStrictEqual({
      tag: Component,
      props: { $slot: {}, id: 2 },
    });
  });

  test("Использую hooks", () => {
    function Component() {
      return Node("div", { id: 1 }, "HELLO WORLD");
    }

    const hooks = {
      created() {},
    };

    Component.hooks = hooks;

    const result = prepareComponent(Component);

    expect(result).toStrictEqual({
      tag: "div",
      hooks: hooks,
      props: { id: 1 },
      children: ["HELLO WORLD"],
    });
  });
});
