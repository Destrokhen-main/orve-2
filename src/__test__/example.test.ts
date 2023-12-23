import { ref, computed } from "../index";

describe("Тестовые кейсы", () => {
  test("Проверка a + b = c", () => {
    const a = ref(10);
    const b = ref(20);
    const c = computed(() => a?.value + b?.value, [a, b]);

    expect(c?.value).toBe(30);

    (a as any).value += 10;
    expect(c?.value).toBe(40);
  });
});
