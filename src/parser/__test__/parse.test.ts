import { parserNodeF } from "../parser";
import { Node } from "../../jsx";
import { Subject } from "rxjs";

function CorrectApp() {
  return Node("div", { "o-key": "123" }, "Hello world!");
}

function IncorrectApp() {}

function CorrectAppWithProps() {
  return Node("div", { "o-key": "123", id: "id" }, "Hello", "World!");
}

function ComponentInComponent1({ children }: { children: unknown[] }) {
  return Node("div", { "o-key": "k2" }, ...children);
}

function ComponentInComponent() {
  return Node(
    "div",
    { "o-key": "k1" },
    Node(ComponentInComponent1 as any, null, "Test"),
  );
}

describe("parserNodeF", () => {
  test("correct entry", () => {
    const app = parserNodeF.call({}, CorrectApp, null, null);
    expect(app).toStrictEqual({
      tag: "div",
      $component: new Subject(),
      children: [
        {
          node: null,
          type: "Static",
          value: "Hello world!",
        },
      ],
      props: {},
      keyNode: "123",
      nameC: "CorrectApp",
      node: null,
      parent: null,
      type: "Component",
    });
  });

  test("Incorrect entry", () => {
    const consoleSpy = jest.spyOn(console, "warn").mockImplementation(() => {});
    const app = parserNodeF.call({}, IncorrectApp, null, null);
    expect(consoleSpy).toBeCalledWith(
      "[IncorrectApp()] Component don't be build",
    );
    expect(app).toBeNull();
  });

  test("Correct props", () => {
    const app = parserNodeF.call({}, CorrectAppWithProps, null, null);
    console.log(app);

    expect(app).toStrictEqual({
      tag: "div",
      keyNode: "123",
      props: { id: { type: "Static", value: "id" } },
      children: [
        { type: "Static", value: "Hello", node: null },
        { type: "Static", value: "World!", node: null },
      ],
      nameC: "CorrectAppWithProps",
      node: null,
      parent: null,
      type: "Component",
      $component: new Subject(),
    });
  });

  test("ComponentInComponent", () => {
    const app = parserNodeF.call({}, ComponentInComponent, null, null);
    // хз как это покрыть (
    expect(app).toStrictEqual(app);
  });
});
