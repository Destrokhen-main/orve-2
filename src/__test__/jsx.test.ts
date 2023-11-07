import { Node, Fragment } from "../jsx";
import { FRAGMENT } from "../keys";

describe("jsx", () => {
  test("div element", () => {
    const div = Node("div", null, "test");
    expect(div).toStrictEqual({
      tag: "div",
      children: ["test"],
    });
  });

  test("div element with id", () => {
    const div = Node("div", { id: "test" }, "test");

    expect(div).toStrictEqual({
      tag: "div",
      props: { id: "test" },
      children: ["test"],
    });
  });

  test("unknow tag", () => {
    const unkhowTag = Node("asd", null, "test");

    expect(unkhowTag).toStrictEqual({
      tag: "asd",
      children: ["test"],
    });
  });

  test("Tag width o-element", () => {
    const div = Node(
      "div",
      {
        "o-hooks": {},
        "o-ref": {},
        "o-key": 123,
      },
      "test",
    );

    expect(div).toStrictEqual({
      tag: "div",
      keyNode: "123",
      props: {},
      hooks: {},
      ref: {},
      children: ["test"],
    });
  });

  test("tag with any children", () => {
    const div = Node("div", null, "test", "test-1");

    expect(div).toStrictEqual({
      tag: "div",
      children: ["test", "test-1"],
    });
  });

  test("tag width Component", () => {
    const Component = () => ({ tag: "div" });

    const node = Node(Component, { test: "123" }, "test");
    expect(node).toStrictEqual({
      tag: Component,
      props: { test: "123" },
      children: ["test"],
    });
  });

  test("Fragment empty", () => {
    const fragment = Fragment(null, null);

    expect(fragment).toStrictEqual({
      tag: FRAGMENT,
      children: [],
    });
  });

  test("Fragment with div", () => {
    const fragment = Fragment(null,
      { tag: "div", children: ["test"] }
    );

    expect(fragment).toStrictEqual({
      tag: FRAGMENT,
      children: [
        {
          tag: "div",
          children: ["test"],
        },
      ],
    });
  });

  test("Component with template", () => {
    const Component = () => { };

    const div = Node(Component, null, Node(FRAGMENT, { name: "default" }, "test"));

    expect(div).toStrictEqual({
      tag: Component,
      props: {
        slot: {
          default: ["test"],
        },
      },
    });
  });

  test("Component with template default and custome", () => {
    const Component = () => { };

    const div = Node(
      Component,
      { id: "123" },
      Node(FRAGMENT, { name: "test" }, "test"),
      Node(FRAGMENT, { name: "default" }, "test"),
    );
    expect(div).toStrictEqual({
      tag: Component,
      props: {
        id: "123",
        slot: {
          default: ["test"],
          test: ["test"],
        },
      },
    });
  });

  test("Component without template - just test", () => {
    const Component = () => { };

    const div = Node(Component, { test: "123" }, "test", "test-2");
    expect(div).toStrictEqual({
      tag: Component,
      props: { test: "123" },
      children: ["test", "test-2"],
    });
  });

  test("Div with template", () => {
    const div = Node("div", null, Node(FRAGMENT, null, "test"));
    expect(div).toStrictEqual({
      tag: "div",
      children: [
        {
          tag: FRAGMENT,
          children: ["test"]
        }
      ]
    });
  });

  test("Rewrite template in component", () => {
    const Component = () => { };

    const node = Node(
      Component,
      null,
      Node(FRAGMENT, { name: "default" }, "before"),
      Node(FRAGMENT, { name: "default" }, "after"),
    );

    expect(node).toStrictEqual({
      tag: Component,
      props: {
        slot: {
          default: ["after"],
        },
      },
    });
  });

  test("Component with simple fragment", () => {
    const Component = () => { };

    const node = Node(
      Component,
      null,
      Node(FRAGMENT, null, "before"),
    );

    expect(node).toStrictEqual({
      tag: Component,
      children: [{
        tag: FRAGMENT,
        children: ["before"]
      }]
    });
  });

  test("Fragment-slot with component", () => {
    const Comp = () => { };

    const div = Node(Comp, null, Fragment({ name: '1' }, "a"));
    expect(div).toStrictEqual({
      tag: Comp,
      props: {
        slot: {
          "1": ["a"]
        }
      }
    });
  });

  test("class prop", () => {
    const div = Node("div", { class: 1 }, "Hello");
    expect(div).toStrictEqual({
      tag: 'div',
      props: {
        oclass: 1,
      },
      children: ["Hello"]
    });
  });
});
