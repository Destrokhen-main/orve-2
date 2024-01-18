import { ref, computed } from "../../index";

describe("Тестирование", () => {
  test('Проверка реактивности', () => {
    const a = ref(1);
    const b = ref(2);

    const c = computed(() => a.value + b.value, [a, b]);
    expect(c.value).toBe(3);
    a.value += 1;
    expect(c.value).toBe(4);
  });
});