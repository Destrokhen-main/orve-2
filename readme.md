<h1 align="center">ORVE</h1>

Library for creating reactive SPA applications

```javascript
import { ref, orveCreate, computed, If, For } from "orve";

function Component() {
  const r = ref(0);
  const b = computed(() => r.value * 2)

  return (
      <div>
        <If rule={() => r.value > 2}>
          <div o-if={true}>
            now you see me
          </div>
        </If>

        <For each={b}>
          {
            (_, i) => {
              return <div>{i + 1}</div>
            }
          }
        </For>

        <p>{r}</p>
        <p>{b}</p>
        <button
          onClick={() => { r.value += 1; }}
        >
          Click
        </button>
      </div>
    )
}

const app = orveCreate();
app.createApp(App)
app.mount("#app");
```
