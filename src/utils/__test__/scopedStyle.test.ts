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
    expect(style).toMatch(/.test {color:white;}/gm);
  });
});
