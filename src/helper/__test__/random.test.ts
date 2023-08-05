import { randInt } from "../";

describe("Test random", () => {
  test("random min === max", () => {
    const ind = randInt(1, 1);

    expect(ind).toBe(1);
  });

  test("random min > max", () => {
    const ind = randInt(10, 1);

    expect(ind).toBeLessThan(11);
    expect(ind).toBeGreaterThan(0);
  });

  test("random min < max", () => {
    const ind = randInt(1, 5);

    expect(ind).toBeLessThan(6);
    expect(ind).toBeGreaterThan(0);
  });
});
