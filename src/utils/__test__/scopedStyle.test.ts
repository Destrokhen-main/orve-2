import { scopedStyle } from "../scopedStyle";

describe("scopedStyle", () => {
  beforeEach(() => {
    document.head.querySelector("style[orve='']")?.remove();
  });
  test("Create scoped style - 1", () => {
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

  test("Create scoped style - 2", () => {
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
});
