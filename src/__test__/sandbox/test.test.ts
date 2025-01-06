import { orveCreate, ref, Node, computed } from "../../index";
import { nextTick } from "../../utils/line";

describe("Global tests", () => {
  beforeEach(() => {
    document.body.innerHTML = "<div id='app'></div>";
  });

  test("create app and check exist it on the document", () => {
    function App() {
      return Node("div", { id: "main" }, ["Hello world"]);
    }

    const instance = orveCreate();
    instance.createApp(App).mount("#app");
    expect(document.getElementById("main")?.textContent).toBe("Hello world");
  });
  test("create app and ref and chec what it update", async () => {
    let a;
    function App() {
      a = ref(1);
      return Node("div", { id: "main" }, [a]);
    }

    const instance = orveCreate();
    instance.createApp(App).mount("#app");
    expect(document.getElementById("main")?.textContent).toBe("1");

    a!.value = 2;
    await nextTick();

    expect(document.getElementById("main")?.textContent).toBe("2");
  });
  test("create app and computed and chec what it update", async () => {
    let a;
    function App() {
      a = ref(1);
      const b = computed(() => a!.value);
      return Node("div", { id: "main" }, [b]);
    }

    const instance = orveCreate();
    instance.createApp(App).mount("#app");
    expect(document.getElementById("main")?.textContent).toBe("1");

    a!.value = 2;
    await nextTick();

    expect(document.getElementById("main")?.textContent).toBe("2");
  });

  test("ref and computed in attrs", async () => {
    let a;
    function App() {
      a = ref(1);
      const b = computed(() => a!.value);
      return Node("div", { id: "main", attr1: a, attr2: b }, ["test"]);
    }

    const instance = orveCreate();
    instance.createApp(App).mount("#app");
    expect(document.getElementById("main")?.getAttribute("attr1")).toBe("1");
    expect(document.getElementById("main")?.getAttribute("attr2")).toBe("1");

    a!.value = 2;
    await nextTick();

    expect(document.getElementById("main")?.getAttribute("attr1")).toBe("2");
    expect(document.getElementById("main")?.getAttribute("attr2")).toBe("2");
  });
});
