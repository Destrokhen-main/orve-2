import { genUID } from "../";

describe("Test generation function", () => {
  test("create gen-8", () => {
    const id = genUID(8);

    expect(id.length).toBe(8);
  });

  test("create gen-12", () => {
    const id = genUID(12);

    expect(id.length).toBe(12);
  });

  test("create 2 gen-8 and equal it", () => {
    const id1 = genUID(8);
    const id2 = genUID(8);
    expect(id1).not.toBe(id2);
  });
});
