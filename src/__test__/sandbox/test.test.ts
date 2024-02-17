import { DifferentItems } from "../../utils/DiffArray";
import { ref, computed } from "../../index";

describe("Тестирование", () => {
  test("Проверка реактивности", () => {
    const a = ref<number>(1);
    const b = ref<number>(2);

    const c = computed<number>(() => a.value + b.value, [a, b]);
    expect(c.value).toBe(3);
    a.value += 1;
    expect(c.value).toBe(4);
  });

  test.only("тест", () => {
    const a = [1, 2, 3, 4];
    const b = [1, 2, 4, 5];

    const a1: any[] = [];
    const b1 = [1, 2, 3];

    const a2 = [1];
    const b2 = [2, 1, 3];
    expect(DifferentItems(a, b)).toStrictEqual([
      { type: "modify", index: 2 },
      { type: "modify", index: 3 },
    ]);
    expect(DifferentItems(a1, b1)).toStrictEqual([
      { type: "new", index: 0 },
      { type: "new", index: 1 },
      { type: "new", index: 2 },
    ]);
    expect(DifferentItems(a2, b2)).toStrictEqual([
      { type: "modify", index: 0 },
      { type: "new", index: 1 },
      { type: "new", index: 2 },
    ]);
  });
});
