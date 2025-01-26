import { scopedStyle } from "../scopedStyle";

describe("scopedStyle", () => {
  beforeEach(() => {
    const items = document.head.querySelectorAll("style[orve='']");
    for (let i = 0; i !== items.length; i++) {
      items[i].remove();
    }
  });

  test("Create scoped style - one key", () => {
    scopedStyle({
      test: {
        color: "white",
      },
    });
    const doc = document.head;

    const style = doc.querySelector("style")?.innerHTML;
    expect(style).toMatch(/test/gm);
    expect(style).toMatch(/{color:white;}/gm);
  });

  test("Create scoped style - two key", () => {
    scopedStyle({
      m: {
        color: "white",
      },
    });

    scopedStyle({
      test: {
        color: "black",
      },
    });
    const doc = document.head;
    const style = doc.querySelector("style")?.innerHTML;
    expect(style).toMatch(/test/gm);
    expect(style).toMatch(/{color:white;}/gm);
    expect(style).toMatch(/{color:black;}/gm);
  });

  test("Create unscoped style", () => {
    scopedStyle(
      {
        test: {
          color: "white",
        },
      },
      { scoped: false },
    );

    const doc = document.head;
    const style = doc.querySelector("style")?.innerHTML;
    expect(style).toMatch(".test {color:white;}");
  });

  test("Check scoped object", () => {
    const object = scopedStyle({
      m: {
        color: "white",
      },
    });

    const doc = document.head;
    const style = doc.querySelector("style")?.innerHTML;
    expect(style).toMatch(/m/gm);

    expect(Object.keys(object).length === 1).toBe(true);
    expect(object["m"]).toBeDefined();
  });

  test("Check scoped style with more that one key", () => {
    // Тоже будет работать для scoped
    const styles = scopedStyle(
      {
        ".class-1, .class-2": { color: "black" },
        "#test-1, .class-3": { color: "white" },
      },
      { scoped: false },
    );

    const doc = document.head;
    const style = doc.querySelector("style")?.innerHTML;

    expect(Object.keys(styles).length).toBe(4);
    expect(Object.keys(styles).some((e) => e.startsWith("#"))).toBe(true);
    expect(style).toMatch(
      `.class-1, .class-2 {color:black;}\n#test-1, .class-3 {color:white;}`,
    );
  });

  test("returns an empty object and logs a warning when styles is not an object", () => {
    const mock = jest.fn();
    console.warn = mock;
    const styles = "invalid styles";
    const result = scopedStyle(styles as any);
    expect(result).toEqual({});
    expect(mock).toHaveBeenCalledTimes(1);
  });
});
